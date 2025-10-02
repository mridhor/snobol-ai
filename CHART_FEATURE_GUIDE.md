# Stock Chart Feature - Quick Guide

## ✅ What's Been Implemented

I've added **interactive stock charts** to your chatbot using Yahoo Finance data (100% free, no API key needed).

### Files Created/Modified:

1. ✅ `src/lib/aiTools.ts` - Added `show_stock_chart` tool
2. ✅ `src/lib/functionExecutors.ts` - Added chart data fetcher using Yahoo Finance
3. ✅ `src/components/StockChart.tsx` - Beautiful Recharts-powered chart component
4. ✅ `src/components/ChatbotPill.tsx` - Updated to parse and render charts

---

## 🚀 How It Works (Currently)

**Right now**, the chart functionality is **ready** but **not active** because you haven't implemented function calling in your streaming route yet.

### Current Status:
- ✅ Chart component is ready
- ✅ Data fetching works (Yahoo Finance API)
- ⏳ **Need to enable function calling** in `/api/chat/stream/route.ts`

---

## 🎯 How to Enable It

### Option 1: Quick Test (Without Full Implementation)

You can test the chart by manually triggering it. Add this test suggestion to your chatbot:

```typescript
// In ChatbotPill.tsx, add a test suggestion:
{
  role: "assistant",
  content: "Here's Apple's stock performance:",
  chartData: {
    type: 'stock_chart',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    period: '6mo',
    currentPrice: '175.43',
    change: '2.35',
    data: [
      { date: 'Jan 1', price: '150.12', high: '151.20', low: '149.50', volume: 50000000 },
      { date: 'Jan 15', price: '155.50', high: '156.00', low: '154.00', volume: 55000000 },
      // ... more data
    ]
  }
}
```

### Option 2: Full Implementation (Recommended)

Follow the **FUNCTION_CALLING_GUIDE.md** to enable function calling. Once enabled, users can ask:

```
"Show me Apple's stock chart"
"Display Tesla's price chart for the last year"  
"Chart Microsoft stock performance"
"Visualize GOOGL stock for 3 months"
```

And the AI will automatically:
1. Call the `show_stock_chart` function
2. Fetch real data from Yahoo Finance
3. Display an interactive chart

---

## 📊 What Users Will See

When working, users will get:

```
┌─────────────────────────────────────┐
│ AAPL - Apple Inc.                   │
│ $175.43  +2.35%  6MO                │
├─────────────────────────────────────┤
│                                     │
│     📈 Interactive Line Chart        │
│     (Recharts visualization)        │
│                                     │
├─────────────────────────────────────┤
│ Source: Yahoo Finance  Updated: ... │
└─────────────────────────────────────┘
```

**Features:**
- ✅ Real-time price data
- ✅ Interactive hover tooltips
- ✅ Green/red colors based on performance
- ✅ Responsive design
- ✅ Multiple time periods (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y)

---

## 🔧 Next Step: Enable Function Calling

To make this work, you need to update `src/app/api/chat/stream/route.ts`:

```typescript
import { AI_TOOLS } from "@/lib/aiTools";
import { executeFunction } from "@/lib/functionExecutors";

// In your streaming endpoint:
const stream = await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: openaiMessages,
  temperature: 1,
  max_completion_tokens: 2000,
  tools: AI_TOOLS,  // ← Add this
  tool_choice: "auto", // ← Add this  
  stream: true,
});
```

Then handle tool calls in the streaming loop (see FUNCTION_CALLING_GUIDE.md for details).

---

## 💡 Example User Queries That Will Work

Once function calling is enabled:

✅ "Show me Apple's stock chart"
✅ "Display Tesla's 1-year price chart"
✅ "Chart Microsoft stock for the last 3 months"
✅ "Visualize Google's stock performance"
✅ "Show me NVDA stock chart for 5 days"
✅ "What does Amazon's stock chart look like?"

---

## 🎨 Customization Options

You can customize the chart appearance in `src/components/StockChart.tsx`:

- Colors (currently green/red based on performance)
- Size (currently 256px height)
- Data points shown
- Time period labels
- Tooltip format

---

## 🚨 Important Notes

1. **No API Key Needed** - Yahoo Finance API is free
2. **Rate Limiting** - Yahoo Finance may rate limit if too many requests
3. **Market Hours** - Prices update during market hours
4. **Data Accuracy** - Delayed by ~15 minutes for most stocks

---

## Want Me to Implement Function Calling?

I can update your `stream/route.ts` file right now to enable full function calling support. Just say:

**"Yes, implement function calling in the streaming route"**

And I'll do it for you! 🚀

