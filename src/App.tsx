import { useState } from 'react'
import './App.css'

interface ProcessingStatus {
  status: 'processing' | 'completed' | 'error';
  progress?: string;
  error?: string;
  filename?: string;
}

function App() {
  const [organizationId, setOrganizationId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [downloadUrl, setDownloadUrl] = useState('')

  const API_BASE = import.meta.env.VITE_API_BASE
  if (!API_BASE) {
    throw new Error('VITE_API_BASE is not set')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organizationId.trim()) {
      alert('Please enter an organization ID')
      return
    }

    setIsProcessing(true)
    setStatus({ status: 'processing', progress: 'Analyzing duplicates...' })
    setDownloadUrl('')

    try {
      const response = await fetch(`${API_BASE}/detect-duplicates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId: organizationId.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ status: 'completed', progress: 'Analysis complete!' })
        setDownloadUrl(`${API_BASE}/download/${data.filename}`)
      } else {
        throw new Error(data.error || 'Failed to start processing')
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>🔍 Anish Kulkarni Duplicate Item Refiner</h1>
          <p>Enter your Zoho Books organization ID to find and analyze duplicate items</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="orgId">Organization ID:</label>
            <input
              id="orgId"
              type="text"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              placeholder="e.g., 867850976"
              disabled={isProcessing}
              required
            />
          </div>
          
          <button type="submit" disabled={isProcessing} className="submit-btn">
            {isProcessing ? 'Processing...' : 'Analyze Duplicates'}
          </button>
        </form>

        {status && (
          <div className={`status-card ${status.status}`}>
            <h3>
              {status.status === 'processing' && '⏳ Processing...'}
              {status.status === 'completed' && '✅ Completed!'}
              {status.status === 'error' && '❌ Error'}
            </h3>
            
            {status.progress && <p>{status.progress}</p>}
            {status.error && <p className="error-message">{status.error}</p>}
            
            {status.status === 'completed' && downloadUrl && (
              <div className="download-section">
                <p>Your duplicate analysis is ready!</p>
                <button onClick={handleDownload} className="download-btn">
                  📊 Download Excel Report
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App
