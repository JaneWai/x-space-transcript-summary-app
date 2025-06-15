import React, { useState } from 'react'
import { Download, Copy, Clock, Users, FileText, Sparkles, CheckCircle, Share2 } from 'lucide-react'

interface TranscriptionData {
  id: string
  filename: string
  duration: string
  participants: number
  transcript: string
  summary: string
  keyPoints: string[]
  timestamp: string
}

interface TranscriptionResultProps {
  data: TranscriptionData
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'insights'>('summary')
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownload = (format: 'txt' | 'json') => {
    let content = ''
    let filename = ''
    
    if (format === 'txt') {
      content = `X Space Transcription\n\nFile: ${data.filename}\nDuration: ${data.duration}\nParticipants: ${data.participants}\nDate: ${new Date(data.timestamp).toLocaleDateString()}\n\n--- SUMMARY ---\n${data.summary}\n\n--- KEY POINTS ---\n${data.keyPoints.map(point => `• ${point}`).join('\n')}\n\n--- FULL TRANSCRIPT ---\n${data.transcript}`
      filename = `${data.filename.replace(/\.[^/.]+$/, '')}_transcript.txt`
    } else {
      content = JSON.stringify(data, null, 2)
      filename = `${data.filename.replace(/\.[^/.]+$/, '')}_transcript.json`
    }
    
    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-xl font-bold text-green-900">Transcription Complete!</h2>
            <p className="text-green-700">Your X Space recording has been successfully processed</p>
          </div>
        </div>
      </div>

      {/* File Info & Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{data.filename}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{data.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{data.participants} speakers</span>
                </div>
                <span>{new Date(data.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleCopy(activeTab === 'transcript' ? data.transcript : activeTab === 'summary' ? data.summary : data.keyPoints.join('\n'))}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleDownload('txt')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg"
                >
                  Download as TXT
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg"
                >
                  Download as JSON
                </button>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Summary</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Key Insights</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transcript'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Full Transcript</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-800 leading-relaxed">{data.summary}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Points & Insights</h3>
                <div className="space-y-3">
                  {data.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Transcript</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {data.transcript}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranscriptionResult
