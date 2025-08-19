import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Download, AlertCircle, CheckCircle2, Loader2, Sparkles, Zap, Shield, Rocket } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-slate-900/20 opacity-30"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <img src="/Numerize.png" alt="Numerize Logo" className="w-28 h-auto mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
              Duplicate Item Refiner
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Enter your Zoho Books organization ID to find and analyze duplicate items with AI-powered precision
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30 px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Numerize
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30 px-4 py-2 text-sm">
                <Rocket className="w-4 h-4 mr-2" />
                AI-Powered
              </Badge>
            </div>
          </div>

          {/* Main Form Card */}
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl border-0">
            <CardContent className="space-y-8 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="orgId" className="text-base font-semibold text-slate-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Enter Organization ID found in Zoho Books
                  </Label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-purple-400 transition-colors duration-200" />
                    <Input
                      id="orgId"
                      type="text"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      placeholder="e.g., 123123 But enter the actual organization id please"
                      disabled={isProcessing}
                      required
                      className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 text-lg rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-3" />
                      Analyze Duplicates
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status Card */}
          {status && (
            <Card className={`mt-8 backdrop-blur-xl border-white/10 shadow-2xl transition-all duration-500 ${
              status.status === 'processing' ? 'bg-blue-500/10 border-blue-500/30' :
              status.status === 'completed' ? 'bg-green-500/10 border-green-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="flex items-center space-x-4 mb-6">
                  {status.status === 'processing' && (
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    </div>
                  )}
                  {status.status === 'completed' && (
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                  {status.status === 'error' && (
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className={`font-bold text-xl ${
                      status.status === 'processing' ? 'text-blue-300' :
                      status.status === 'completed' ? 'text-green-300' :
                      'text-red-300'
                    }`}>
                      {status.status === 'processing' ? '⏳ Processing...' : 
                       status.status === 'completed' ? '✅ Analysis Complete!' : 
                       '❌ Error Occurred'}
                    </h3>
                    {status.progress && (
                      <p className="text-slate-300 text-lg">{status.progress}</p>
                    )}
                  </div>
                </div>
                
                {status.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-300 text-base">{status.error}</p>
                  </div>
                )}
                
                {status.status === 'completed' && downloadUrl && (
                  <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-300 text-center mb-6 text-lg font-semibold">
                      🎉 Your duplicate analysis is ready for download!
                    </p>
                    <Button 
                      onClick={handleDownload} 
                      className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 rounded-xl"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      Download Excel Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure
              </span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Fast
              </span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                AI-Powered Analysis
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
