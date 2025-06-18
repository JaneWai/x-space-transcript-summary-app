import React, { useState } from 'react'
import { Upload, FileAudio, Mic, Download, Clock, Users, MessageSquare, Sparkles, AlertCircle } from 'lucide-react'
import InputSelector from './components/InputSelector'
import TranscriptionResult from './components/TranscriptionResult'
import ProcessingStatus from './components/ProcessingStatus'
import { xSpaceService } from './services/xSpaceService'
import { audioService } from './services/audioService'
import { transcriptionService } from './services/transcriptionService'
import { summaryService } from './services/summaryService'

interface TranscriptionData {
  id: string
  filename: string
  duration: string
  participants: number
  transcript: string
  summary: string
  keyPoints: string[]
  timestamp: string
  source: 'file' | 'url'
  originalUrl?: string
  topics?: string[]
  sentiment?: string
  actionItems?: string[]
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionData | null>(null)
  const [processingStep, setProcessingStep] = useState('')
  const [error, setError] = useState('')

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const processAudio = async (source: 'file' | 'url', input: File | string) => {
    setIsProcessing(true)
    setTranscriptionResult(null)
    setError('')
    
    try {
      if (source === 'url') {
        // Process X Space URL
        setProcessingStep('Validating X Space URL...')
        const isValid = await xSpaceService.validateSpaceUrl(input as string)
        if (!isValid) {
          throw new Error('Invalid or inaccessible X Space URL')
        }

        setProcessingStep('Extracting space metadata...')
        const metadata = await xSpaceService.extractSpaceMetadata(input as string)

        setProcessingStep('Downloading audio stream...')
        // This will handle the full X Space processing
        const result = await xSpaceService.processXSpace(input as string)

        setProcessingStep('Processing complete!')
        
        const transcriptionData: TranscriptionData = {
          id: Date.now().toString(),
          filename: `${result.metadata.title}.mp3`,
          duration: formatDuration(result.transcription.segments.reduce((max, seg) => Math.max(max, seg.end), 0)),
          participants: result.transcription.speakers.length,
          transcript: transcriptionService.formatTranscriptWithTimestamps(result.transcription.segments),
          summary: result.summary.summary,
          keyPoints: result.summary.keyPoints,
          timestamp: new Date().toISOString(),
          source,
          originalUrl: input as string,
          topics: result.summary.topics,
          sentiment: result.summary.sentiment,
          actionItems: result.summary.actionItems
        }

        setTranscriptionResult(transcriptionData)
      } else {
        // Process uploaded file
        const file = input as File
        
        setProcessingStep('Processing audio file...')
        const audioResult = await audioService.processAudioFile(file)
        
        setProcessingStep('Converting audio format...')
        const processedAudio = await audioService.convertToWav(audioResult.audioBlob)
        
        setProcessingStep('Transcribing speech to text...')
        const transcription = await transcriptionService.transcribeAudio(processedAudio, file.name)
        
        setProcessingStep('Generating AI summary...')
        const summary = await summaryService.generateSummary(transcription.text, transcription.speakers)
        
        setProcessingStep('Processing complete!')
        
        const transcriptionData: TranscriptionData = {
          id: Date.now().toString(),
          filename: file.name,
          duration: formatDuration(audioResult.duration),
          participants: transcription.speakers.length,
          transcript: transcriptionService.formatTranscriptWithTimestamps(transcription.segments),
          summary: summary.summary,
          keyPoints: summary.keyPoints,
          timestamp: new Date().toISOString(),
          source,
          topics: summary.topics,
          sentiment: summary.sentiment,
          actionItems: summary.actionItems
        }

        setTranscriptionResult(transcriptionData)
      }
    } catch (error) {
      console.error('Processing failed:', error)
      setError(error instanceof Error ? error.message : 'Processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const handleFileUpload = (file: File) => {
    processAudio('file', file)
  }

  const handleUrlSubmit = (url: string) => {
    processAudio('url', url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">X Space Transcriber</h1>
                <p className="text-gray-600">Transform recordings into transcripts with AI summaries</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FileAudio className="h-4 w-4" />
                <span>Audio Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>AI Transcription</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Smart Summaries</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isProcessing && !transcriptionResult && !error && (
          <div className="text-center mb-12">
            <img 
              src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&h=400&fit=crop&crop=center"
              alt="Audio waveform visualization"
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg mb-8"
            />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Turn X Space Recordings into Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Upload audio files or process X Space URLs directly to get accurate transcripts with AI-powered summaries, 
              key points extraction, and speaker identification.
            </p>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileAudio className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High-Quality Transcription</h3>
                <p className="text-gray-600 text-sm">Advanced AI converts speech to text with high accuracy and speaker identification</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Summaries</h3>
                <p className="text-gray-600 text-sm">Get concise summaries and key insights extracted automatically from your recordings</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Export & Share</h3>
                <p className="text-gray-600 text-sm">Download transcripts in multiple formats and share insights with your team</p>
              </div>
            </div>

            {/* API Configuration Notice */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-amber-900 mb-2">API Configuration Required</h4>
                    <p className="text-amber-800 text-sm mb-3">
                      To use real X Space transcription, you'll need to configure your API keys:
                    </p>
                    <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                      <li><strong>OpenAI API Key:</strong> For transcription and summary generation</li>
                      <li><strong>Twitter Bearer Token:</strong> For X Space metadata extraction</li>
                      <li><strong>Proxy Server:</strong> To handle CORS and API requests</li>
                    </ul>
                    <p className="text-amber-800 text-sm mt-3">
                      Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code> and add your API keys.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Processing Failed</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError('')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Input Selector */}
        {!isProcessing && !transcriptionResult && !error && (
          <InputSelector 
            onFileUpload={handleFileUpload}
            onUrlSubmit={handleUrlSubmit}
          />
        )}

        {/* Processing Status */}
        {isProcessing && (
          <ProcessingStatus step={processingStep} />
        )}

        {/* Transcription Result */}
        {transcriptionResult && (
          <TranscriptionResult data={transcriptionResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 X Space Transcriber. Transform your audio content with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
