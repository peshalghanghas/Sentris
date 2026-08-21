import { useState, useEffect } from 'react'
import ConnectPanel from './components/ConnectPanel'
import Dashboard from './components/Dashboard'

export default function App() {
  const [connectionName, setConnectionName] = useState(null)
  const [schema, setSchema] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }, [darkMode])

  const handleConnected = (name, schemaData) => {
    setConnectionName(name)
    setSchema(schemaData)
  }

  const handleDisconnect = () => {
    setConnectionName(null)
    setSchema(null)
  }

  if (!connectionName) {
    return (
      <ConnectPanel
        onConnected={handleConnected}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    )
  }

  return (
    <Dashboard
      connectionName={connectionName}
      schema={schema}
      onDisconnect={handleDisconnect}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  )
}