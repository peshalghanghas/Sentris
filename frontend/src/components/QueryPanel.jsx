import { useState } from 'react'
import { Search, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { askQuestion } from '../api'
import ResultsTable from './ResultsTable'
import ChartRenderer from './ChartRenderer'

const SUGGESTIONS = [
  // Generic business questions — work on any database
  "Show me total revenue by month",
  "Who are my top 5 customers by spending?",
  "What was the best sales day?",
  "What is the most popular product?",
  "How many new customers joined this month?",
  "Show me all orders from last month",

  // Financial analysis
  "What is the average order value?",
  "Show me revenue trend over the last 6 months",
  "Which products generate the most revenue?",
  "What percentage of orders are completed vs pending?",

  // Customer analysis
  "Who are my highest value customers?",
  "Which customers have not ordered in the last 30 days?",
  "Show me customers grouped by country",
  "How many customers do we have per plan?",

  // Product analysis
  "What are the top 10 best selling products?",
  "Which product category makes the most money?",
  "Show me products sorted by price",
  "What is the average price per product category?",

  // Time based analysis
  "Show me daily revenue for the last 30 days",
  "What day of the week has the highest sales?",
  "Compare this month revenue to last month",
  "Show me monthly order counts for this year",

  // Music store specific (Chinook)
  "Who are the top 5 artists by number of albums?",
  "What are the top 10 best selling tracks?",
  "Which genre has the most tracks?",
  "Show me total invoice revenue by country",
  "Which employee has the most customers?",
  "What is the most popular media type?",

  // E-commerce specific
  "Show me orders by status",
  "Which supplier provides the most products?",
  "Show me inventory levels by category",

  // SaaS specific
  "How many users are on each pricing plan?",
  "What is our monthly recurring revenue?",
  "Show me signups by month",
  "Which plan has the highest churn rate?"
]

export default function QueryPanel({ connectionName }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showSQL, setShowSQL] = useState(false)
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

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
      setError('Request failed. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Show first 6 suggestions by default, all when expanded
  const visibleSuggestions = showAllSuggestions
    ? SUGGESTIONS
    : SUGGESTIONS.slice(0, 6)

  return (
    <div className="space-y-4">

      {/* Question Input */}
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

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {visibleSuggestions.map((s) => (
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

        {/* Show more / less toggle */}
        <button
          onClick={() => setShowAllSuggestions(!showAllSuggestions)}
          className="text-xs text-slate-500 hover:text-teal-400 mt-2 flex items-center gap-1 transition-colors"
        >
          {showAllSuggestions ? (
            <>Show fewer <ChevronUp size={12} /></>
          ) : (
            <>Show all {SUGGESTIONS.length} suggestions <ChevronDown size={12} /></>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-400 text-sm px-2">
          <Loader size={16} className="animate-spin text-teal-400" />
          Nemotron is generating SQL and running your query...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">

          {/* Result Header */}
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

          {/* SQL Display */}
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

          {/* Chart */}
          <ChartRenderer
            columns={result.results.columns}
            rows={result.results.rows}
          />

          {/* Results Table */}
          <ResultsTable
            columns={result.results.columns}
            rows={result.results.rows}
          />

        </div>
      )}

    </div>
  )
}