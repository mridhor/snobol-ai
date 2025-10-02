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
      description: "Get current stock price, change percentage, and basic market data for a publicly traded company",
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
      description: "Get comprehensive company information including business description, sector, financials, and key metrics",
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
      description: "Display an interactive price chart for a stock showing historical price movements. Use this when user asks to 'show chart', 'display chart', 'visualize stock', or wants to see price trends.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "Stock ticker symbol in UPPERCASE (e.g., AAPL, TSLA, GOOGL)"
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

