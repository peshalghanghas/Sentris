import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const connectDatabase = async (connectionName, databaseUrl) => {
  const response = await api.post('/connect', {
    connection_name: connectionName,
    database_url: databaseUrl
  })
  return response.data
}

export const askQuestion = async (connectionName, question) => {
  const response = await api.post('/ask', {
    connection_name: connectionName,
    question: question
  })
  return response.data
}

export const getAnomalySummary = async (connectionName) => {
  const response = await api.get(`/anomalies/${connectionName}/summary`)
  return response.data
}

export const getAnomalies = async (connectionName, explain = true) => {
  const response = await api.get(`/anomalies/${connectionName}`, {
    params: { explain }
  })
  return response.data
}

export default api