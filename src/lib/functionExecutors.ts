// Function executors for AI tool calling

/**
 * Search the web using DuckDuckGo (free, no API key needed)
 */
async function searchWeb(query: string): Promise<string> {
  try {
    // Using DuckDuckGo Instant Answer API (free, no key required)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    
    const data = await response.json();
    
    let result = '';
    
    // Get the main abstract/answer if available
    if (data.Abstract) {
      result += `${data.Abstract}\n\n`;
    }
    
    // Get related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics.slice(0, 3)
        .filter((topic: { Text?: string }) => topic.Text)
        .map((topic: { Text: string }) => topic.Text)
        .join('\n\n');
      
      if (topics) {
        result += `Related information:\n${topics}`;
      }
    }
    
    if (!result) {
      // Fallback: suggest they visit a search engine
      return `I couldn't find specific results. For the most current information about "${query}", I recommend checking recent financial news sources or market data platforms.`;
    }
    
    return result.trim();
  } catch (error) {
    console.error('Search error:', error);
    return `Search temporarily unavailable. For current information about "${query}", please check financial news websites.`;
  }
}

/**
 * Get stock quote using TradingView data endpoints (free, no API key needed)
 * Using TradingView's public symbol search and quotes API
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    // First, search for the symbol to get the proper TradingView symbol
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=US`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find stock data for symbol "${symbol}". Please verify the ticker symbol is correct.`;
    }
    
    // Get the first result (most relevant)
    const symbolInfo = searchData[0];
    const tradingViewSymbol = symbolInfo.symbol;
    const exchange = symbolInfo.exchange;
    const fullSymbol = `${exchange}:${tradingViewSymbol}`;
    
    // Get quotes using TradingView's get_quotes API
    const quotesUrl = `https://data.tradingview.com/v1/get_quotes/?symbols=${fullSymbol}`;
    
    const quotesResponse = await fetch(quotesUrl);
    const quotesData = await quotesResponse.json();
    
    if (!quotesData || !quotesData.data || quotesData.data.length === 0) {
      return `Could not fetch quote data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const quote = quotesData.data[0];
    
    const currentPrice = quote.lp || quote.c;
    const previousClose = quote.prev_close_price;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? ((change / previousClose) * 100).toFixed(2) : '0.00';
    
    const dayHigh = quote.h;
    const dayLow = quote.l;
    const volume = quote.v;
    const marketCap = quote.market_cap_basic;
    
    return `
**${tradingViewSymbol}** - ${symbolInfo.description || tradingViewSymbol}

**Current Price:** $${currentPrice?.toFixed(2)}
**Change:** $${change.toFixed(2)} (${changePercent}%)
**Day Range:** $${dayLow?.toFixed(2)} - $${dayHigh?.toFixed(2)}
**Volume:** ${volume ? (volume / 1000000).toFixed(2) + 'M' : 'N/A'}
**Market Cap:** ${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
**Exchange:** ${exchange}

*Data as of ${new Date().toLocaleString()}*
    `.trim();
  } catch (error) {
    console.error('Stock quote error:', error);
    return `Unable to fetch stock data for "${symbol}". Please verify the ticker symbol is correct (e.g., AAPL for Apple, TSLA for Tesla).`;
  }
}

/**
 * Analyze company using TradingView data endpoints
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    // First, search for the symbol to get the proper TradingView symbol
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=US`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find company data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    // Get the first result (most relevant)
    const symbolInfo = searchData[0];
    const tradingViewSymbol = symbolInfo.symbol;
    const exchange = symbolInfo.exchange;
    const fullSymbol = `${exchange}:${tradingViewSymbol}`;
    
    // Get detailed quotes using TradingView's get_quotes API
    const quotesUrl = `https://data.tradingview.com/v1/get_quotes/?symbols=${fullSymbol}`;
    
    const quotesResponse = await fetch(quotesUrl);
    const quotesData = await quotesResponse.json();
    
    if (!quotesData || !quotesData.data || quotesData.data.length === 0) {
      return `Could not fetch company data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const quote = quotesData.data[0];
    
    const analysis = `
**${symbolInfo.description || tradingViewSymbol}**

**Exchange:** ${exchange}
**Country:** ${symbolInfo.country || 'N/A'}
**Type:** ${symbolInfo.type || 'N/A'}

**Financial Health:**
- Market Cap: ${quote.market_cap_basic ? (quote.market_cap_basic / 1e9).toFixed(2) + 'B' : 'N/A'}
- Current Price: $${quote.lp?.toFixed(2) || 'N/A'}
- Day High: $${quote.h?.toFixed(2) || 'N/A'}
- Day Low: $${quote.l?.toFixed(2) || 'N/A'}
- Volume: ${quote.v ? (quote.v / 1000000).toFixed(2) + 'M' : 'N/A'}

**Price Performance:**
- Change: $${(quote.lp - quote.prev_close_price)?.toFixed(2) || 'N/A'}
- Change %: ${quote.prev_close_price ? (((quote.lp - quote.prev_close_price) / quote.prev_close_price) * 100).toFixed(2) + '%' : 'N/A'}
- Previous Close: $${quote.prev_close_price?.toFixed(2) || 'N/A'}

**Trading Information:**
- Open: $${quote.o?.toFixed(2) || 'N/A'}
- High: $${quote.h?.toFixed(2) || 'N/A'}
- Low: $${quote.l?.toFixed(2) || 'N/A'}
- Volume: ${quote.v ? quote.v.toLocaleString() : 'N/A'}

*Data provided by TradingView*
    `.trim();
    
    return analysis;
  } catch (error) {
    console.error('Company analysis error:', error);
    return `Unable to analyze "${symbol}". The company data may not be available or the ticker symbol is incorrect.`;
  }
}

/**
 * Get historical stock data for chart visualization using TradingView
 * Note: TradingView doesn't provide free historical data API, so we'll use a free alternative
 */
