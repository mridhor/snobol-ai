# Migration: Brave Search → Alpha Vantage

## Summary

Successfully migrated from **Brave Search API** to **Alpha Vantage API** for superior financial data quality and structured company information.

## Why the Change?

### Brave Search Issues:
- Web search results, not structured financial data
- Inconsistent data quality
- Required parsing of HTML/text snippets
- Less reliable for financial metrics

### Alpha Vantage Benefits:
- ✅ **Real Financial Data** - Direct from market data sources
- ✅ **Structured JSON** - Clean, parseable company fundamentals
- ✅ **Comprehensive** - Market cap, revenue, profit margins, P/E ratios, beta
- ✅ **Reliable** - Industry-standard API
- ✅ **Free Tier** - 25 calls/day (sufficient for typical usage)

## What Changed

### Files Modified:

1. **`/src/lib/functionExecutors.ts`**
   - Replaced `searchWeb()` function to use Alpha Vantage API
   - Changed from web scraping to structured API calls
   - Added intelligent data extraction based on query type
   - Updated all "Brave Search" references to "Alpha Vantage"
   - Updated source links to Alpha Vantage URLs

2. **`/README.md`**
   - Updated setup instructions
   - Changed API key requirement from `BRAVE_SEARCH_API_KEY` to `ALPHA_API_KEY`
   - Updated features list

3. **`/ALPHA_VANTAGE_SETUP.md`** (NEW)
   - Complete setup guide
   - API key instructions
   - Usage examples
   - Rate limit info

4. **`/ALPHA_VANTAGE_MIGRATION.md`** (THIS FILE)
   - Migration documentation

## Environment Variable Change

### Old:
```bash
BRAVE_SEARCH_API_KEY=your_brave_api_key_here
```

### New:
```bash
ALPHA_API_KEY=your_alpha_vantage_api_key_here
```

## API Endpoints Used

### Company Overview
```
GET https://www.alphavantage.co/query?function=OVERVIEW&symbol={TICKER}&apikey={KEY}
```

Returns structured JSON with:
- Description (shortened to 2 sentences for Nordic style)
- Sector & Industry
- Market Capitalization
- Revenue (TTM)
- Profit Margin
- P/E Ratio
- Beta (volatility)
- And more...

## Data Extraction Logic

The new `searchWeb()` function intelligently extracts data based on query type:

### Company Overview Queries
Keywords: `overview`, `company`, `business`, `description`, `about`

Returns:
- Short description (2 sentences - Nordic style!)
- Sector
- Industry

### Financial Queries
Keywords: `financial`, `revenue`, `profit`, `earnings`, `margin`

Returns:
- Market cap ($B)
- Profit margin (%)
- Revenue ($B)

### Risk/Analysis Queries
Keywords: `risk`, `competition`, `challenge`

Returns:
- Beta (volatility vs market)
- P/E ratio

## Rate Limits

| Plan | Calls/Day | Calls/Minute | Cost |
|------|-----------|--------------|------|
| Free | 25 | 5 | $0 |
| Premium | Varies | 120+ | $49.99+/month |

**Free tier is sufficient for:**
- ~8 stock analyses per day
- Testing and development
- Light production use

## Error Handling

The system gracefully handles:
- ✅ Missing API key → fallback to placeholder
- ✅ Rate limit exceeded → fallback to placeholder
- ✅ Invalid symbol → fallback to placeholder
- ✅ Network errors → fallback to placeholder
- ✅ TradingView charts still render in all cases

## Source Citations

**Before (Brave):**
- `https://search.brave.com/search?q=AAPL+company+overview`

**After (Alpha Vantage):**
- `https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL`

Users can click source pills to see raw Alpha Vantage data.

## Comparison

| Feature | Brave Search | Alpha Vantage |
|---------|--------------|---------------|
| Data Type | Web search | Structured financial data |
| Quality | ⚠️ Variable | ✅ High |
| Reliability | ⚠️ Depends on web | ✅ Dedicated API |
| Rate Limits | ✅ 2,000/month | ⚠️ 25/day |
| Setup | Email | Email |
| Cost | Free | Free (with limits) |
| Financial Metrics | ❌ Scraped | ✅ Native |
| Company Info | ⚠️ Search results | ✅ Structured |
| Nordic Style | ❌ Too verbose | ✅ We shorten it |

## Testing

### Before Migration (Brave):
```bash
curl -H "X-Subscription-Token: KEY" \
  "https://api.search.brave.com/res/v1/web/search?q=AAPL+stock"
```

### After Migration (Alpha Vantage):
```bash
curl "https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=KEY"
```

### Test in Chatbot:
```bash
curl -sS -N -H "Content-Type: application/json" \
  -X POST \
  -d '{"messages":[{"role":"user","content":"Analyze Apple stock"}]}' \
  http://localhost:3000/api/chat/stream | head -n 80
```

Should return:
- Short company description (2 sentences)
- Key financial metrics
- TradingView chart
- Alpha Vantage source link

## Setup Steps

1. **Get Alpha Vantage API Key**:
   - Visit: https://www.alphavantage.co/support/#api-key
   - Enter email
   - Get instant free API key

2. **Update Environment**:
   ```bash
   # Remove old
   # BRAVE_SEARCH_API_KEY=...
   
   # Add new
   ALPHA_API_KEY=your_alpha_vantage_key_here
   ```

3. **Restart Server**:
   ```bash
   npm run dev
   ```

4. **Test**:
   - Ask: "Analyze AAPL"
   - Should see real Alpha Vantage data
   - Check source pill links to Alpha Vantage

## Rollback (if needed)

If you need to revert to Brave Search:
1. Check git history for previous `searchWeb()` implementation
2. Restore old code
3. Change env var back to `BRAVE_SEARCH_API_KEY`
4. Restart server

**However**, Alpha Vantage provides superior data quality, so rollback not recommended.

## Benefits Summary

✅ **Real financial data** instead of web search results
✅ **Structured JSON** instead of HTML parsing
✅ **Reliable metrics** (market cap, P/E, beta, margins)
✅ **Nordic style** - We shorten descriptions to 2 sentences
✅ **Contrarian friendly** - Better data for fear/opportunity analysis
✅ **Professional grade** - Industry-standard API
✅ **Free tier** - 25 calls/day sufficient for typical use

## Next Steps

1. Get your Alpha Vantage API key
2. Add `ALPHA_API_KEY` to `.env.local`
3. Restart development server
4. Test with "Analyze AAPL stock"
5. Verify data quality and Nordic-style responses

---

**Migration completed successfully! 📊**

Alpha Vantage provides superior financial data for Snobol's contrarian analysis.
