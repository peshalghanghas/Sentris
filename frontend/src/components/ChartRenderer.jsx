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

  // If any column looks like a date/time → line chart
  const hasDateCol = colNames.some(c =>
    c.includes('month') || c.includes('date') ||
    c.includes('week') || c.includes('year') ||
    c.includes('day') || c.includes('period')
  )
  if (hasDateCol) return 'line'

  // If there's a name/label column + a numeric column → bar chart
  const hasNameCol = colNames.some(c =>
    c.includes('name') || c.includes('customer') ||
    c.includes('product') || c.includes('category') ||
    c.includes('plan') || c.includes('status')
  )

  const hasNumericCol = colNames.some(c =>
    c.includes('total') || c.includes('revenue') ||
    c.includes('amount') || c.includes('count') ||
    c.includes('spent') || c.includes('sales') ||
    c.includes('orders') || c.includes('value')
  )

  if (hasNameCol && hasNumericCol) return 'bar'

  // Check if second column values are all numeric
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

export default function ChartRenderer({ columns, rows }) {
  if (!columns || !rows || rows.length === 0) return null

  const chartType = detectChartType(columns, rows)
  if (chartType === 'table') return null

  const colNames = columns.map(c => c.toLowerCase())

  // Find best x and y columns
  let xKey = columns[0]
  let yKey = columns[1]

  const nameIdx = colNames.findIndex(c =>
    c.includes('name') || c.includes('customer') ||
    c.includes('product') || c.includes('category') ||
    c.includes('month') || c.includes('date') ||
    c.includes('plan')
  )

  const numIdx = colNames.findIndex(c =>
    c.includes('total') || c.includes('revenue') ||
    c.includes('amount') || c.includes('count') ||
    c.includes('spent') || c.includes('sales') ||
    c.includes('value')
  )

  if (nameIdx !== -1) xKey = columns[nameIdx]
  if (numIdx !== -1) yKey = columns[numIdx]

  // Prepare data for recharts
  const data = rows.map(row => {
    const obj = {}
    columns.forEach(col => {
      const val = row[col]
      obj[col] = isNaN(Number(val)) ? val : Number(val)
    })
    return obj
  })

  return (
    <div className="px-4 py-4 border-t border-slate-700">
      <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">
        {chartType === 'line' ? 'Trend Chart' : 'Bar Chart'}
      </p>

      <ResponsiveContainer width="100%" height={220}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatLabel}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
              labelFormatter={formatLabel}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={xKey}
              tickFormatter={formatLabel}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
              labelFormatter={formatLabel}
            />
            <Bar
              dataKey={yKey}
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}