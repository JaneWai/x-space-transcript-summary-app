import React, { useState } from 'react'
import { Upload, FileAudio, Mic, Download, Clock, Users, MessageSquare, Sparkles } from 'lucide-react'
import InputSelector from './components/InputSelector'
import TranscriptionResult from './components/TranscriptionResult'
import ProcessingStatus from './components/ProcessingStatus'
import { xSpaceService } from './services/xSpaceService'

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
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionData | null>(null)
  const [processingStep, setProcessingStep] = useState('')

  const processAudio = async (source: 'file' | 'url', input: File | string) => {
    setIsProcessing(true)
    setTranscriptionResult(null)
    
    let steps: string[]
    let filename: string
    let originalUrl: string | undefined

    if (source === 'file') {
      steps = [
        'Uploading audio file...',
        'Analyzing audio quality...',
        'Detecting speakers...',
        'Transcribing speech to text...',
        'Generating AI summary...',
        'Extracting key insights...'
      ]
      filename = (input as File).name
    } else {
      steps = [
        'Validating X Space URL...',
        'Extracting space metadata...',
        'Downloading audio stream...',
        'Processing audio quality...',
        'Detecting speakers...',
        'Transcribing speech to text...',
        'Generating AI summary...',
        'Extracting key insights...'
      ]
      originalUrl = input as string
      
      try {
        const metadata = await xSpaceService.extractSpaceMetadata(originalUrl)
        filename = `${metadata.title || 'X Space'}.mp3`
      } catch (error) {
        filename = 'X Space Recording.mp3'
      }
    }
    
    // Simulate processing steps
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, source === 'url' ? 2000 : 1500))
    }
    
    // Mock transcription result
    const mockResult: TranscriptionData = {
      id: Date.now().toString(),
      filename,
      duration: '45:32',
      participants: 4,
      transcript: `[00:00:12] Speaker 1: Welcome everyone to today's X Space on the future of AI and technology. I'm excited to have such an amazing panel with us today.

[00:00:28] Speaker 2: Thanks for having me! I'm really looking forward to discussing how AI is transforming various industries and what we can expect in the coming years.

[00:00:45] Speaker 3: Absolutely. The pace of innovation has been incredible. Just in the past year, we've seen breakthrough after breakthrough in machine learning and natural language processing.

[00:01:02] Speaker 1: Let's start with the elephant in the room - generative AI. How do you see this technology reshaping creative industries?

[00:01:15] Speaker 2: It's fascinating because we're seeing AI become a collaborative tool rather than a replacement. Artists, writers, and designers are using AI to enhance their creativity, not replace it.

[00:01:32] Speaker 4: I think that's a crucial distinction. The most successful implementations I've seen treat AI as an augmentation tool. It's about human-AI collaboration, not human replacement.

[00:01:48] Speaker 3: Exactly. And we're just scratching the surface. The next wave of AI applications will be even more integrated into our daily workflows, making complex tasks more accessible to everyone.

[00:02:05] Speaker 1: That's a great point. What about the challenges? We can't ignore the concerns around job displacement and ethical considerations.

[00:02:18] Speaker 2: Those are valid concerns that we need to address proactively. It's about responsible development and ensuring that the benefits of AI are distributed fairly across society.

[00:02:35] Speaker 4: Education and reskilling will be crucial. We need to prepare the workforce for an AI-augmented future, not just hope for the best.

[00:02:48] Speaker 3: And transparency in AI systems is essential. People need to understand how these tools work and what their limitations are.`,
      summary: `This X Space featured a panel discussion on the future of AI and technology, focusing on generative AI's impact on creative industries. The speakers emphasized that AI should be viewed as a collaborative tool that augments human creativity rather than replacing it. Key themes included the importance of human-AI collaboration, the need for responsible AI development, and the critical role of education and transparency in preparing society for an AI-augmented future. The discussion highlighted both the tremendous opportunities and the legitimate concerns around job displacement and ethical considerations that need to be addressed proactively.`,
      keyPoints: [
        'AI is becoming a collaborative tool that enhances rather than replaces human creativity',
        'Successful AI implementations focus on human-AI collaboration, not replacement',
        'The next wave of AI will be more integrated into daily workflows',
        'Education and reskilling are crucial for preparing the workforce',
        'Transparency in AI systems is essential for public understanding',
        'Responsible development is needed to ensure fair distribution of AI benefits'
      ],
      timestamp: new Date().toISOString(),
      source,
      originalUrl
    }
    
    setTranscriptionResult(mockResult)
    setIsProcessing(false)
    setProcessingStep('')
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
        {!isProcessing && !transcriptionResult && (
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
          </div>
        )}

        {/* Input Selector */}
        {!isProcessing && !transcriptionResult && (
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
