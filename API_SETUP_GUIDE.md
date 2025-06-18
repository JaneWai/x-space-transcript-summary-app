# API Configuration Guide

Follow these steps to configure your API keys for the X Space Transcriber:

## 1. OpenAI API Key (Required for Transcription)

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Add to .env file
Replace `your_openai_api_key_here` in your `.env` file with your actual key:
```
VITE_OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**Cost**: ~$0.006 per minute of audio for Whisper transcription + ~$0.03 per 1K tokens for GPT-4 summaries

## 2. Twitter Bearer Token (Required for X Space Metadata)

### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Apply for a developer account (free)
3. Create a new app or use existing one

### Step 2: Generate Bearer Token
1. In your app dashboard, go to "Keys and tokens"
2. Under "Authentication Tokens", click "Generate" for Bearer Token
3. Copy the Bearer Token

### Step 3: Add to .env file
Replace `your_twitter_bearer_token_here` in your `.env` file:
```
VITE_TWITTER_BEARER_TOKEN=your-actual-bearer-token-here
```

**Note**: Twitter API v2 has rate limits but the basic tier is free for most use cases.

## 3. Proxy Server (Optional - for CORS handling)

Since you're running in a browser environment, you might encounter CORS issues. Here are your options:

### Option A: Use a Free CORS Proxy (Easiest)
Update your `.env` file:
```
VITE_PROXY_SERVER_URL=https://cors-anywhere.herokuapp.com/
VITE_PROXY_SERVER_ACCESS_TOKEN=undefined
```

### Option B: No Proxy (Try Direct API Calls)
Keep the current settings:
```
VITE_PROXY_SERVER_URL=undefined
VITE_PROXY_SERVER_ACCESS_TOKEN=undefined
```

### Option C: Set Up Your Own Proxy Server
If you have your own proxy server, configure accordingly.

## 4. Final .env File Example

Your `.env` file should look like this:
```env
# Twitter/X API Configuration
VITE_TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid%2BULvsea4JtiGRiSDSJSI%3DEUifiRBkKG5E2XzMDjRfl76ZC9Ub0wnz4XsNiRVBChTYbJcE3F
VITE_TWITTER_API_KEY=your_twitter_api_key_here
VITE_TWITTER_API_SECRET=your_twitter_api_secret_here

# OpenAI API Configuration
VITE_OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ

# Proxy Server Configuration (for bypassing CORS)
VITE_PROXY_SERVER_URL=https://cors-anywhere.herokuapp.com/
VITE_PROXY_SERVER_ACCESS_TOKEN=undefined
```

## 5. Restart Development Server

After updating your `.env` file:
```bash
npm run dev
```

## Troubleshooting

### Common Issues:

1. **"OpenAI API key not configured"**
   - Make sure your key starts with `sk-`
   - Ensure no extra spaces in the .env file
   - Restart the dev server after changes

2. **"Twitter API authentication failed"**
   - Verify your Bearer Token is correct
   - Check if your Twitter app has the right permissions
   - Ensure your developer account is approved

3. **CORS Errors**
   - Try using the CORS proxy option
   - Check browser console for specific error messages

4. **"Rate limit exceeded"**
   - Wait a few minutes and try again
   - Consider upgrading your API plans if needed

### Testing Your Setup:

1. Try uploading a small audio file first (doesn't require Twitter API)
2. Test with a public X Space URL
3. Check browser console for any error messages

## Cost Estimates

- **OpenAI Whisper**: ~$0.006 per minute of audio
- **OpenAI GPT-4**: ~$0.03 per 1K tokens (summaries)
- **Twitter API**: Free tier available
- **Total**: ~$0.01-0.05 per X Space depending on length

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and don't share them
- Consider using environment-specific keys for production