async function getStockChartData(symbol: string, period: string = '6mo'): Promise<string> {
  try {
    // First, search for the symbol to get the proper TradingView symbol
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=US`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find chart data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    // Get the first result (most relevant)
    const symbolInfo = searchData[0];
    const tradingViewSymbol = symbolInfo.symbol;
    const exchange = symbolInfo.exchange;
    const fullSymbol = `${exchange}:${tradingViewSymbol}`;
    
    // Get current quote data
    const quotesUrl = `https://data.tradingview.com/v1/get_quotes/?symbols=${fullSymbol}`;
    
    const quotesResponse = await fetch(quotesUrl);
    const quotesData = await quotesResponse.json();
    
    if (!quotesData || !quotesData.data || quotesData.data.length === 0) {
      return `Could not fetch chart data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const quote = quotesData.data[0];
    
    // Since TradingView doesn't provide free historical data, we'll create a simple chart
    // with current price data and suggest using TradingView's chart widget
    const currentPrice = quote.lp || quote.c;
    const previousClose = quote.prev_close_price;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? ((change / previousClose) * 100).toFixed(2) : '0.00';
    
    // Create a simple data point for current price
    const chartData = [{
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      price: currentPrice?.toFixed(2),
      high: quote.h?.toFixed(2),
      low: quote.l?.toFixed(2),
      volume: quote.v
    }];
    
    // Return as special formatted JSON that frontend can parse
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: tradingViewSymbol,
      companyName: symbolInfo.description || tradingViewSymbol,
      period: period,
      currentPrice: currentPrice?.toFixed(2),
      change: changePercent,
      data: chartData,
      note: "For detailed historical charts, visit TradingView.com"
    })}[/CHART_DATA]`;
    
  } catch (error) {
    console.error('Chart data error:', error);
    return `Unable to fetch chart data for "${symbol}". For detailed historical charts, please visit TradingView.com directly.`;
  }
}

/**
 * Main executor - routes function calls to appropriate handlers
 */
export async function executeFunction(name: string, args: Record<string, string | number>): Promise<string> {
  console.log(`[Function Call] ${name}`, args);
  
  try {
    switch (name) {
      case 'search_web':
        return await searchWeb(String(args.query));
      
      case 'get_stock_quote':
        return await getStockQuote(String(args.symbol));
      
      case 'analyze_company':
        return await analyzeCompany(String(args.symbol));
      
      case 'show_stock_chart':
        return await getStockChartData(String(args.symbol), String(args.period));
      
      default:
        return `Function "${name}" not found.`;
    }
  } catch (error) {
    console.error(`Error executing ${name}:`, error);
    return `Error executing function. Please try again.`;
  }
}

