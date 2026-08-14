import { useState } from 'react'
import ConnectPanel from './components/ConnectPanel'
import Dashboard from './components/Dashboard'

export default function App() {
  const [connectionName, setConnectionName] = useState(null)
  const [schema, setSchema] = useState(null)

  const handleConnected = (name, schemaData) => {
    setConnectionName(name)
    setSchema(schemaData)
  }

  const handleDisconnect = () => {
    setConnectionName(null)
    setSchema(null)
  }

  if (!connectionName) {
    return <ConnectPanel onConnected={handleConnected} />
  }

  return (
    <Dashboard
      connectionName={connectionName}
      schema={schema}
      onDisconnect={handleDisconnect}
    />
  )
}