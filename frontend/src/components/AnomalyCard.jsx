import { useState } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp, Info, Loader, Sparkles } from 'lucide-react'
import api from '../api'

function formatValue(value, metricDisplay) {
  const metric = (metricDisplay || '').toLowerCase()
  const isCurrency = metric.includes('revenue') || metric.includes('amount') ||
    metric.includes('total') || metric.includes('price') || metric.includes('sales')
  const num = Number(value)
  if (isCurrency) return `$${num.toLocaleString()}`
  return num.toLocaleString()
}

const SEVERITY = {
  High: {
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
    border: 'rgba(239,68,68,0.3)',
    badge: { background: 'rgba(239,68,68,0.2)', color: '#ef4444' },
    icon: <AlertTriangle size={15} style={{ color: '#ef4444' }} />
  },
  Medium: {
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    border: 'rgba(245,158,11,0.3)',
    badge: { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' },
    icon: <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
  },
  Low: {
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    border: 'rgba(99,102,241,0.3)',
    badge: { background: 'rgba(99,102,241,0.2)', color: '#6366f1' },
    icon: <Info size={15} style={{ color: '#6366f1' }} />
  }
}

export default function AnomalyCard({ anomaly, connectionName, darkMode }) {
  const config = SEVERITY[anomaly.severity] || SEVERITY.Low
  const isDrop = anomaly.direction === 'drop'
  const [explanation, setExplanation] = useState(anomaly.explanation || null)
  const [loadingExp, setLoadingExp] = useState(false)

  const dateDisplay = anomaly.date
    ? anomaly.date.split('T')[0].split(' ')[0]
    : 'Unknown'

  const handleExplain = async () => {
    setLoadingExp(true)
    try {
      const response = await api.post(`/anomalies/${connectionName}/explain`, anomaly)
      setExplanation(response.data.explanation)
    } catch {
      setExplanation('Could not generate explanation.')
    } finally {
      setLoadingExp(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5 border transition-all"
      style={{
        background: config.gradient,
        borderColor: config.border,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {config.icon}
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {anomaly.metric_display}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {anomaly.table} · {dateDisplay}
            </p>
          </div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ml-2"
          style={config.badge}
        >
          {anomaly.severity}
        </span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Actual</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatValue(anomaly.current_value, anomaly.metric_display)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isDrop
            ? <TrendingDown size={18} style={{ color: '#ef4444' }} />
            : <TrendingUp size={18} style={{ color: '#22c55e' }} />
          }
          <span
            className="font-bold text-sm"
            style={{ color: isDrop ? '#ef4444' : '#22c55e' }}
          >
            {anomaly.deviation_percent}%
          </span>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Expected</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-secondary)' }}>
            {formatValue(anomaly.expected_value, anomaly.metric_display)}
          </p>
        </div>
      </div>

      {/* Explanation */}
      {explanation ? (
        <div
          className="rounded-xl px-4 py-3 text-xs leading-relaxed mb-3"
          style={{
            background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)',
            color: 'var(--text-secondary)'
          }}
        >
          {explanation}
        </div>
      ) : (
        <button
          onClick={handleExplain}
          disabled={loadingExp}
          className="flex items-center gap-1.5 text-xs font-medium mb-3 transition-all hover:opacity-70 disabled:opacity-40"
          style={{ color: 'var(--accent)' }}
        >
          {loadingExp
            ? <><Loader size={11} className="animate-spin" /> Generating...</>
            : <><Sparkles size={11} /> Explain this anomaly</>
          }
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {anomaly.detection_method}
        </span>
        {anomaly.z_score && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Z-score: {anomaly.z_score}
          </span>
        )}
      </div>
    </div>
  )
}