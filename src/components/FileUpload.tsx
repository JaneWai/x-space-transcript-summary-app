import React, { useCallback, useState } from 'react'
import { Upload, FileAudio, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg']
    
    if (file.size > maxSize) {
      setError('File size must be less than 100MB')
      return false
    }
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      setError('Please upload a valid audio file (MP3, WAV, M4A, OGG)')
      return false
    }
    
    setError('')
    return true
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileUpload(file)
      }
    }
  }, [onFileUpload])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileUpload(file)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {dragActive ? (
              <Upload className="h-8 w-8 text-blue-600" />
            ) : (
              <FileAudio className="h-8 w-8 text-blue-600" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {dragActive ? 'Drop your audio file here' : 'Upload X Space Recording'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your audio file or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3, WAV, M4A, OGG files up to 100MB
            </p>
          </div>
          
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Choose File
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Sample Files */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-900 mb-3">Try with sample recordings:</h4>
        <div className="space-y-2">
          <button 
            onClick={() => {
              // Create a mock file for demo
              const mockFile = new File([''], 'tech-discussion-sample.mp3', { type: 'audio/mpeg' })
              onFileUpload(mockFile)
            }}
            className="block w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileAudio className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Tech Discussion Sample</p>
                <p className="text-sm text-gray-500">45:32 • 4 speakers • AI & Technology</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
