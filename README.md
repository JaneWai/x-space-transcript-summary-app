# X Space Transcriber

A powerful web application that transforms X Space recordings and audio files into accurate transcripts with AI-powered summaries and insights.

## Features

- **X Space URL Processing**: Direct processing of X Space URLs to extract audio and generate transcripts
- **File Upload Support**: Upload audio files in various formats (MP3, WAV, M4A, etc.)
- **AI Transcription**: High-accuracy speech-to-text using OpenAI Whisper
- **Smart Summaries**: AI-generated summaries with key points, topics, and sentiment analysis
- **Speaker Identification**: Automatic detection and labeling of different speakers
- **Export Options**: Download transcripts in TXT or JSON formats
- **Real-time Processing**: Live status updates during processing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for transcription and summaries
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Required for X Space metadata extraction
VITE_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Optional: For bypassing CORS issues
VITE_PROXY_SERVER_URL=https://your-proxy-server.com/api/proxy
VITE_PROXY_SERVER_ACCESS_TOKEN=your_proxy_access_token_here
```

### 3. Start Development Server

```bash
npm run dev
```

## API Keys Setup

### OpenAI API Key
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### Twitter Bearer Token
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use existing one
3. Generate a Bearer Token
4. Add it to your `.env` file as `VITE_TWITTER_BEARER_TOKEN`

### Proxy Server (Optional)
If you encounter CORS issues when making API requests, you can set up a proxy server or use a service like:
- [CORS Anywhere](https://cors-anywhere.herokuapp.com/)
- Your own proxy server

## Usage

### Processing X Space URLs

1. Click on "Process X Space URL" tab
2. Enter a valid X Space URL (e.g., `https://x.com/i/spaces/1234567890`)
3. Wait for validation and processing
4. View transcription and AI-generated summary

### Uploading Audio Files

1. Click on "Upload Audio File" tab
2. Drag and drop or select an audio file
3. Supported formats: MP3, WAV, M4A, FLAC, OGG
4. Wait for processing and view results

## Supported X Space URL Formats

- `https://x.com/i/spaces/[space-id]`
- `https://twitter.com/i/spaces/[space-id]`
- `https://spaces.twitter.com/[space-id]`
- Tweet URLs containing X Space links

## Technical Architecture

### Services

- **XSpaceService**: Handles X Space URL validation, metadata extraction, and audio URL discovery
- **AudioService**: Processes audio files and converts them to optimal formats for transcription
- **TranscriptionService**: Integrates with OpenAI Whisper API for speech-to-text conversion
- **SummaryService**: Uses GPT-4 to generate comprehensive summaries and insights

### Components

- **InputSelector**: Tabbed interface for file upload and URL input
- **ProcessingStatus**: Real-time processing status with progress indicators
- **TranscriptionResult**: Comprehensive display of transcription results with export options
- **UrlInput**: Specialized component for X Space URL validation and processing

## Limitations

- X Space audio availability depends on Twitter/X's policies and the space's privacy settings
- Some X Spaces may not have downloadable audio streams
- API rate limits apply based on your OpenAI and Twitter API plans
- CORS restrictions may require proxy server setup for production use

## Troubleshooting

### Common Issues

1. **"Invalid or inaccessible X Space URL"**
   - Ensure the X Space has ended and audio is available
   - Check if the space is public
   - Verify your Twitter Bearer Token is valid

2. **"Failed to transcribe audio"**
   - Check your OpenAI API key
   - Ensure you have sufficient API credits
   - Verify the audio file is not corrupted

3. **CORS Errors**
   - Set up a proxy server
   - Use the proxy configuration in your `.env` file

### Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all API keys are correctly configured
3. Ensure the X Space URL is valid and accessible
4. Try with a different audio file or X Space URL

## License

MIT License - see LICENSE file for details.
