import { useState, useEffect } from 'react'
import { Shield, Loader, RefreshCw, AlertTriangle } from 'lucide-react'
import { getAnomalies } from '../api'
import AnomalyCard from './AnomalyCard'
import RevenueTrendChart from './RevenueTrendChart'

export default function AnomaliesPanel({ connectionName }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const loadAnomalies = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getAnomalies(connectionName, true)
      setData(result)
    } catch (err) {
      setError('Could not load anomalies. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnomalies()
  }, [connectionName])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader size={36} className="animate-spin text-teal-400" />
        <div className="text-center">
          <p className="text-white font-medium mb-1">
            Sentris is scanning your database
          </p>
          <p className="text-slate-400 text-sm">
            Running anomaly detection across all tables and columns
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Generating AI explanations for top 10 anomalies — takes 20-30 seconds
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-400 mb-1">
          <AlertTriangle size={16} />
          <span className="font-medium text-sm">Scan failed</span>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-teal-400" size={22} />
          <div>
            <h2 className="text-white font-semibold">Anomaly Detection</h2>
            <p className="text-slate-400 text-xs">
              {data?.tables_scanned} tables · {data?.columns_scanned} columns scanned
            </p>
          </div>
        </div>
        <button
          onClick={loadAnomalies}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs"
        >
          <RefreshCw size={14} />
          Rescan
        </button>
      </div>

      {/* Revenue Trend Chart */}
      <RevenueTrendChart connectionName={connectionName} />

      {/* Severity Summary Cards */}
      {data && data.total_anomalies > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">
              {data.severity_breakdown.high}
            </p>
            <p className="text-xs text-red-400 mt-1">High</p>
          </div>
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">
              {data.severity_breakdown.medium}
            </p>
            <p className="text-xs text-amber-400 mt-1">Medium</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {data.severity_breakdown.low}
            </p>
            <p className="text-xs text-blue-400 mt-1">Low</p>
          </div>
        </div>
      )}

      {/* All Clear State */}
      {data && data.total_anomalies === 0 && (
        <div className="text-center py-16">
          <Shield size={52} className="text-teal-400 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">All clear</p>
          <p className="text-slate-400 text-sm mt-1">
            No anomalies detected across {data.tables_scanned} tables
          </p>
        </div>
      )}

      {/* Scan Method Badge */}
      {data && (
        <p className="text-xs text-slate-500 text-center">
          {data.scan_method}
        </p>
      )}

      {/* Anomaly Cards */}
      {data && data.anomalies && data.anomalies.length > 0 && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm font-medium">
            {data.total_anomalies} anomalies detected
            {data.total_anomalies > 10 && (
              <span className="text-slate-500 text-xs ml-2">
                (showing AI explanations for top 10)
              </span>
            )}
          </p>
          {data.anomalies.map((anomaly, i) => (
            <AnomalyCard key={i} anomaly={anomaly} />
          ))}
        </div>
      )}

    </div>
  )
}