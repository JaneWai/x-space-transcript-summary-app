import React, { useState } from 'react'
import { Link, AlertCircle, ExternalLink } from 'lucide-react'

interface UrlInputProps {
  onUrlSubmit: (url: string) => void
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const validateXSpaceUrl = (inputUrl: string): boolean => {
    const xSpacePatterns = [
      /^https?:\/\/(www\.)?twitter\.com\/i\/spaces\/[a-zA-Z0-9]+/,
      /^https?:\/\/(www\.)?x\.com\/i\/spaces\/[a-zA-Z0-9]+/,
      /^https?:\/\/spaces\.twitter\.com\/[a-zA-Z0-9]+/,
      /^https?:\/\/twitter\.com\/[^\/]+\/status\/\d+/,
      /^https?:\/\/x\.com\/[^\/]+\/status\/\d+/
    ]
    
    return xSpacePatterns.some(pattern => pattern.test(inputUrl))
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

    setIsValidating(true)
    setError('')

    try {
      // Simulate URL validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      onUrlSubmit(url)
    } catch (err) {
      setError('Failed to access X Space. Please check the URL and try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    if (error) setError('')
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                disabled={isValidating}
              />
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isValidating || !url.trim()}
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
        </div>
      </div>
    </div>
  )
}

export default UrlInput
