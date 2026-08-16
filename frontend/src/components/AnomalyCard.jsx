import { AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react'

const SEVERITY_CONFIG = {
  High: {
    bg: 'bg-red-900/30',
    border: 'border-red-700',
    badge: 'bg-red-700 text-red-100',
    icon: <AlertTriangle size={16} className="text-red-400" />
  },
  Medium: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700',
    badge: 'bg-amber-700 text-amber-100',
    icon: <AlertTriangle size={16} className="text-amber-400" />
  },
  Low: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-700',
    badge: 'bg-blue-700 text-blue-100',
    icon: <Info size={16} className="text-blue-400" />
  }
}

// Decide whether to show $ sign based on metric name
function formatValue(value, metricDisplay) {
  const metric = metricDisplay.toLowerCase()
  const isCurrency = metric.includes('revenue') ||
    metric.includes('amount') ||
    metric.includes('total') ||
    metric.includes('price') ||
    metric.includes('sales')

  const num = Number(value)

  if (isCurrency) {
    return `$${num.toLocaleString()}`
  }
  return num.toLocaleString()
}

export default function AnomalyCard({ anomaly }) {
  const config = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.Low
  const isDrop = anomaly.direction === 'drop'

  const dateDisplay = anomaly.date
    ? anomaly.date.split('T')[0].split(' ')[0]
    : 'Unknown date'

  const explanation = anomaly.explanation
    ? anomaly.explanation.trim()
    : null

  const actualDisplay = formatValue(anomaly.current_value, anomaly.metric_display)
  const expectedDisplay = formatValue(anomaly.expected_value, anomaly.metric_display)

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {config.icon}
          <div>
            <p className="text-white font-medium text-sm">
              {anomaly.metric_display}
            </p>
            <p className="text-slate-400 text-xs">
              {anomaly.table} · {dateDisplay}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${config.badge}`}>
          {anomaly.severity}
        </span>
      </div>

      {/* Numbers */}
      <div className="flex items-center gap-6 mb-3">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Actual</p>
          <p className="text-white font-bold text-xl">
            {actualDisplay}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isDrop ? (
            <TrendingDown size={20} className="text-red-400" />
          ) : (
            <TrendingUp size={20} className="text-green-400" />
          )}
          <span className={`font-bold text-sm ${isDrop ? 'text-red-400' : 'text-green-400'}`}>
            {anomaly.deviation_percent}%
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Expected</p>
          <p className="text-slate-300 font-medium text-xl">
            {expectedDisplay}
          </p>
        </div>
      </div>

      {/* AI Explanation */}
      {explanation && (
        <div className="bg-slate-900/60 rounded-lg px-3 py-2 mb-2">
          <p className="text-slate-300 text-xs leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-500">
          {anomaly.detection_method}
        </span>
        {anomaly.z_score && (
          <span className="text-xs text-slate-500">
            Z-score: {anomaly.z_score}
          </span>
        )}
      </div>

    </div>
  )
}