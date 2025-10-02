# Alpha Vantage API Setup Guide

## What is Alpha Vantage?

Alpha Vantage provides enterprise-grade financial market data through a set of powerful and developer-friendly APIs. It's perfect for Snobol's contrarian analysis approach.

## Why Alpha Vantage?

- ✅ **Real Financial Data** - Actual company fundamentals, not just web search
- ✅ **Free Tier** - 25 API calls per day (sufficient for typical usage)
- ✅ **Comprehensive** - Company overviews, financials, market data
- ✅ **Reliable** - Industry-standard API used by thousands of apps
- ✅ **Easy Setup** - Free API key in seconds

## Setup Instructions

### 1. Get Your Free API Key

1. Visit: **https://www.alphavantage.co/support/#api-key**
2. Enter your email
3. Click "GET FREE API KEY"
4. Copy your API key (starts with a mix of letters/numbers)

### 2. Add API Key to Environment Variables

Create or update `.env.local` file in the project root:

```bash
# OpenAI API Key (existing)
OPENAI_API_KEY=your_openai_api_key_here

# Alpha Vantage API Key (NEW)
ALPHA_API_KEY=your_alpha_vantage_api_key_here
```

### 3. Restart the Development Server

```bash
npm run dev
```

## How It Works

Alpha Vantage is now used for:
- **Company Analysis** - Real business descriptions, sector, industry
- **Financial Data** - Market cap, profit margins, revenue
- **Stock Quotes** - Company fundamentals and key metrics
- **Risk Assessment** - Beta, P/E ratios, volatility data

### Data Retrieved:

- **Company Overview**: Description, sector, industry
- **Financials**: Market cap, revenue, profit margins
- **Risk Metrics**: Beta, P/E ratio, volatility
- **Market Data**: Real-time and historical quotes

## API Limits

**Free Tier:**
- 25 API calls per day
- 5 API calls per minute
- No credit card required
- Sufficient for typical chatbot usage

**Usage Estimation:**
- 1 stock analysis = ~3 API calls (overview + financials + risks)
- 25 calls/day ÷ 3 = **~8 stock analyses per day**
- Perfect for testing and light production use

**If you need more:**
- Premium plans start at $49.99/month for 120 calls/minute
- https://www.alphavantage.co/premium/

## Fallback Behavior

If Alpha Vantage API key is missing or rate limit is hit:
- ✅ System falls back to placeholder responses
- ✅ Users still see helpful guidance
- ✅ Source links still provided
- ✅ TradingView charts still render
- ⚠️ Warning logged in console

## Testing

### Test the API directly:
```bash
curl "https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=YOUR_API_KEY"
```

Expected response: JSON with company overview data

### Test in the chatbot:
1. Set `ALPHA_API_KEY` in `.env.local`
2. Restart server: `npm run dev`
3. Ask: "Analyze Apple stock"
4. Should see real financial data from Alpha Vantage

## Available Endpoints Used

### 1. Company Overview
```
GET https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=YOUR_KEY
```

Returns:
- Description
- Sector & Industry
- Market Cap
- Revenue
- Profit Margin
- P/E Ratio
- Beta
- And more...

## Benefits Over Previous Solution

| Feature | Brave Search | Alpha Vantage |
|---------|--------------|---------------|
| Data Quality | ⚠️ Web search results | ✅ Real financial data |
| Company Fundamentals | ❌ Limited | ✅ Comprehensive |
| Financial Metrics | ❌ Not structured | ✅ Structured JSON |
| Reliability | ⚠️ Depends on search | ✅ Dedicated API |
| Rate Limits | ✅ 2,000/month free | ⚠️ 25/day free |
| Setup | ✅ Email required | ✅ Email required |

## Monitoring Usage

Check your API usage at:
https://www.alphavantage.co/support/#api-key

(Login with your email to see usage stats)

## Best Practices

1. **Cache Results**: Alpha Vantage data doesn't change every second, consider caching responses
2. **Monitor Rate Limits**: Watch your daily usage (25 calls/day free)
3. **Handle Errors**: Code already includes fallbacks for rate limits
4. **Upgrade if Needed**: If you hit limits regularly, consider Premium

## Error Messages

### Rate Limit Hit:
```json
{
  "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute..."
}
```
**Solution**: Wait a minute or upgrade to premium

### Invalid Symbol:
```json
{
  "Symbol": null
}
```
**Solution**: Verify ticker symbol is correct

### Invalid API Key:
```json
{
  "Error Message": "Invalid API call..."
}
```
**Solution**: Check your API key in `.env.local`

## Support

- **Documentation**: https://www.alphavantage.co/documentation/
- **Support**: https://www.alphavantage.co/support/
- **Community**: https://github.com/RomelTorres/alpha_vantage

## Questions?

See the main [README.md](./README.md) or contact: hello@snobol.ai

---

**Alpha Vantage integration complete! 📊**

