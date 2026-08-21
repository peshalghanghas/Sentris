import { useState } from 'react'
import { Database, Loader, Sun, Moon } from 'lucide-react'
import { connectDatabase } from '../api'

export default function ConnectPanel({ onConnected, darkMode, setDarkMode }) {
  const [dbUrl, setDbUrl] = useState('')
  const [connName, setConnName] = useState('sentris_demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const handleConnect = async () => {
    if (!dbUrl.trim()) { setError('Please enter a database URL'); return }
    setLoading(true); setError('')
    try {
      const result = await connectDatabase(connName, dbUrl)
      if (result.success) {
        onConnected(connName, result.schema)
      } else {
        setError(result.error || 'Could not connect to database')
      }
    } catch { setError('Connection failed. Make sure your backend is running.') }
    finally { setLoading(false) }
  }

  const fillDemo = () => {
    setDbUrl(import.meta.env.VITE_DEMO_DB_URL || '')
    setConnName('chinook_demo')
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: darkMode ? '#080808' : '#FDF6EC' }}
    >

      {/* ── DARK MODE BACKGROUND ── */}
      {darkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Giant hero orb — left side, very visible */}
          <div
            className="drift1 absolute rounded-full"
            style={{
              width: 700,
              height: 700,
              top: '-20%',
              left: '-15%',
              background: 'radial-gradient(circle at 40% 40%, #7c3aed 0%, #4f46e5 30%, #1e1b4b 60%, transparent 80%)',
              filter: 'blur(60px)',
              opacity: 0.7,
            }}
          />
          {/* Teal orb — right side */}
          <div
            className="drift2 absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              top: '10%',
              right: '-10%',
              background: 'radial-gradient(circle at 60% 40%, #0d9488 0%, #0891b2 40%, transparent 75%)',
              filter: 'blur(50px)',
              opacity: 0.55,
            }}
          />
          {/* Orange fire orb — bottom */}
          <div
            className="drift3 absolute rounded-full"
            style={{
              width: 450,
              height: 450,
              bottom: '-15%',
              left: '30%',
              background: 'radial-gradient(circle at 50% 50%, #f97316 0%, #ef4444 35%, #9f1239 65%, transparent 80%)',
              filter: 'blur(55px)',
              opacity: 0.45,
            }}
          />
          {/* Pink accent — mid left */}
          <div
            className="drift4 absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              top: '50%',
              left: '5%',
              background: 'radial-gradient(circle, #ec4899 0%, #be185d 50%, transparent 80%)',
              filter: 'blur(45px)',
              opacity: 0.35,
            }}
          />
          {/* Small cyan sparkle */}
          <div
            className="drift5 pulse-glow absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              top: '15%',
              left: '45%',
              background: 'radial-gradient(circle, #22d3ee 0%, #0ea5e9 50%, transparent 80%)',
              filter: 'blur(35px)',
              opacity: 0.4,
            }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
      )}

      {/* ── LIGHT MODE BACKGROUND ── */}
      {!darkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Big warm yellow blob — top left */}
          <div
            className="drift1 absolute rounded-full"
            style={{
              width: 650,
              height: 650,
              top: '-20%',
              left: '-15%',
              background: 'radial-gradient(circle at 40% 40%, #FDE68A 0%, #FCD34D 30%, #FDE68A 55%, transparent 75%)',
              filter: 'blur(40px)',
              opacity: 0.85,
            }}
          />
          {/* Mint green blob — right */}
          <div
            className="drift2 absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              top: '5%',
              right: '-12%',
              background: 'radial-gradient(circle at 55% 45%, #6EE7B7 0%, #34D399 35%, #A7F3D0 60%, transparent 80%)',
              filter: 'blur(45px)',
              opacity: 0.75,
            }}
          />
          {/* Rose pink blob — bottom left */}
          <div
            className="drift3 absolute rounded-full"
            style={{
              width: 480,
              height: 480,
              bottom: '-15%',
              left: '15%',
              background: 'radial-gradient(circle at 50% 50%, #FDA4AF 0%, #FB7185 30%, #FCA5A5 60%, transparent 80%)',
              filter: 'blur(45px)',
              opacity: 0.7,
            }}
          />
          {/* Lavender blob — mid right */}
          <div
            className="drift4 absolute rounded-full"
            style={{
              width: 380,
              height: 380,
              top: '45%',
              right: '5%',
              background: 'radial-gradient(circle at 50% 50%, #C4B5FD 0%, #A78BFA 40%, #DDD6FE 65%, transparent 82%)',
              filter: 'blur(40px)',
              opacity: 0.65,
            }}
          />
          {/* Baby blue accent — top center */}
          <div
            className="drift5 absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              top: '8%',
              left: '40%',
              background: 'radial-gradient(circle, #BAE6FD 0%, #7DD3FC 40%, transparent 75%)',
              filter: 'blur(35px)',
              opacity: 0.7,
            }}
          />
          {/* Peach blob — bottom right */}
          <div
            className="drift1 absolute rounded-full"
            style={{
              width: 320,
              height: 320,
              bottom: '5%',
              right: '10%',
              background: 'radial-gradient(circle, #FED7AA 0%, #FDBA74 40%, transparent 75%)',
              filter: 'blur(35px)',
              opacity: 0.65,
            }}
          />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 z-20 p-3 rounded-2xl glass-strong transition-all hover:scale-105"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
          color: darkMode ? '#888' : '#7A6A55',
          boxShadow: darkMode ? 'none' : '0 4px 16px rgba(0,0,0,0.08)'
        }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Form */}
      <div className="relative z-10 w-full max-w-[420px] px-5">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, #14b8a6, #6366f1)'
                : 'linear-gradient(135deg, #0d9488, #4f46e5)',
              boxShadow: darkMode
                ? '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)'
                : '0 8px 40px rgba(79,70,229,0.3)',
            }}
          >
            <Database size={32} className="text-white" />
          </div>
          <h1
            className="text-5xl font-black mb-2 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Sentris
          </h1>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Your proactive AI data guardian
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-strong rounded-3xl p-7 border"
          style={{
            background: darkMode
              ? 'rgba(12,12,12,0.8)'
              : 'rgba(255,255,255,0.65)',
            borderColor: darkMode
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.9)',
            boxShadow: darkMode
              ? '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >

          <div className="space-y-4">

            {/* Connection name */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Connection name
              </label>
              <input
                type="text"
                value={connName}
                onChange={e => setConnName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all duration-200"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1.5px solid ${focused === 'name'
                    ? '#14b8a6'
                    : darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                  color: 'var(--text-primary)',
                  boxShadow: focused === 'name' ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none'
                }}
                placeholder="my_database"
              />
            </div>

            {/* DB URL */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Database URL
              </label>
              <input
                type="password"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                onFocus={() => setFocused('url')}
                onBlur={() => setFocused(null)}
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-mono outline-none transition-all duration-200"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1.5px solid ${focused === 'url'
                    ? '#14b8a6'
                    : darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                  color: 'var(--text-primary)',
                  boxShadow: focused === 'url' ? '0 0 0 3px rgba(20,184,166,0.12)' : 'none'
                }}
                placeholder="postgresql://user:password@host:5432/db"
              />
              <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>🔒</span> Read-only. Credentials never stored.
              </p>
            </div>

            {error && (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1.5px solid rgba(239,68,68,0.2)',
                  color: '#ef4444'
                }}
              >
                {error}
              </div>
            )}

            {/* Connect button */}
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, #14b8a6 0%, #6366f1 50%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #0d9488 0%, #4f46e5 100%)',
                boxShadow: darkMode
                  ? '0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                  : '0 8px 24px rgba(79,70,229,0.3)'
              }}
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Connecting...</>
              ) : (
                <><Database size={16} /> Connect Database</>
              )}
            </button>

            {/* Demo button */}
            <button
              onClick={fillDemo}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] hover:opacity-80"
              style={{
                color: darkMode ? '#14b8a6' : '#0d9488',
                background: darkMode ? 'rgba(20,184,166,0.06)' : 'rgba(13,148,136,0.06)',
                border: `1.5px solid ${darkMode ? 'rgba(20,184,166,0.15)' : 'rgba(13,148,136,0.15)'}`
              }}
            >
              Try with demo database
            </button>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs" style={{ color: darkMode ? '#333' : '#B8A898' }}>
          </p>
        </div>

      </div>
    </div>
  )
}