import { useState } from 'react'
import { Database, Search, Shield, LogOut, Sun, Moon } from 'lucide-react'
import QueryPanel from './QueryPanel'
import AnomaliesPanel from './AnomaliesPanel'

const TABS = [
  { id: 'query', label: 'Ask Data', icon: Search },
  { id: 'anomalies', label: 'Anomalies', icon: Shield },
]

export default function Dashboard({ connectionName, schema, onDisconnect, darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState('query')
  const tableCount = schema ? Object.keys(schema).length : 0

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: darkMode ? '#080808' : '#FDF6EC' }}
    >

      {/* Background orbs — subtle for dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div
              className="drift1 absolute rounded-full"
              style={{
                width: 700,
                height: 700,
                top: '-30%',
                right: '-15%',
                background: 'radial-gradient(circle, #4f46e5 0%, #7c3aed 40%, transparent 70%)',
                filter: 'blur(80px)',
                opacity: 0.12,
              }}
            />
            <div
              className="drift2 absolute rounded-full"
              style={{
                width: 500,
                height: 500,
                bottom: '-20%',
                left: '-10%',
                background: 'radial-gradient(circle, #0d9488 0%, #0891b2 40%, transparent 70%)',
                filter: 'blur(70px)',
                opacity: 0.1,
              }}
            />
            <div
              className="drift5 absolute rounded-full"
              style={{
                width: 300,
                height: 300,
                top: '40%',
                left: '50%',
                background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
                filter: 'blur(60px)',
                opacity: 0.07,
              }}
            />
          </>
        ) : (
          <>
            <div
              className="drift1 absolute rounded-full"
              style={{
                width: 600,
                height: 600,
                top: '-25%',
                right: '-10%',
                background: 'radial-gradient(circle, #C4B5FD 0%, #DDD6FE 40%, transparent 70%)',
                filter: 'blur(60px)',
                opacity: 0.6,
              }}
            />
            <div
              className="drift2 absolute rounded-full"
              style={{
                width: 500,
                height: 500,
                bottom: '-15%',
                left: '-8%',
                background: 'radial-gradient(circle, #6EE7B7 0%, #A7F3D0 40%, transparent 70%)',
                filter: 'blur(55px)',
                opacity: 0.55,
              }}
            />
            <div
              className="drift3 absolute rounded-full"
              style={{
                width: 350,
                height: 350,
                top: '30%',
                left: '60%',
                background: 'radial-gradient(circle, #FDE68A 0%, #FCD34D 40%, transparent 70%)',
                filter: 'blur(50px)',
                opacity: 0.45,
              }}
            />
            <div
              className="drift4 absolute rounded-full"
              style={{
                width: 280,
                height: 280,
                top: '10%',
                left: '20%',
                background: 'radial-gradient(circle, #FDA4AF 0%, transparent 70%)',
                filter: 'blur(45px)',
                opacity: 0.4,
              }}
            />
          </>
        )}
      </div>

      {/* Nav */}
      <nav
        className="glass sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{
          background: darkMode ? 'rgba(8,8,8,0.85)' : 'rgba(253,246,236,0.85)',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              boxShadow: '0 0 20px rgba(99,102,241,0.35)'
            }}
          >
            <Database size={17} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Sentris
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
            style={{
              background: darkMode ? 'rgba(20,184,166,0.1)' : 'rgba(13,148,136,0.08)',
              border: '1px solid rgba(20,184,166,0.25)',
              color: 'var(--accent)'
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {connectionName}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              · {tableCount} tables
            </span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl transition-all hover:opacity-70"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={onDisconnect}
            className="p-2.5 rounded-xl transition-all hover:opacity-70"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: 'var(--text-secondary)'
            }}
            title="Disconnect"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div
        className="relative z-10 px-6"
        style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}
      >
        <div className="max-w-5xl mx-auto flex gap-1 pt-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  background: isActive
                    ? darkMode ? 'rgba(20,184,166,0.06)' : 'rgba(13,148,136,0.06)'
                    : 'transparent'
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6 overflow-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'query' && (
            <QueryPanel connectionName={connectionName} darkMode={darkMode} />
          )}
          {activeTab === 'anomalies' && (
            <AnomaliesPanel connectionName={connectionName} darkMode={darkMode} />
          )}
        </div>
      </main>

    </div>
  )
}