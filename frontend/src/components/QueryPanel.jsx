import { useState } from 'react'
import { Search, Loader, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
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
  "What is the total revenue this quarter?",
  "Show me the top 5 highest value transactions",
  "What is the revenue growth rate month over month?",
  "Which day had the lowest revenue?",

  // Customer analysis
  "Who are my highest value customers?",
  "Which customers have not ordered in the last 30 days?",
  "Show me customers grouped by country",
  "How many customers do we have per plan?",
  "Which customer has placed the most orders?",
  "Show me new customers acquired this month",
  "Which customers have spent more than $500?",
  "What is the average customer lifetime value?",

  // Product analysis
  "What are the top 10 best selling products?",
  "Which product category makes the most money?",
  "Show me products sorted by price",
  "What is the average price per product category?",
  "Which products have never been ordered?",
  "Show me the 5 least popular products",
  "What is the most expensive product?",
  "Which category has the most products?",

  // Time based analysis
  "Show me daily revenue for the last 30 days",
  "What day of the week has the highest sales?",
  "Compare this month revenue to last month",
  "Show me monthly order counts for this year",
  "What was the best performing week this year?",
  "Show me revenue by quarter",
  "Which month had the most new customers?",
  "Show me order volume by hour of day",

  // Music store specific (Chinook)
  "Who are the top 5 artists by number of albums?",
  "What are the top 10 best selling tracks?",
  "Which genre has the most tracks?",
  "Show me total invoice revenue by country",
  "Which employee has the most customers?",
  "What is the most popular media type?",
  "Which artist has generated the most revenue?",
  "Show me all tracks longer than 5 minutes",
  "Which country has the highest average invoice total?",
  "Who are the top 5 customers by total spent?",
  "Show me albums with more than 15 tracks",
  "Which playlist has the most tracks?",

  // E-commerce specific
  "Show me orders by status",
  "Which supplier provides the most products?",
  "Show me inventory levels by category",
  "Which orders are still pending?",
  "What is the average shipping time?",
  "Which region generates the most orders?",

  // SaaS specific
  "How many users are on each pricing plan?",
  "What is our monthly recurring revenue?",
  "Show me signups by month",
  "Which plan has the highest churn rate?",
  "What is the conversion rate from free to paid?",
  "Show me feature usage by plan tier",
]

export default function QueryPanel({ connectionName, darkMode }) {
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

  const visibleSuggestions = showAllSuggestions
    ? SUGGESTIONS
    : SUGGESTIONS.slice(0, 6)

  return (
    <div className="space-y-4">

      {/* Search Box */}
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
          boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything about your data in plain English..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            }}
          >
            {loading ? (
              <Loader size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            Ask
          </button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {visibleSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleAsk(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAllSuggestions(!showAllSuggestions)}
          className="text-xs mt-3 flex items-center gap-1 transition-all hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          {showAllSuggestions ? (
            <><ChevronUp size={12} /> Show fewer</>
          ) : (
            <><ChevronDown size={12} /> Show all {SUGGESTIONS.length} suggestions</>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 px-2 py-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Loader size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
          Nemotron Ultra 550B is generating your query...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444'
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          {/* Result header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                "{result.question}"
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {result.results.row_count} rows · {result.model_used}
              </p>
            </div>
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:opacity-70"
              style={{
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                background: darkMode ? 'rgba(20,184,166,0.05)' : 'rgba(13,148,136,0.05)'
              }}
            >
              {showSQL ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              SQL
            </button>
          </div>

          {/* SQL */}
          {showSQL && (
            <div
              className="px-5 py-4"
              style={{
                background: darkMode ? '#0D0D0D' : '#F5F5F0',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Generated SQL
              </p>
              <code className="text-xs font-mono whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--accent)' }}>
                {result.sql_generated}
              </code>
            </div>
          )}

          {/* Chart */}
          <ChartRenderer
            columns={result.results.columns}
            rows={result.results.rows}
            darkMode={darkMode}
          />

          {/* Table */}
          <ResultsTable
            columns={result.results.columns}
            rows={result.results.rows}
            darkMode={darkMode}
          />
        </div>
      )}

    </div>
  )
}