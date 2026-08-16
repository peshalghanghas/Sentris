import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import api from '../api'

export default function RevenueTrendChart({ connectionName }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post('/query', {
          connection_name: connectionName,
          sql: 'SELECT date, revenue FROM revenue_daily ORDER BY date'
        })

        if (response.data && response.data.rows) {
          const chartData = response.data.rows.map(row => ({
            date: String(row.date).split('T')[0],
            revenue: Number(row.revenue)
          }))
          setData(chartData)
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

  const avg = data.reduce((sum, d) => sum + d.revenue, 0) / data.length

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4">
      <p className="text-white font-medium text-sm mb-1">Revenue Trend</p>
      <p className="text-slate-400 text-xs mb-3">
        Dashed line shows your daily average of ${Math.round(avg).toLocaleString()}
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickFormatter={(v) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
            interval={6}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickFormatter={(v) => v >= 1000 ? `$${v/1000}K` : `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '11px'
            }}
            formatter={(value) => [`$${value}`, 'Revenue']}
          />
          <ReferenceLine
            y={avg}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#14b8a6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}