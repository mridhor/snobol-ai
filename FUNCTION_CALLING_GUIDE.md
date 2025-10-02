# Function Calling Guide: Adding External Data & Search to Snobol AI

## Overview
Enable the AI to fetch real-time data like stock prices, company financials, news, and web searches.

## Architecture

```
User Question → AI decides if it needs data → Calls function → Executes function → Gets data → AI uses data in response
```

---

## Step 1: Define Available Tools/Functions

Create a tools configuration file:

```typescript
// src/lib/aiTools.ts

export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for current information, news, or recent events. Use this when you need up-to-date information.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_stock_data",
      description: "Get current stock price, market data, and key metrics for a company",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock ticker symbol (e.g., AAPL, TSLA)"
          }
        },
        required: ["symbol"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_company_financials",
      description: "Analyze a company's financial health, including revenue, profit, debt, and key ratios",
      parameters: {
        type: "object",
        properties: {
          company: {
            type: "string",
            description: "Company name or ticker symbol"
          }
        },
        required: ["company"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_market_news",
      description: "Get recent financial news and market updates",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "News topic (e.g., 'market crash', 'tech stocks', 'recession')"
          },
          limit: {
            type: "number",
            description: "Number of news articles to retrieve (default 5)"
          }
        },
        required: ["topic"]
      }
    }
  }
];
```

---

## Step 2: Implement Function Executors

Create handlers for each function:

```typescript
// src/lib/functionExecutors.ts

// Example: Web Search using Serper API or similar
async function searchWeb(query: string): Promise<string> {
  try {
    const response = await fetch('https://api.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, num: 5 })
    });
    
    const data = await response.json();
    const results = data.organic?.slice(0, 5).map((item: any) => 
      `${item.title}: ${item.snippet}`
    ).join('\n\n');
    
    return results || "No results found";
  } catch (error) {
    return "Search failed. Please try again.";
  }
}

// Example: Stock Data using Alpha Vantage or Yahoo Finance
async function getStockData(symbol: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote) return `No data found for ${symbol}`;
    
    return `
Stock: ${symbol}
Price: $${quote['05. price']}
Change: ${quote['09. change']} (${quote['10. change percent']})
Volume: ${quote['06. volume']}
High: $${quote['03. high']}
Low: $${quote['04. low']}
    `.trim();
  } catch (error) {
    return "Failed to fetch stock data";
  }
}

// Example: Company Financials using Financial Modeling Prep API
async function analyzeCompanyFinancials(company: string): Promise<string> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${company}?apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    const info = data[0];
    
    if (!info) return `No financial data found for ${company}`;
    
    return `
Company: ${info.companyName}
Sector: ${info.sector}
Market Cap: $${(info.mktCap / 1e9).toFixed(2)}B
P/E Ratio: ${info.pe?.toFixed(2) || 'N/A'}
Debt/Equity: ${info.debtToEquity?.toFixed(2) || 'N/A'}
Revenue: $${(info.revenue / 1e9).toFixed(2)}B
Profit Margin: ${(info.profitMargin * 100)?.toFixed(2)}%
Description: ${info.description?.slice(0, 200)}...
    `.trim();
  } catch (error) {
    return "Failed to fetch company data";
  }
}

// Example: Market News
async function getMarketNews(topic: string, limit: number = 5): Promise<string> {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${process.env.NEWS_API_KEY}&pageSize=${limit}&sortBy=publishedAt`
    );
    const data = await response.json();
    
    const articles = data.articles?.slice(0, limit).map((article: any) =>
      `${article.title}\n${article.description}`
    ).join('\n\n');
    
    return articles || "No news found";
  } catch (error) {
    return "Failed to fetch news";
  }
}

