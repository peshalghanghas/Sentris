import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import api from '../api'

export default function RevenueTrendChart({ connectionName, darkMode }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [columnName, setColumnName] = useState('revenue')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try revenue_daily first
        let response = await api.post('/query', {
          connection_name: connectionName,
          sql: 'SELECT date, revenue FROM revenue_daily ORDER BY date LIMIT 60'
        })

        if (response.data && response.data.rows && response.data.rows.length > 0) {
          const chartData = response.data.rows.map(row => ({
            date: String(row.date).split('T')[0],
            value: Number(row.revenue)
          }))
          setData(chartData)
          setColumnName('revenue')
          return
        }

        // Try invoice table (Chinook)
        response = await api.post('/query', {
          connection_name: connectionName,
          sql: `SELECT DATE_TRUNC('month', invoice_date) as month, SUM(total) as total_revenue
                FROM invoice
                GROUP BY DATE_TRUNC('month', invoice_date)
                ORDER BY month
                LIMIT 24`
        })

        if (response.data && response.data.rows && response.data.rows.length > 0) {
          const chartData = response.data.rows.map(row => ({
            date: String(row.month || row.date).split('T')[0],
            value: Number(row.total_revenue || row.total || 0)
          }))
          setData(chartData)
          setColumnName('invoice revenue')
        }

      } catch (err) {
        // Silently fail — chart is optional
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [connectionName])

  if (loading || data.length === 0) return null

  const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length
  const gridColor = darkMode ? '#1a1a1a' : '#f0f0eb'
  const tickColor = darkMode ? '#555555' : '#999999'
  const tooltipBg = darkMode ? '#111111' : '#ffffff'
  const tooltipBorder = darkMode ? '#222222' : '#e8e8e0'
  const tooltipText = darkMode ? '#f1f5f9' : '#1a1a1a'

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Revenue Trend
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Average: ${Math.round(avg).toLocaleString()} per period
          </p>
        </div>
        <div
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{
            background: 'rgba(20,184,166,0.1)',
            color: 'var(--accent)',
            border: '1px solid rgba(20,184,166,0.2)'
          }}
        >
          {columnName}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: tickColor, fontSize: 9 }}
            tickFormatter={(v) => {
              const d = new Date(v)
              return isNaN(d) ? v : `${d.getMonth() + 1}/${d.getDate()}`
            }}
            interval={Math.floor(data.length / 6)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 9 }}
            tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '12px',
              color: tooltipText,
              fontSize: '11px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <ReferenceLine
            y={avg}
            stroke="rgba(99,102,241,0.5)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}