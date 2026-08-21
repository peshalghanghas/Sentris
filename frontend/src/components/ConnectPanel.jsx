import { useState } from 'react'
import { Database, Loader, Sun, Moon } from 'lucide-react'
import { connectDatabase } from '../api'

export default function ConnectPanel({ onConnected, darkMode, setDarkMode }) {
  const [dbUrl, setDbUrl] = useState('')
  const [connName, setConnName] = useState('sentris_demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    if (!dbUrl.trim()) {
      setError('Please enter a database URL')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await connectDatabase(connName, dbUrl)
      if (result.success) {
        onConnected(connName, result.schema)
      } else {
        setError(result.error || 'Could not connect to database')
      }
    } catch (err) {
      setError('Connection failed. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setDbUrl(import.meta.env.VITE_DEMO_DB_URL || '')
    setConnName('chinook_demo')
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="orb-1 absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #6366f1, #8b5cf6)',
            top: '-10%',
            left: '-5%'
          }}
        />
        <div
          className="orb-2 absolute w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #14b8a6, #06b6d4)',
            top: '20%',
            right: '-5%'
          }}
        />
        <div
          className="orb-3 absolute w-72 h-72 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #f59e0b, #ef4444)',
            bottom: '-5%',
            left: '30%'
          }}
        />
      </div>

      {/* Dark/Light toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 p-2.5 rounded-xl glass border z-10 transition-all hover:scale-105"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Connect Card */}
      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
            }}
          >
            <Database size={28} className="text-white" />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Sentris AI
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your proactive data guardian
          </p>
        </div>

        {/* Form Card */}
        <div
          className="glass rounded-3xl p-8 border"
          style={{
            background: darkMode ? 'rgba(17,17,17,0.8)' : 'rgba(255,255,255,0.8)',
            borderColor: 'var(--border)',
            boxShadow: darkMode
              ? '0 25px 50px rgba(0,0,0,0.5)'
              : '0 25px 50px rgba(0,0,0,0.08)'
          }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Connect your database
          </h2>

          <div className="space-y-4">

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Connection name
              </label>
              <input
                type="text"
                value={connName}
                onChange={(e) => setConnName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="my_database"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Database URL
              </label>
              <input
                type="password"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none transition-all"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="postgresql://user:password@host:5432/db"
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                🔒 Read-only connection. Your credentials are never stored.
              </p>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444'
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Database size={16} />
                  Connect Database
                </>
              )}
            </button>

            <button
              onClick={fillDemo}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                background: 'transparent'
              }}
            >
              ✦ Try with demo database
            </button>

          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Built on IEEE published research · NVIDIA Nemotron Ultra 550B
        </p>

      </div>
    </div>
  )
}