import React, { useState } from 'react'
import { Link, AlertCircle, ExternalLink, CheckCircle, Clock } from 'lucide-react'
import { xSpaceService } from '../services/xSpaceService'

interface UrlInputProps {
  onUrlSubmit: (url: string) => void
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    metadata?: any
  } | null>(null)

  const validateXSpaceUrl = (inputUrl: string): boolean => {
    if (!inputUrl || typeof inputUrl !== 'string') return false
    
    const xSpacePatterns = [
      /^https?:\/\/(www\.)?twitter\.com\/i\/spaces\/[a-zA-Z0-9]+/,
      /^https?:\/\/(www\.)?x\.com\/i\/spaces\/[a-zA-Z0-9]+/,
      /^https?:\/\/spaces\.twitter\.com\/[a-zA-Z0-9]+/,
      /^https?:\/\/twitter\.com\/[^\/]+\/status\/\d+/,
      /^https?:\/\/x\.com\/[^\/]+\/status\/\d+/
    ]
    
    return xSpacePatterns.some(pattern => pattern.test(inputUrl))
  }

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setError('')
    setValidationResult(null)

    if (newUrl.trim() && validateXSpaceUrl(newUrl)) {
      setIsValidating(true)
      
      try {
        const isValid = await xSpaceService.validateSpaceUrl(newUrl)
        if (isValid) {
          const metadata = await xSpaceService.extractSpaceMetadata(newUrl)
          setValidationResult({
            isValid: true,
            metadata
          })
        } else {
          setValidationResult({ isValid: false })
          setError('X Space not found or not accessible')
        }
      } catch (err) {
        console.warn('URL validation error:', err)
        setValidationResult({ isValid: false })
        setError('Unable to validate X Space URL')
      } finally {
        setIsValidating(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Please enter an X Space URL')
      return
    }

    if (!validateXSpaceUrl(url)) {
      setError('Please enter a valid X Space URL (e.g., https://x.com/i/spaces/1234567890)')
      return
    }

    // Allow submission even without full validation for demo purposes
    onUrlSubmit(url)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Link className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Process X Space URL
          </h3>
          <p className="text-gray-600">
            Enter the URL of an X Space to automatically extract and transcribe the audio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="xspace-url" className="block text-sm font-medium text-gray-700 mb-2">
              X Space URL
            </label>
            <div className="relative">
              <input
                id="xspace-url"
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://x.com/i/spaces/1234567890"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10 ${
                  validationResult?.isValid 
                    ? 'border-green-300 bg-green-50' 
                    : validationResult?.isValid === false 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={isValidating}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValidating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                ) : validationResult?.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : validationResult?.isValid === false ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Space Preview */}
          {validationResult?.isValid && validationResult.metadata && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{validationResult.metadata.title}</h4>
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    <p>Host: @{validationResult.metadata.hostUsername}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        validationResult.metadata.state === 'live' 
                          ? 'bg-red-100 text-red-800' 
                          : validationResult.metadata.state === 'ended'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {validationResult.metadata.state === 'live' ? '🔴 Live' : 
                         validationResult.metadata.state === 'ended' ? '⏹️ Ended' : '📅 Scheduled'}
                      </span>
                      {validationResult.metadata.participantCount > 0 && (
                        <span className="text-xs">{validationResult.metadata.participantCount} participants</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Validating URL...</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                <span>Process X Space</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Supported URL formats:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• https://x.com/i/spaces/[space-id]</li>
            <li>• https://twitter.com/i/spaces/[space-id]</li>
            <li>• https://spaces.twitter.com/[space-id]</li>
            <li>• Tweet URLs containing X Space links</li>
          </ul>
          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Make sure your API keys are configured in the .env file for full functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlInput
