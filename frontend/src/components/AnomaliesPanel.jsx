import { useState, useEffect } from 'react'
import { Shield, Loader, RefreshCw, AlertTriangle } from 'lucide-react'
import { getAnomalies } from '../api'
import AnomalyCard from './AnomalyCard'
import RevenueTrendChart from './RevenueTrendChart'

export default function AnomaliesPanel({ connectionName, darkMode }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const loadAnomalies = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getAnomalies(connectionName, true)
      setData(result)
    } catch {
      setError('Could not load anomalies. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnomalies() }, [connectionName])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)' }}
        >
          <Shield size={28} className="text-white animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            Sentris is scanning your database
          </p>
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            Running anomaly detection across all tables and columns
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            AI explanations for top 5 anomalies — takes 10-15 seconds
          </p>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: 'var(--accent)',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: 'rgba(239,68,68,0.08)',
          borderColor: 'rgba(239,68,68,0.2)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          <span className="font-semibold text-sm" style={{ color: '#ef4444' }}>
            Scan failed
          </span>
        </div>
        <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>
        <button
          onClick={loadAnomalies}
          className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <RefreshCw size={12} /> Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            Anomaly Detection
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {data?.tables_scanned} tables · {data?.columns_scanned} columns scanned
          </p>
        </div>
        <button
          onClick={loadAnomalies}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-70"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)'
          }}
        >
          <RefreshCw size={13} /> Rescan
        </button>
      </div>

      {/* Revenue Chart */}
      <RevenueTrendChart connectionName={connectionName} darkMode={darkMode} />

      {/* Severity Cards */}
      {data && data.total_anomalies > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'High', count: data.severity_breakdown.high, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
            { label: 'Medium', count: data.severity_breakdown.medium, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
            { label: 'Low', count: data.severity_breakdown.low, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
          ].map(({ label, count, color, bg, border }) => (
            <div
              key={label}
              className="rounded-2xl p-5 text-center border"
              style={{ background: bg, borderColor: border }}
            >
              <p className="text-4xl font-bold mb-1" style={{ color }}>{count}</p>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* All Clear */}
      {data && data.total_anomalies === 0 && (
        <div className="text-center py-20">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)' }}
          >
            <Shield size={36} className="text-white" />
          </div>
          <p className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
            All clear
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No anomalies detected across {data.tables_scanned} tables
          </p>
        </div>
      )}

      {/* Scan method */}
      {data && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {data.scan_method}
        </p>
      )}

      {/* Anomaly Cards */}
      {data && data.anomalies && data.anomalies.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {data.total_anomalies} anomalies detected
            {data.total_anomalies > 5 && (
              <span className="font-normal ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                (AI explanations for top 5)
              </span>
            )}
          </p>
          {data.anomalies.map((anomaly, i) => (
            <AnomalyCard
              key={i}
              anomaly={anomaly}
              connectionName={connectionName}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}

    </div>
  )
}