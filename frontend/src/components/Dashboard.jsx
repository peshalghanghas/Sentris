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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* Top Navigation */}
      <nav
        className="glass sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: darkMode ? 'rgba(10,10,10,0.85)' : 'rgba(250,250,247,0.85)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #6366f1)' }}
          >
            <Database size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Sentris AI
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Connection pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{
              background: darkMode ? 'rgba(20,184,166,0.1)' : 'rgba(13,148,136,0.08)',
              border: '1px solid rgba(20,184,166,0.3)'
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span style={{ color: 'var(--accent)' }} className="font-medium">
              {connectionName}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {tableCount} tables
            </span>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Disconnect */}
          <button
            onClick={onDisconnect}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
            title="Disconnect"
          >
            <LogOut size={16} />
          </button>

        </div>
      </nav>

      {/* Tab Bar */}
      <div
        className="px-6"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex gap-1 pt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  background: isActive
                    ? darkMode ? 'rgba(20,184,166,0.05)' : 'rgba(13,148,136,0.05)'
                    : 'transparent'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6 overflow-auto">
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