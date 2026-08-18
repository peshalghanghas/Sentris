import { useState } from 'react'
import { Database, Loader } from 'lucide-react'
import { connectDatabase } from '../api'

export default function ConnectPanel({ onConnected }) {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Database className="text-teal-400" size={32} />
            <h1 className="text-3xl font-bold text-white">Sentris AI</h1>
          </div>
          <p className="text-slate-400">Your proactive data guardian</p>
        </div>

        {/* Connect Card */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Connect your database
          </h2>

          <div className="space-y-4">

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Connection name
              </label>
              <input
                type="text"
                value={connName}
                onChange={(e) => setConnName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                placeholder="my_database"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Database URL
              </label>
              <input
                type="password"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
                placeholder="postgresql://user:password@host:5432/db"
              />
              <p className="text-xs text-slate-500 mt-1">
                Sentris connects read-only. Your credentials are never stored.
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
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

          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-slate-500 text-xs mt-4">
          🔒 Your database URL is never saved or logged
        </p>

      </div>
    </div>
  )
}