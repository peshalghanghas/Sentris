import { useState } from 'react'
import { Search, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { askQuestion } from '../api'
import ResultsTable from './ResultsTable'

const SUGGESTIONS = [
  "Show me total revenue by month",
  "Who are my top 5 customers?",
  "What was the best revenue day?",
  "Show me all enterprise customers",
  "What is the most popular product?",
  "How many orders were completed?"
]

export default function QueryPanel({ connectionName }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showSQL, setShowSQL] = useState(false)

  const handleAsk = async (q = question) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setShowSQL(false)

    try {
      const data = await askQuestion(connectionName, q)
      if (data.success) {
        setResult(data)
        setQuestion(q)
      } else {
        setError(data.error || 'Could not generate an answer')
      }
    } catch (err) {
      setError('Request failed. Make sure your backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything about your data in plain English..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 placeholder-slate-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Ask
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleAsk(s)}
              disabled={loading}
              className="text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 px-3 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400 text-sm px-2">
          <Loader size={16} className="animate-spin text-teal-400" />
          Nemotron is generating SQL and running your query...
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">
                "{result.question}"
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {result.results.row_count} rows · {result.model_used}
              </p>
            </div>
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors ml-4 whitespace-nowrap"
            >
              View SQL
              {showSQL ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showSQL && (
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-700">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">
                Generated SQL
              </p>
              <code className="text-teal-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {result.sql_generated}
              </code>
            </div>
          )}

          <ResultsTable
            columns={result.results.columns}
            rows={result.results.rows}
          />
        </div>
      )}

    </div>
  )
}