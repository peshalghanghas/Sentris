export default function ResultsTable({ columns, rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-slate-400 text-sm">
        No results found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-900">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-slate-700 hover:bg-slate-700/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-4 py-2.5 text-slate-300 whitespace-nowrap"
                >
                  {row[col] !== null && row[col] !== undefined
                    ? String(row[col])
                    : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}