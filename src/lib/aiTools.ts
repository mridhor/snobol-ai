// AI Tools configuration for function calling

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description: "Search the web for current information, news, or recent events about finance, markets, or companies. Use this when you need up-to-date information that you don't have.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query about finance, markets, stocks, or companies"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_stock_quote",
      description: "Get ONLY current stock price and basic quote data. Use this when user asks specifically for 'price', 'quote', 'trading at', 'current value' WITHOUT asking for analysis or company information. Always includes a chart.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock ticker symbol in UPPERCASE (e.g., AAPL for Apple, TSLA for Tesla, GOOGL for Google)"
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
      description: "Get comprehensive company analysis with chart. Use when user wants to: 'analyze', 'research', 'understand', 'learn about', 'tell me about', 'what does X do', 'company overview', 'business model', 'financials', 'risks', or any in-depth information about a company. Always includes business description, financial health, risks, AND a TradingView chart.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock ticker symbol in UPPERCASE (e.g., AAPL, MSFT, AMZN)"
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
      description: "Display interactive TradingView chart with company analysis. Use when user explicitly asks to: 'show chart', 'display chart', 'visualize', 'graph', 'chart for', 'see chart', or wants to see price trends/patterns. Always includes both chart AND company analysis (business overview, financials, risks).",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock ticker symbol in UPPERCASE (e.g., AAPL, TSLA, GOOGL). Supports stocks, crypto (BTC, ETH), commodities (GOLD, OIL), forex (EURUSD), indices (SPX500)."
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

