interface TranscriptionSegment {
  start: number
  end: number
  text: string
  speaker?: string
}

interface TranscriptionResult {
  text: string
  segments: TranscriptionSegment[]
  speakers: string[]
  language: string
  confidence: number
}

class TranscriptionService {
  private readonly openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  private readonly proxyUrl = import.meta.env.VITE_PROXY_SERVER_URL || 'undefined'
  private readonly proxyToken = import.meta.env.VITE_PROXY_SERVER_ACCESS_TOKEN || 'undefined'

  async transcribeAudio(audioBlob: Blob, filename: string = 'audio.wav'): Promise<TranscriptionResult> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
    }

    try {
      // Create form data for OpenAI Whisper API
      const formData = new FormData()
      formData.append('file', audioBlob, filename)
      formData.append('model', 'whisper-1')
      formData.append('response_format', 'verbose_json')
      formData.append('timestamp_granularities[]', 'segment')
      formData.append('language', 'en')

      const response = await this.makeApiRequest('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Transcription failed: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // Process segments and identify speakers
      const processedSegments = this.processSegments(data.segments || [])
      const speakers = this.identifySpeakers(processedSegments)

      return {
        text: data.text || '',
        segments: processedSegments,
        speakers,
        language: data.language || 'en',
        confidence: this.calculateAverageConfidence(processedSegments)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async makeApiRequest(url: string, options: RequestInit): Promise<Response> {
    // If proxy is configured, use it to avoid CORS issues
    if (this.proxyUrl !== 'undefined') {
      return fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.proxyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          method: options.method,
          headers: Object.fromEntries(
            Object.entries(options.headers || {}).filter(([key]) => key !== 'Content-Type')
          ),
          body: options.body instanceof FormData ? 'FORM_DATA' : options.body
        })
      })
    }

    // Direct API call (may have CORS issues in browser)
    return fetch(url, options)
  }

  private processSegments(segments: any[]): TranscriptionSegment[] {
    return segments.map((segment, index) => ({
      start: segment.start || 0,
      end: segment.end || 0,
      text: segment.text || '',
      speaker: `Speaker ${Math.floor(index / 5) + 1}` // Simple speaker grouping
    }))
  }

  private identifySpeakers(segments: TranscriptionSegment[]): string[] {
    const speakers = new Set<string>()
    segments.forEach(segment => {
      if (segment.speaker) {
        speakers.add(segment.speaker)
      }
    })
    return Array.from(speakers)
  }

  private calculateAverageConfidence(segments: TranscriptionSegment[]): number {
    // Since Whisper doesn't provide confidence scores in the current API,
    // we'll estimate based on segment length and text quality
    if (segments.length === 0) return 0

    let totalScore = 0
    segments.forEach(segment => {
      const textLength = segment.text.length
      const duration = segment.end - segment.start
      const wordsPerSecond = textLength / Math.max(duration, 1)
      
      // Estimate confidence based on reasonable speech patterns
      let confidence = 0.8 // Base confidence
      if (wordsPerSecond > 2 && wordsPerSecond < 8) confidence += 0.1
      if (segment.text.includes('.') || segment.text.includes('?')) confidence += 0.05
      
      totalScore += Math.min(confidence, 0.95)
    })

    return totalScore / segments.length
  }

  formatTranscriptWithTimestamps(segments: TranscriptionSegment[]): string {
    return segments.map(segment => {
      const timestamp = this.formatTimestamp(segment.start)
      const speaker = segment.speaker || 'Speaker'
      return `[${timestamp}] ${speaker}: ${segment.text}`
    }).join('\n\n')
  }

  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

export const transcriptionService = new TranscriptionService()
export type { TranscriptionResult, TranscriptionSegment }