// Main executor function
export async function executeFunction(name: string, args: any): Promise<string> {
  console.log(`Executing function: ${name}`, args);
  
  switch (name) {
    case 'search_web':
      return await searchWeb(args.query);
    case 'get_stock_data':
      return await getStockData(args.symbol);
    case 'analyze_company_financials':
      return await analyzeCompanyFinancials(args.company);
    case 'get_market_news':
      return await getMarketNews(args.topic, args.limit);
    default:
      return "Function not found";
  }
}
```

---

## Step 3: Update Streaming Route with Function Calling

Modify `src/app/api/chat/stream/route.ts`:

```typescript
import { AI_TOOLS } from "@/lib/aiTools";
import { executeFunction } from "@/lib/functionExecutors";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // ... validation code ...
    
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];
    
    // ENABLE FUNCTION CALLING
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: openaiMessages,
      temperature: 1,
      max_completion_tokens: 2000,
      tools: AI_TOOLS,  // ← Add tools here
      tool_choice: "auto", // Let AI decide when to use tools
      stream: true,
    });
    
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let reasoningContent = "";
          let hasStartedContent = false;
          const startTime = Date.now();
          let toolCalls: any[] = [];
          let currentToolCall: any = null;
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            const finishReason = chunk.choices[0]?.finish_reason;
            
            // Handle tool calls
            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (toolCall.index !== undefined) {
                  if (!toolCalls[toolCall.index]) {
                    toolCalls[toolCall.index] = {
                      id: toolCall.id || '',
                      type: 'function',
                      function: { name: '', arguments: '' }
                    };
                  }
                  
                  if (toolCall.function?.name) {
                    toolCalls[toolCall.index].function.name += toolCall.function.name;
                  }
                  if (toolCall.function?.arguments) {
                    toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
                  }
                }
              }
            }
            
            // Handle regular content streaming
            const reasoning = delta?.reasoning_content || "";
            const content = delta?.content || "";
            
            if (reasoning) {
              reasoningContent += reasoning;
            }
            
            if (content && !hasStartedContent && reasoningContent) {
              hasStartedContent = true;
              const thinkingTime = Date.now() - startTime;
              const metadata = JSON.stringify({
                type: "reasoning",
                reasoning: reasoningContent,
                thinkingTime: thinkingTime,
              });
              controller.enqueue(encoder.encode(`[REASONING]${metadata}[/REASONING]`));
            }
            
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
            
            // If AI wants to call a tool
            if (finishReason === 'tool_calls' && toolCalls.length > 0) {
              // Execute all tool calls
              const toolResults = await Promise.all(
                toolCalls.map(async (toolCall) => {
                  const args = JSON.parse(toolCall.function.arguments);
                  const result = await executeFunction(toolCall.function.name, args);
                  return {
                    tool_call_id: toolCall.id,
                    role: "tool" as const,
                    content: result,
                  };
                })
              );
              
              // Add tool results to messages and make another API call
              const newMessages = [
                ...openaiMessages,
                { role: "assistant", tool_calls: toolCalls },
                ...toolResults
              ];
              
              // Make another streaming call with tool results
              const followupStream = await openai.chat.completions.create({
                model: "gpt-5-mini",
                messages: newMessages,
                temperature: 1,
                max_completion_tokens: 2000,
                stream: true,
              });
              
              // Stream the AI's response using the tool data
              for await (const followupChunk of followupStream) {
                const followupContent = followupChunk.choices[0]?.delta?.content || "";
                if (followupContent) {
                  controller.enqueue(encoder.encode(followupContent));
                }
              }
            }
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## Step 4: Add Environment Variables

Add to `.env.local`:

```env
# OpenAI (already exists)
OPENAI_API_KEY=your_openai_key

# Web Search
SERPER_API_KEY=your_serper_key  # Get from serper.dev

# Stock Data
ALPHA_VANTAGE_KEY=your_alpha_vantage_key  # Get from alphavantage.co
# OR use Yahoo Finance API (free, no key needed)

# Company Financials
FMP_API_KEY=your_fmp_key  # Get from financialmodelingprep.com

# News
NEWS_API_KEY=your_news_api_key  # Get from newsapi.org
```

---

## Step 5: Update System Prompt

Add to your system prompt in `route.ts`:

```typescript
const SYSTEM_PROMPT = `You are Snobol AI.
...existing prompt...

**TOOLS AVAILABLE:**
You have access to real-time tools to fetch current data:
- search_web: Search for current information and news
- get_stock_data: Get live stock prices and market data
- analyze_company_financials: Analyze company financial health
- get_market_news: Get recent market and financial news

Use these tools WHENEVER the user asks about:
- Current stock prices or market data
- Company analysis or financial health
- Recent news or events
- Real-time market conditions

Always cite that you used real-time data in your response.
`;
```

---

## Free API Alternatives

Don't want to pay for APIs? Use these free options:

1. **Web Search**: Use Brave Search API (free tier) or Bing Web Search API
2. **Stock Data**: Yahoo Finance (free, no key) - use `yahoo-finance2` npm package
3. **News**: NewsAPI.org (free tier: 100 requests/day)
4. **Company Data**: Use web scraping (BeautifulSoup equivalent in Node.js)

---

## Example Installation

```bash
npm install yahoo-finance2 newsapi
```

Then use:

```typescript
import yahooFinance from 'yahoo-finance2';

async function getStockData(symbol: string) {
  const quote = await yahooFinance.quote(symbol);
  return `Price: $${quote.regularMarketPrice}, Change: ${quote.regularMarketChangePercent}%`;
}
```

---

## Benefits

✅ AI can answer "What's Apple's current stock price?"  
✅ AI can analyze real company financials on demand  
✅ AI can search for recent market news  
✅ Users get accurate, real-time data instead of hallucinations  
✅ Better user experience with actionable insights  

---

## Next Steps

1. Choose your APIs (start with free ones)
2. Create the `aiTools.ts` and `functionExecutors.ts` files
3. Update the streaming route with function calling logic
4. Test with queries like "What's Tesla's stock price?" or "Analyze Apple's financials"
5. Monitor API usage and add rate limiting if needed

