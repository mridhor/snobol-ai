# Brave Search API Setup Guide

## What Changed
The system now uses **Brave Search API** instead of DuckDuckGo for better financial data retrieval.

## Why Brave Search?
- ✅ **Better quality results** - More comprehensive and structured data
- ✅ **Privacy-focused** - No tracking, independent index
- ✅ **Free tier available** - 2,000 queries per month (enough for typical usage)
- ✅ **Better for financial data** - Includes structured data (infoboxes) and rich snippets

## Setup Instructions

### 1. Get Your Free API Key

1. Visit: **https://api.search.brave.com/register**
2. Sign up for a free account
3. Choose the **Free Plan** (2,000 queries/month)
4. Copy your API key (starts with `BSA...`)

### 2. Add API Key to Environment Variables

Create a `.env.local` file in the project root (if it doesn't exist):

```bash
# OpenAI API Key (existing)
OPENAI_API_KEY=your_openai_api_key_here

# Brave Search API Key (NEW)
BRAVE_SEARCH_API_KEY=BSAxxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart the Development Server

```bash
npm run dev
```

## How It Works

The system now uses Brave Search API for:
- **Stock quotes** - Gets real-time information from web results
- **Company analysis** - Pulls overview, financials, and risk data
- **Chart data** - Enhanced context for TradingView charts

## Fallback Behavior

If the Brave Search API key is not configured or the API fails:
- ✅ The system gracefully falls back to placeholder responses
- ✅ Users still see helpful guidance and source links
- ✅ TradingView charts still render properly

## API Limits

**Free Tier:**
- 2,000 queries per month
- 1 query per second rate limit
- Sufficient for typical chatbot usage

**Example Usage:**
- "Analyze Apple stock" = ~3 API calls (overview + financials + risks)
- With 2,000 queries/month, you can analyze ~650 companies/month

## Monitoring Usage

Check your API usage at:
https://api.search.brave.com/app/dashboard

## Upgrade Options

If you need more queries:
- **Paid plans** start at $5/month for 20,000 queries
- Contact Brave for enterprise pricing

## Testing

Test the integration:
```bash
curl -H "X-Subscription-Token: YOUR_API_KEY" \
  "https://api.search.brave.com/res/v1/web/search?q=AAPL+stock+price"
```

Expected response: JSON with search results including structured data.

## Source Links

All responses now include "Brave Search" source pills that link to:
- `https://search.brave.com/search?q=...`

This allows users to verify information directly on Brave Search.

## Benefits Over DuckDuckGo

| Feature | DuckDuckGo | Brave Search |
|---------|------------|--------------|
| Structured data (infoboxes) | ❌ Limited | ✅ Yes |
| Rich snippets | ❌ Minimal | ✅ Comprehensive |
| Financial data quality | ⚠️ Basic | ✅ Enhanced |
| Privacy | ✅ Yes | ✅ Yes |
| API rate limits | ❌ None (but poor data) | ✅ 2,000/month free |
| Authentication | ❌ None needed | ✅ API key required |

## Questions?

Contact: hello@snobol.ai

