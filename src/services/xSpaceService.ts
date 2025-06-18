import { audioService } from './audioService'
import { transcriptionService } from './transcriptionService'
import { summaryService } from './summaryService'
import type { TranscriptionResult } from './transcriptionService'
import type { SummaryResult } from './summaryService'

interface XSpaceMetadata {
  id: string
  title: string
  hostUsername: string
  participantCount: number
  isLive: boolean
  scheduledStart?: string
  actualStart?: string
  estimatedEnd?: string
  state: 'live' | 'ended' | 'scheduled'
}

interface XSpaceProcessingResult {
  metadata: XSpaceMetadata
  transcription: TranscriptionResult
  summary: SummaryResult
  audioUrl?: string
}

class XSpaceService {
  private readonly twitterBearerToken = import.meta.env.VITE_TWITTER_BEARER_TOKEN
  private readonly proxyUrl = import.meta.env.VITE_PROXY_SERVER_URL || 'undefined'
  private readonly proxyToken = import.meta.env.VITE_PROXY_SERVER_ACCESS_TOKEN || 'undefined'

  async validateSpaceUrl(spaceUrl: string): Promise<boolean> {
    try {
      const spaceId = this.extractSpaceId(spaceUrl)
      if (!spaceId) return false

      // For validation, just check if we can extract a space ID
      // Don't make actual API calls during validation to avoid errors
      return true
    } catch (error) {
      console.error('Space validation failed:', error)
      return false
    }
  }

  async extractSpaceMetadata(spaceUrl: string): Promise<XSpaceMetadata> {
    try {
      const spaceId = this.extractSpaceId(spaceUrl)
      if (!spaceId) {
        throw new Error('Invalid X Space URL format')
      }

      // Return basic metadata immediately to avoid API call errors during preview
      const basicMetadata: XSpaceMetadata = {
        id: spaceId,
        title: 'X Space Recording',
        hostUsername: 'Unknown',
        participantCount: 0,
        isLive: false,
        state: 'ended'
      }

      // Only attempt API calls if we have proper configuration
      if (this.twitterBearerToken && this.twitterBearerToken !== 'undefined' && this.twitterBearerToken.length > 10) {
        try {
          const apiUrl = `https://api.twitter.com/2/spaces/${spaceId}?expansions=host_ids&user.fields=username,name&space.fields=participant_count,speaker_ids,is_ticketed,state,scheduled_start,started_at,ended_at,topic_ids,title`
          
          const response = await this.makeApiRequest(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.twitterBearerToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response && response.ok) {
            const data = await response.json()
            if (data && data.data) {
              const space = data.data
              const host = data.includes?.users?.[0]
              
              return {
                id: space.id || spaceId,
                title: space.title || 'X Space Recording',
                hostUsername: host?.username || 'Unknown',
                participantCount: space.participant_count || 0,
                isLive: space.state === 'live',
                scheduledStart: space.scheduled_start,
                actualStart: space.started_at,
                estimatedEnd: space.ended_at,
                state: space.state || 'ended'
              }
            }
          }
        } catch (apiError) {
          console.warn('API call failed, using basic metadata:', apiError)
        }
      }

      return basicMetadata
    } catch (error) {
      console.error('Failed to extract space metadata:', error)
      
      // Always return valid metadata even if extraction fails
      return {
        id: 'unknown',
        title: 'X Space Recording',
        hostUsername: 'Unknown',
        participantCount: 0,
        isLive: false,
        state: 'ended'
      }
    }
  }

  async processXSpace(spaceUrl: string): Promise<XSpaceProcessingResult> {
    // Step 1: Extract metadata
    const metadata = await this.extractSpaceMetadata(spaceUrl)
    
    // Step 2: Try to get audio URL
    let audioBlob: Blob
    let audioUrl: string | undefined

    try {
      audioUrl = await this.extractAudioUrl(spaceUrl)
      audioBlob = await audioService.extractAudioFromUrl(audioUrl)
    } catch (error) {
      console.error('Failed to extract audio from X Space:', error)
      throw new Error('Unable to access X Space audio. The space may be private, expired, or audio may not be available for download.')
    }

    // Step 3: Convert audio to optimal format for transcription
    const processedAudio = await audioService.convertToWav(audioBlob)

    // Step 4: Transcribe audio
    const transcription = await transcriptionService.transcribeAudio(
      processedAudio, 
      `${metadata.title}.wav`
    )

    // Step 5: Generate summary
    const summary = await summaryService.generateSummary(
      transcription.text,
      transcription.speakers
    )

    return {
      metadata,
      transcription,
      summary,
      audioUrl
    }
  }

  private async extractAudioUrl(spaceUrl: string): Promise<string> {
    const spaceId = this.extractSpaceId(spaceUrl)
    
    // Try multiple methods to get audio URL
    const possibleUrls = [
      // Periscope/Twitter audio URLs (these are common patterns)
      `https://prod-fastly-us-west-1.video.pscp.tv/Transcoding/v1/hls/${spaceId}/transcode/us-west-1/periscope-replay-direct-prod-us-west-1-public/audio-space/master_playlist.m3u8`,
      `https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/${spaceId}/transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/master_playlist.m3u8`,
      `https://prod-fastly-eu-west-1.video.pscp.tv/Transcoding/v1/hls/${spaceId}/transcode/eu-west-1/periscope-replay-direct-prod-eu-west-1-public/audio-space/master_playlist.m3u8`
    ]

    for (const url of possibleUrls) {
      try {
        const response = await this.makeApiRequest(url, { method: 'HEAD' })
        if (response && response.ok) {
          return url
        }
      } catch (error) {
        continue
      }
    }

    // If direct URLs don't work, try to extract from Twitter's media endpoints
    if (this.twitterBearerToken && this.twitterBearerToken !== 'undefined' && this.twitterBearerToken.length > 10) {
      try {
        const mediaUrl = `https://api.twitter.com/2/spaces/${spaceId}/audio_stream`
        const response = await this.makeApiRequest(mediaUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.twitterBearerToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response && response.ok) {
          const data = await response.json()
          if (data && data.audio_url) {
            return data.audio_url
          }
        }
      } catch (error) {
        console.error('Failed to get audio URL from Twitter API:', error)
      }
    }

    throw new Error('No accessible audio streams found for this X Space')
  }

  private extractSpaceId(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided')
    }

    const patterns = [
      /\/spaces\/([a-zA-Z0-9]+)/,
      /spaces\.twitter\.com\/([a-zA-Z0-9]+)/,
      /\/status\/(\d+)/, // For tweet URLs containing spaces
      /\/i\/spaces\/([a-zA-Z0-9]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    throw new Error('Invalid X Space URL format')
  }

  private async makeApiRequest(url: string, options: RequestInit): Promise<Response | null> {
    try {
      // If proxy is configured, use it to avoid CORS issues
      if (this.proxyUrl !== 'undefined' && this.proxyToken !== 'undefined') {
        return await fetch(this.proxyUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.proxyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            method: options.method,
            headers: options.headers,
            body: options.body
          })
        })
      }

      // Direct API call (may have CORS issues in browser)
      return await fetch(url, options)
    } catch (error) {
      console.warn('API request failed:', error)
      return null
    }
  }
}

export const xSpaceService = new XSpaceService()
export type { XSpaceMetadata, XSpaceProcessingResult }
