interface SummaryResult {
  summary: string
  keyPoints: string[]
  topics: string[]
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  actionItems: string[]
  participants: string[]
}

class SummaryService {
  private readonly openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
  private readonly proxyUrl = import.meta.env.VITE_PROXY_SERVER_URL || 'undefined'
  private readonly proxyToken = import.meta.env.VITE_PROXY_SERVER_ACCESS_TOKEN || 'undefined'

  async generateSummary(transcript: string, speakers: string[] = []): Promise<SummaryResult> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
    }

    try {
      const prompt = this.createSummaryPrompt(transcript, speakers)
      
      const requestBody = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing conversations and creating comprehensive summaries. You specialize in X Space recordings and understand the format of social audio conversations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }

      const response = await this.makeApiRequest('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Summary generation failed: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No summary content received from API')
      }

      return this.parseSummaryResponse(content, speakers)
    } catch (error) {
      console.error('Summary generation error:', error)
      throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private createSummaryPrompt(transcript: string, speakers: string[]): string {
    return `Please analyze this X Space transcript and provide a comprehensive analysis in the following JSON format:

{
  "summary": "A detailed 2-3 paragraph summary of the main discussion",
  "keyPoints": ["List of 5-8 key points or takeaways"],
  "topics": ["Main topics discussed"],
  "sentiment": "overall sentiment (positive/negative/neutral/mixed)",
  "actionItems": ["Any action items or next steps mentioned"],
  "participants": ["Key participants and their roles if identifiable"]
}

Transcript:
${transcript}

${speakers.length > 0 ? `\nIdentified Speakers: ${speakers.join(', ')}` : ''}

Please ensure your response is valid JSON and captures the essence of this X Space conversation.`
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
          headers: options.headers,
          body: options.body
        })
      })
    }

    // Direct API call (may have CORS issues in browser)
    return fetch(url, options)
  }

  private parseSummaryResponse(content: string, speakers: string[]): SummaryResult {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || 'Summary could not be generated.',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          topics: Array.isArray(parsed.topics) ? parsed.topics : [],
          sentiment: this.validateSentiment(parsed.sentiment),
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          participants: Array.isArray(parsed.participants) ? parsed.participants : speakers
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to text parsing')
    }

    // Fallback: Parse structured text response
    return this.parseTextResponse(content, speakers)
  }

  private parseTextResponse(content: string, speakers: string[]): SummaryResult {
    const lines = content.split('\n').filter(line => line.trim())
    
    let summary = ''
    let keyPoints: string[] = []
    let topics: string[] = []
    let sentiment: SummaryResult['sentiment'] = 'neutral'
    let actionItems: string[] = []
    
    let currentSection = ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.toLowerCase().includes('summary')) {
        currentSection = 'summary'
        continue
      } else if (trimmed.toLowerCase().includes('key points') || trimmed.toLowerCase().includes('takeaways')) {
        currentSection = 'keypoints'
        continue
      } else if (trimmed.toLowerCase().includes('topics')) {
        currentSection = 'topics'
        continue
      } else if (trimmed.toLowerCase().includes('sentiment')) {
        currentSection = 'sentiment'
        continue
      } else if (trimmed.toLowerCase().includes('action')) {
        currentSection = 'actions'
        continue
      }
      
      if (currentSection === 'summary' && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
        summary += (summary ? ' ' : '') + trimmed
      } else if (currentSection === 'keypoints' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        keyPoints.push(trimmed.replace(/^[-•]\s*/, ''))
      } else if (currentSection === 'topics' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        topics.push(trimmed.replace(/^[-•]\s*/, ''))
      } else if (currentSection === 'actions' && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
        actionItems.push(trimmed.replace(/^[-•]\s*/, ''))
      } else if (currentSection === 'sentiment') {
        const sentimentMatch = trimmed.toLowerCase().match(/(positive|negative|neutral|mixed)/)
        if (sentimentMatch) {
          sentiment = sentimentMatch[1] as SummaryResult['sentiment']
        }
      }
    }
    
    return {
      summary: summary || 'Summary could not be generated.',
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Key points could not be extracted.'],
      topics: topics.length > 0 ? topics : ['Topics could not be identified.'],
      sentiment,
      actionItems,
      participants: speakers
    }
  }

  private validateSentiment(sentiment: any): SummaryResult['sentiment'] {
    const validSentiments = ['positive', 'negative', 'neutral', 'mixed']
    return validSentiments.includes(sentiment) ? sentiment : 'neutral'
  }
}

export const summaryService = new SummaryService()
export type { SummaryResult }
