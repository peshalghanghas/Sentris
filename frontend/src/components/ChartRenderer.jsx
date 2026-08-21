import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

function detectChartType(columns, rows) {
  if (!columns || columns.length < 2 || !rows || rows.length < 2) {
    return 'table'
  }

  const colNames = columns.map(c => c.toLowerCase())

  const hasDateCol = colNames.some(c =>
    c.includes('month') || c.includes('date') ||
    c.includes('week') || c.includes('year') ||
    c.includes('day') || c.includes('period')
  )
  if (hasDateCol) return 'line'

  const hasNameCol = colNames.some(c =>
    c.includes('name') || c.includes('customer') ||
    c.includes('product') || c.includes('category') ||
    c.includes('plan') || c.includes('status') ||
    c.includes('country') || c.includes('genre') ||
    c.includes('artist') || c.includes('type')
  )

  const hasNumericCol = colNames.some(c =>
    c.includes('total') || c.includes('revenue') ||
    c.includes('amount') || c.includes('count') ||
    c.includes('spent') || c.includes('sales') ||
    c.includes('orders') || c.includes('value') ||
    c.includes('albums') || c.includes('tracks') ||
    c.includes('invoices') || c.includes('sum')
  )

  if (hasNameCol && hasNumericCol) return 'bar'

  const secondValues = rows.map(r => r[columns[1]])
  const isNumeric = secondValues.every(v => !isNaN(Number(v)))
  if (isNumeric && rows.length <= 20) return 'bar'

  return 'table'
}

function formatLabel(value) {
  if (!value) return ''
  const str = String(value)
  if (str.includes('T') || str.match(/^\d{4}-\d{2}-\d{2}/)) {
    const date = new Date(str)
    if (!isNaN(date)) {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
  }
  if (str.length > 14) return str.substring(0, 14) + '...'
  return str
}

function formatNumber(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return value
}

export default function ChartRenderer({ columns, rows, darkMode }) {
  if (!columns || !rows || rows.length === 0) return null

  const chartType = detectChartType(columns, rows)
  if (chartType === 'table') return null

  const colNames = columns.map(c => c.toLowerCase())

  let xKey = columns[0]
  let yKey = columns[1]

  const nameIdx = colNames.findIndex(c =>
    c.includes('name') || c.includes('customer') ||
    c.includes('product') || c.includes('category') ||
    c.includes('month') || c.includes('date') ||
    c.includes('plan') || c.includes('country') ||
    c.includes('genre') || c.includes('artist') ||
    c.includes('type')
  )

  const numIdx = colNames.findIndex(c =>
    c.includes('total') || c.includes('revenue') ||
    c.includes('amount') || c.includes('count') ||
    c.includes('spent') || c.includes('sales') ||
    c.includes('value') || c.includes('albums') ||
    c.includes('tracks') || c.includes('sum')
  )

  if (nameIdx !== -1) xKey = columns[nameIdx]
  if (numIdx !== -1) yKey = columns[numIdx]

  const data = rows.map(row => {
    const obj = {}
    columns.forEach(col => {
      const val = row[col]
      obj[col] = isNaN(Number(val)) ? val : Number(val)
    })
    return obj
  })

  const gridColor = darkMode ? '#1a1a1a' : '#f0f0eb'
  const tickColor = darkMode ? '#555555' : '#999999'
  const axisColor = darkMode ? '#222222' : '#e8e8e0'
  const tooltipBg = darkMode ? '#111111' : '#ffffff'
  const tooltipBorder = darkMode ? '#222222' : '#e8e8e0'
  const tooltipText = darkMode ? '#f1f5f9' : '#1a1a1a'
  const accentColor = '#14b8a6'

  return (
    <div
      className="px-5 py-5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {chartType === 'line' ? '📈 Trend Chart' : '📊 Bar Chart'}
      </p>

      <ResponsiveContainer width="100%" height={220}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatLabel}
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={{ stroke: axisColor }}
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
              labelFormatter={formatLabel}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={accentColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: accentColor, strokeWidth: 0 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatLabel}
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={{ stroke: axisColor }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fill: tickColor, fontSize: 11 }}
              axisLine={{ stroke: axisColor }}
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
              labelFormatter={formatLabel}
            />
            <Bar
              dataKey={yKey}
              fill={accentColor}
              radius={[6, 6, 0, 0]}
              opacity={0.9}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}