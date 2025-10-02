# AI Chatbot Setup Guide

This guide explains how to set up and configure the AI chatbot powered by OpenAI's GPT.

## Features

✅ **Real-time GPT Integration** - Powered by OpenAI's GPT-4o-mini model
✅ **Streaming Support** - Two API endpoints (standard and streaming)
✅ **Beautiful UI** - Full-screen overlay chat interface similar to OpenAI's design
✅ **Smart Context** - Custom system prompt with Snobol-specific knowledge
✅ **Error Handling** - Graceful error handling with user-friendly messages
✅ **Loading States** - Visual feedback during API calls
✅ **Responsive Design** - Works seamlessly on all devices

## Setup Instructions

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy your API key (you won't be able to see it again!)

### 2. Configure Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Restart Development Server

If your dev server is running, restart it to load the new environment variables:

```bash
npm run dev
```

## API Endpoints

### 1. Standard Chat API (`/api/chat`)

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is Snobol?" }
  ]
}
```

**Response:**
```json
{
  "message": "Snobol is an AI-powered investment platform...",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 123,
    "total_tokens": 168
  }
}
```

### 2. Streaming Chat API (`/api/chat/stream`)

**Endpoint:** `POST /api/chat/stream`

Returns a streaming response for real-time text generation. Use this for a more interactive chat experience.

## Customization

### Update System Prompt

Edit `/src/app/api/chat/route.ts` to customize the AI's behavior:

```typescript
const SYSTEM_PROMPT = `You are Snobol AI Assistant...`;
```

### Change AI Model

In the API route files, you can change the model:

```typescript
model: "gpt-4o-mini", // Options: "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"
```

**Model Recommendations:**
- `gpt-4o-mini` - Best balance of cost and performance (recommended)
- `gpt-4` - Most capable, higher cost
- `gpt-4-turbo` - Fast and capable, moderate cost
- `gpt-3.5-turbo` - Fastest and cheapest, less capable

### Adjust Response Length

Modify the `max_tokens` parameter:

```typescript
max_tokens: 500, // Increase for longer responses
```

## Component Structure

```
src/
├── components/
│   └── ChatbotPill.tsx          # Main chatbot UI component
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts         # Standard chat endpoint
│   │       └── stream/
│   │           └── route.ts     # Streaming chat endpoint
│   └── page.tsx                 # Homepage with chatbot
```

## Usage in Code

The chatbot is already integrated into your homepage. To add it to other pages:

```tsx
import ChatbotPill from "@/components/ChatbotPill";

export default function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <ChatbotPill />
    </div>
  );
}
```

## Cost Considerations

OpenAI charges based on tokens (input + output). Approximate costs:

- **GPT-4o-mini**: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- **GPT-4**: $30 per 1M input tokens, $60 per 1M output tokens
- **GPT-3.5-turbo**: $0.50 per 1M input tokens, $1.50 per 1M output tokens

**Average conversation (10 messages):** ~$0.01 with GPT-4o-mini

## Error Handling

The chatbot includes comprehensive error handling:

- ✅ Invalid API key detection
- ✅ Rate limit handling
- ✅ Network error recovery
- ✅ User-friendly error messages
- ✅ Fallback responses

## Troubleshooting

### "OpenAI API key is not configured"
- Ensure `.env.local` exists with valid `OPENAI_API_KEY`
- Restart your development server

### "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a few minutes or upgrade your OpenAI plan

### "Invalid API key"
- Check that your API key is correct in `.env.local`
- Ensure the key hasn't been revoked

### Chat not responding
- Open browser console (F12) to check for errors
- Verify API key is set correctly
- Check OpenAI API status: https://status.openai.com/

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control
- Keep your API key secret
- The `.env.example` file is safe to commit (no actual keys)
- Consider implementing rate limiting for production
- Add authentication to prevent unauthorized API usage

## Production Deployment

Before deploying to production:

1. Add environment variable in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other: Follow platform-specific guides

2. Consider implementing:
   - Rate limiting per user/IP
   - Conversation history persistence
   - Analytics tracking
   - Cost monitoring

## Next Steps

- [ ] Add streaming support to frontend for real-time responses
- [ ] Implement conversation history persistence
- [ ] Add user authentication
- [ ] Set up usage monitoring
- [ ] Implement rate limiting
- [ ] Add feedback mechanism for responses

## Support

For questions or issues:
- Email: hello@snobol.com
- OpenAI Documentation: https://platform.openai.com/docs

