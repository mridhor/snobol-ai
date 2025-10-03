// AI Tools configuration for function calling

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_stock_quote",
      description: "Get current price and basic data. Use when user asks for 'price', 'quote', 'how much', 'trading at' WITHOUT deeper analysis. Always includes chart. Good for quick price checks. DO NOT use for suggestion questions like 'What's the market ignoring?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol (stocks, crypto, commodities). E.g., AAPL, BTC, GOLD"
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
      description: "Pure GPT-5 analysis with chart. Use for: 'analyze', 'research', 'what's the deal with X', 'should I look at X', 'tell me about X', 'is X opportunity'. AI-powered insights on: business reality, what they do, risks, if panic is justified. Always includes chart. DO NOT use for suggestion questions like 'What's the market ignoring?' or 'Is the panic overdone?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Ticker symbol. E.g., AAPL, TSLA, NVDA"
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
      description: "Show chart + analysis. Use when user says: 'show chart', 'chart for X', 'visualize X', 'graph X', 'see X chart'. Includes full analysis (business, risks) + interactive TradingView chart. Works for all assets. DO NOT use for suggestion questions like 'What's the market ignoring?'",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Any ticker: stocks (AAPL), crypto (BTC), commodities (GOLD), forex (EURUSD), indices (SPX500)"
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

