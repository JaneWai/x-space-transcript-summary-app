import React from 'react'
import { Loader2, Mic, FileAudio, MessageSquare, Sparkles, CheckCircle } from 'lucide-react'

interface ProcessingStatusProps {
  step: string
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ step }) => {
  const steps = [
    { id: 'upload', label: 'Uploading audio file...', icon: FileAudio },
    { id: 'analyze', label: 'Analyzing audio quality...', icon: Mic },
    { id: 'speakers', label: 'Detecting speakers...', icon: MessageSquare },
    { id: 'transcribe', label: 'Transcribing speech to text...', icon: MessageSquare },
    { id: 'summary', label: 'Generating AI summary...', icon: Sparkles },
    { id: 'insights', label: 'Extracting key insights...', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(s => s.label === step)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Recording</h2>
          <p className="text-gray-600">This may take a few minutes depending on the file size</p>
        </div>

        <div className="space-y-4">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            
            return (
              <div
                key={stepItem.id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600'
                      : isCompleted
                      ? 'bg-green-600'
                      : 'bg-gray-400'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isActive
                        ? 'text-blue-900'
                        : isCompleted
                        ? 'text-green-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {stepItem.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingStatus
