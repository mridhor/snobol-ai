// AI Tools configuration for function calling

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_stock_quote",
      description: "Get current price and basic data. Use when user asks for 'price', 'quote', 'how much', 'trading at' WITHOUT deeper analysis. Always includes chart. Good for quick price checks. CONTEXT AWARE: If user says 'price of this' or 'quote for this', use the last mentioned company from conversation history. DO NOT use for suggestion questions like 'What's the market ignoring?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol (stocks, crypto, commodities). E.g., AAPL, BTC, GOLD. Use last mentioned company if user refers to 'this'"
          }
        },
        required: ["symbol"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_company",
      description: "Pure GPT-5 analysis with chart. Use for: 'analyze', 'research', 'what's the deal with X', 'should I look at X', 'tell me about X', 'is X opportunity', 'analyze this company', 'tell me about this'. AI-powered insights on: business reality, what they do, risks, if panic is justified. Always includes chart. CONTEXT AWARE: If user says 'this company' or 'analyze this', use the last mentioned company from conversation history. DO NOT use for suggestion questions like 'What's the market ignoring?' or 'Is the panic overdone?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol. E.g., AAPL, TSLA, NVDA. Use last mentioned company if user refers to 'this company'"
          }
        },
        required: ["symbol"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "show_stock_chart",
      description: "Show chart + analysis. Use when user says: 'show chart', 'chart for X', 'visualize X', 'graph X', 'see X chart', 'show this chart'. Includes full analysis (business, risks) + interactive TradingView chart. Works for all assets. CONTEXT AWARE: If user says 'show this chart' or 'chart for this', use the last mentioned company from conversation history. DO NOT use for suggestion questions like 'What's the market ignoring?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Any ticker: stocks (AAPL), crypto (BTC), commodities (GOLD), forex (EURUSD), indices (SPX500). Use last mentioned company if user refers to 'this'"
          },
          period: {
            type: "string",
            description: "Time period for the chart",
            enum: ["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"],
            default: "6mo"
          }
        },
        required: ["symbol"]
      }
    }
  }
];

