import { useState } from 'react'
import { Database, Search, Shield, LogOut } from 'lucide-react'
import QueryPanel from './QueryPanel'
import AnomaliesPanel from './AnomaliesPanel'

const TABS = [
  { id: 'query', label: 'Ask Data', icon: Search },
  { id: 'anomalies', label: 'Anomalies', icon: Shield },
]

export default function Dashboard({ connectionName, schema, onDisconnect }) {
  const [activeTab, setActiveTab] = useState('query')
  const tableCount = schema ? Object.keys(schema).length : 0

  return (
    <div className="min-h-screen flex flex-col">

      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-teal-400" />
            <span className="text-white font-bold text-lg">Sentris AI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-slate-300 text-sm font-medium">
                {connectionName}
              </span>
              <span className="text-slate-500 text-xs">
                {tableCount} tables
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Disconnect"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="max-w-4xl mx-auto flex">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 px-6 py-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'query' && (
            <QueryPanel connectionName={connectionName} />
          )}
          {activeTab === 'anomalies' && (
            <AnomaliesPanel connectionName={connectionName} />
          )}
        </div>
      </main>

    </div>
  )
}