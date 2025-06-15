import React, { useState } from 'react'
import { Upload, Link, FileAudio } from 'lucide-react'
import FileUpload from './FileUpload'
import UrlInput from './UrlInput'

interface InputSelectorProps {
  onFileUpload: (file: File) => void
  onUrlSubmit: (url: string) => void
}

const InputSelector: React.FC<InputSelectorProps> = ({ onFileUpload, onUrlSubmit }) => {
  const [inputMethod, setInputMethod] = useState<'file' | 'url'>('file')

  return (
    <div className="space-y-8">
      {/* Method Selector */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setInputMethod('file')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                inputMethod === 'file'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setInputMethod('url')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                inputMethod === 'url'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Link className="h-4 w-4" />
              <span>X Space URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Component */}
      {inputMethod === 'file' ? (
        <FileUpload onFileUpload={onFileUpload} />
      ) : (
        <UrlInput onUrlSubmit={onUrlSubmit} />
      )}

      {/* Info Section */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <FileAudio className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">File Upload</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Upload pre-recorded audio files from your device
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Supports MP3, WAV, M4A, OGG formats</li>
            <li>• Maximum file size: 100MB</li>
            <li>• Instant processing start</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Link className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">X Space URL</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Process X Spaces directly from their URLs
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Automatic audio extraction</li>
            <li>• Works with live and recorded Spaces</li>
            <li>• No manual download required</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InputSelector
