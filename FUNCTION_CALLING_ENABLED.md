# ✅ Function Calling - ENABLED!

## 🎉 What's Now Active

Your Snobol AI chatbot can now **fetch real-time data** and interact with external APIs! 

### 🛠️ Available Tools

1. **📊 get_stock_quote** - Live stock prices
2. **🏢 analyze_company** - Company financials & analysis  
3. **📈 show_stock_chart** - Interactive price charts
4. **🔍 search_web** - Web search for current info

---

## 🚀 How to Use

Users can now ask questions like:

### Stock Quotes
```
"What's Apple's stock price?"
"Show me Tesla's current price"
"How is Microsoft stock doing?"
```

**Result:** Real-time price, change %, volume, day range from Yahoo Finance

---

### Company Analysis
```
"Analyze Apple's financial health"
"Tell me about Microsoft's business"
"Evaluate Amazon's financials"
```

**Result:** Sector, market cap, P/E ratio, debt levels, profit margins, business description

---

### Stock Charts
```
"Show me Apple's stock chart"
"Display Tesla's chart for 1 year"
"Chart Google stock for 6 months"
"Visualize Microsoft's price"
```

**Result:** Beautiful interactive chart with real Yahoo Finance data!

**Available periods:**
- 1d (intraday)
- 5d (5 days)
- 1mo (1 month)
- 3mo (3 months)
- 6mo (6 months, default)
- 1y (1 year)
- 5y (5 years)

---

### Web Search
```
"Search for news about market crash"
"What's happening with tech stocks?"
"Find recent news about recession"
```

**Result:** Current information from web search

---

## 🎯 What Happens Behind the Scenes

1. **User asks question** → "What's Apple's stock price?"
2. **AI recognizes** → Needs real-time data
3. **AI calls function** → `get_stock_quote("AAPL")`
4. **Function executes** → Fetches from Yahoo Finance API
5. **Data returned** → Price: $175.43, +2.35%
6. **AI explains** → In friendly, beginner language
7. **User sees answer** → With real, current data!

---

## 💡 Technical Details

### Implementation:
- ✅ `src/app/api/chat/stream/route.ts` - Function calling logic
- ✅ `src/lib/aiTools.ts` - Tool definitions
- ✅ `src/lib/functionExecutors.ts` - Function implementations
- ✅ `src/components/StockChart.tsx` - Chart component
- ✅ `src/components/ChatbotPill.tsx` - Chart rendering

### APIs Used (All FREE):
- **Yahoo Finance** - Stock quotes, company data, historical prices
- **DuckDuckGo** - Web search (no API key)

### Flow:
```
User Question
    ↓
GPT-5 decides if tool needed
    ↓
Tool call with parameters
    ↓
Execute function (API call)
    ↓
Return data to AI
    ↓
AI processes & explains
    ↓
Stream response to user
```

---

## 🧪 Test It Now!

Try these commands in your chatbot:

1. **"What's Tesla's stock price?"**
   - Should return real-time TSLA price

2. **"Show me Apple's chart for 1 year"**
   - Should display interactive AAPL chart

3. **"Analyze Microsoft's financial health"**
   - Should show MSFT company analysis

4. **"Search for news about market volatility"**
   - Should return current web results

---

## 📊 Chart Features

When users ask for charts, they get:
- ✅ Real-time price data
- ✅ Interactive tooltips on hover
- ✅ Green/red colors based on performance
- ✅ Multiple time periods
- ✅ Fully responsive design
- ✅ Clean, professional appearance

---

## 🔒 Safety & Limits

- **Rate limiting**: Built into Yahoo Finance API
- **Error handling**: Graceful fallbacks if APIs fail
- **Data freshness**: ~15 min delay (standard for free data)
- **No API keys needed**: All services are free-tier

---

## 🎨 Customization

Want to modify the behavior?

### Add more tools:
Edit `src/lib/aiTools.ts` to add new functions

### Change chart styling:
Edit `src/components/StockChart.tsx`

### Modify AI instructions:
Edit system prompt in `src/app/api/chat/stream/route.ts`

---

## 📈 Performance

- **Speed**: Tools execute in parallel when multiple needed
- **Streaming**: Responses stream even while fetching data
- **Caching**: Consider adding Redis for frequently requested stocks
- **Cost**: $0 - All APIs are free!

---

## 🚨 Troubleshooting

### "No data found for symbol"
- Check ticker symbol is correct (AAPL not Apple)
- Some stocks may not be available

### Chart not showing
- Check browser console for errors
- Verify Yahoo Finance API is accessible

### Slow responses
- Yahoo Finance may rate limit during high traffic
- Consider caching popular stocks

---

## 🎉 You're All Set!

Your chatbot is now a **powerful financial assistant** with access to real-time market data!

Users can:
- ✅ Get live stock prices
- ✅ Analyze companies
- ✅ View interactive charts  
- ✅ Search for current news

All while maintaining Snobol AI's friendly, crisis-investing focused personality! 🚀

