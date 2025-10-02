# Rate Limiting Solution for Snobol AI Chatbot

## 🔍 Problem
You were experiencing "Rate limit exceeded" errors because:

1. **No rate limiting** - Users could send unlimited requests
2. **Inefficient token usage** - Sending entire conversation history with every request
3. **OpenAI tier limits** - Free/low-tier accounts have strict limits:
   - Free tier: 3 requests/min for GPT-4, 200 req/min for GPT-3.5-turbo
   - Tier 1: 500 req/min, 40,000 tokens/min

## ✅ Solutions Implemented

### 1. **Client-Side Rate Limiting** (`ChatbotPill.tsx`)
- ✅ Minimum 2-second cooldown between messages
- ✅ User-friendly error messages
- ✅ Better rate limit error handling

### 2. **Server-Side Rate Limiting** (`api/chat/route.ts`)
- ✅ 10 requests per minute per IP address
- ✅ Prevents API abuse even if frontend is bypassed
- ✅ In-memory tracking (resets on deployment)

### 3. **Token Optimization**
- ✅ Only sends last 10 messages instead of entire conversation
- ✅ Reduces token usage by ~70% for long conversations
- ✅ Stays within OpenAI's token limits

## 📊 Rate Limit Details

### Current Settings
```
Client-side: 1 request per 2 seconds
Server-side: 10 requests per minute per IP
Message history: Last 10 messages only
```

### How to Adjust
**More restrictive** (if still hitting limits):
```typescript
// In ChatbotPill.tsx, line 47
if (timeSinceLastRequest < 5000) { // 5 seconds

// In api/chat/route.ts, line 14
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute
```

**Less restrictive** (after upgrading OpenAI tier):
```typescript
// In ChatbotPill.tsx, line 47
if (timeSinceLastRequest < 1000) { // 1 second

// In api/chat/route.ts, line 14
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute
```

## 🚀 Next Steps

### 1. Check Your OpenAI Account Tier
Visit: https://platform.openai.com/account/limits

**To upgrade:**
- Add payment method at https://platform.openai.com/account/billing
- Spend $5+ to reach Tier 1 (500 req/min)
- Spend $50+ to reach Tier 2 (5,000 req/min)

### 2. Deploy the Changes
```bash
git add .
git commit -m "Add rate limiting and optimize token usage"
git push origin main
```

### 3. Monitor Usage
- Check OpenAI dashboard: https://platform.openai.com/usage
- Check Vercel logs for rate limit hits
- Adjust limits as needed

## 💡 Alternative Solutions

### Option A: Use Redis for Distributed Rate Limiting
If you scale to multiple Vercel instances:
```bash
npm install @upstash/redis @upstash/ratelimit
```

### Option B: Add User Authentication
- Track limits per user instead of per IP
- Give premium users higher limits
- Better abuse prevention

### Option C: Queue System
- Queue messages during high traffic
- Process them gradually
- Better user experience during spikes

## 📝 Testing

Test the rate limiting locally:
```bash
npm run dev
```

Then try:
1. Send messages rapidly (should see cooldown message)
2. Send 11 messages in 1 minute (should hit server limit)
3. Wait 1 minute and try again (should work)

## 🆘 Still Having Issues?

If you're still hitting rate limits:

1. **Check OpenAI tier** - Upgrade if on free tier
2. **Reduce MAX_REQUESTS_PER_WINDOW** to 3-5
3. **Increase cooldown** to 5-10 seconds
4. **Consider caching** common responses
5. **Add queue system** for peak times

## 📞 Support

For persistent issues:
- OpenAI support: https://help.openai.com/
- Check status: https://status.openai.com/

