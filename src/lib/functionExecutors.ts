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
 * Helper function to determine asset type based on symbol info
 */
function getAssetType(symbolInfo: any): string {
  const symbol = symbolInfo.symbol?.toUpperCase() || '';
  const exchange = symbolInfo.exchange?.toUpperCase() || '';
  const type = symbolInfo.type?.toLowerCase() || '';
  
  // Cryptocurrency detection
  if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('ADA') || 
      symbol.includes('DOGE') || symbol.includes('SOL') || exchange.includes('CRYPTO')) {
    return 'Cryptocurrency';
  }
  
  // Commodity detection
  if (symbol.includes('GOLD') || symbol.includes('SILVER') || symbol.includes('OIL') || 
      symbol.includes('NATURALGAS') || symbol.includes('COPPER') || symbol.includes('PLATINUM')) {
    return 'Commodity';
  }
  
  // Forex detection
  if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') || 
      symbol.includes('JPY') || symbol.includes('CAD') || symbol.includes('AUD') ||
      exchange.includes('FX')) {
    return 'Forex';
  }
  
  // Index detection
  if (symbol.includes('SPX') || symbol.includes('NASDAQ') || symbol.includes('DOW') || 
      symbol.includes('NIKKEI') || symbol.includes('DAX') || symbol.includes('FTSE')) {
    return 'Index';
  }
  
  // ETF detection
  if (symbol.includes('SPY') || symbol.includes('QQQ') || symbol.includes('VTI') || 
      symbol.includes('ARKK') || symbol.includes('IWM') || type.includes('etf')) {
    return 'ETF';
  }
  
  // International stock detection
  if (exchange.includes('LSE') || exchange.includes('TSE') || exchange.includes('FSE') || 
      exchange.includes('HKEX') || exchange.includes('SSE') || exchange.includes('BSE')) {
    return 'International Stock';
  }
  
  return 'Stock';
}

/**
 * Helper function to get appropriate price symbol based on asset type
 */
function getPriceSymbol(assetType: string, exchange: string): string {
  switch (assetType) {
    case 'Cryptocurrency':
      return '$';
    case 'Commodity':
      return '$';
    case 'Forex':
      return '';
    case 'Index':
      return '';
    case 'ETF':
      return '$';
    case 'International Stock':
      // Different currencies for different exchanges
      if (exchange.includes('LSE')) return '£';
      if (exchange.includes('TSE')) return '¥';
      if (exchange.includes('FSE')) return '€';
      if (exchange.includes('HKEX')) return 'HK$';
      return '$';
    default:
      return '$';
  }
}

/**
 * Helper function to get examples of diverse ticker options
 */
function getDiverseTickerExamples(): string {
  return `
**🌍 INTERNATIONAL STOCKS:**
- **Europe:** ASML (Netherlands), SAP (Germany), LVMH (France)
- **Asia:** TSMC (Taiwan), BABA (China), SONY (Japan)
- **Other:** RIO (Australia), SHOP (Canada)

**₿ CRYPTOCURRENCIES:**
- **Major:** BTCUSD, ETHUSD, ADAUSD, SOLUSD
- **Altcoins:** DOGEUSD, MATICUSD, DOTUSD, AVAXUSD

**🥇 COMMODITIES:**
- **Metals:** GOLD, SILVER, COPPER, PLATINUM
- **Energy:** OIL, NATURALGAS, GASOLINE
- **Agriculture:** WHEAT, CORN, SOYBEAN

**💱 FOREX:**
- **Major Pairs:** EURUSD, GBPUSD, USDJPY, USDCHF
- **Cross Pairs:** EURGBP, GBPJPY, AUDUSD, USDCAD

**📊 INDICES:**
- **US:** SPX500, NASDAQ, DOW, RUSSELL2000
- **International:** NIKKEI (Japan), DAX (Germany), FTSE (UK)

**📈 ETFs:**
- **Broad Market:** SPY, QQQ, VTI, IWM
- **Sector:** XLK (Tech), XLF (Finance), XLE (Energy)
- **International:** VEA (Europe), VWO (Emerging Markets)
`;
}

/**
 * Get stock quote using TradingView data endpoints (free, no API key needed)
 * Using TradingView's public symbol search and quotes API
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    // Enhanced search with support for multiple asset types and international markets
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find data for symbol "${symbol}". Please verify the ticker symbol is correct.

${getDiverseTickerExamples()}`;
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
    
    // Determine asset type for better formatting
    const assetType = getAssetType(symbolInfo);
    const priceSymbol = getPriceSymbol(assetType, exchange);
    
    return `
**${tradingViewSymbol}** - ${symbolInfo.description || tradingViewSymbol}
**Type:** ${assetType} | **Exchange:** ${exchange}

**Current Price:** ${priceSymbol}${currentPrice?.toFixed(2)}
**Change:** ${priceSymbol}${change.toFixed(2)} (${changePercent}%)
**Day Range:** ${priceSymbol}${dayLow?.toFixed(2)} - ${priceSymbol}${dayHigh?.toFixed(2)}
**Volume:** ${volume ? (volume / 1000000).toFixed(2) + 'M' : 'N/A'}
${marketCap ? `**Market Cap:** ${(marketCap / 1e9).toFixed(2)}B` : ''}

*Data as of ${new Date().toLocaleString()}*
    `.trim();
  } catch (error) {
    console.error('Stock quote error:', error);
    return `Unable to fetch data for "${symbol}". Please verify the ticker symbol is correct.

${getDiverseTickerExamples()}`;
  }
}

/**
 * Analyze company/asset using TradingView data endpoints
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    // Enhanced search with support for multiple asset types
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find data for "${symbol}". Please verify the ticker symbol.

${getDiverseTickerExamples()}`;
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
      return `Could not fetch data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const quote = quotesData.data[0];
    const assetType = getAssetType(symbolInfo);
    const priceSymbol = getPriceSymbol(assetType, exchange);
    
    const analysis = `
**${symbolInfo.description || tradingViewSymbol}**

**Type:** ${assetType}
**Exchange:** ${exchange}
**Country:** ${symbolInfo.country || 'N/A'}

**Current Metrics:**
- Current Price: ${priceSymbol}${quote.lp?.toFixed(2) || 'N/A'}
- Day High: ${priceSymbol}${quote.h?.toFixed(2) || 'N/A'}
- Day Low: ${priceSymbol}${quote.l?.toFixed(2) || 'N/A'}
- Volume: ${quote.v ? (quote.v / 1000000).toFixed(2) + 'M' : 'N/A'}
${quote.market_cap_basic ? `- Market Cap: ${(quote.market_cap_basic / 1e9).toFixed(2)}B` : ''}

**Price Performance:**
- Change: ${priceSymbol}${(quote.lp - quote.prev_close_price)?.toFixed(2) || 'N/A'}
- Change %: ${quote.prev_close_price ? (((quote.lp - quote.prev_close_price) / quote.prev_close_price) * 100).toFixed(2) + '%' : 'N/A'}
- Previous Close: ${priceSymbol}${quote.prev_close_price?.toFixed(2) || 'N/A'}

**Trading Information:**
- Open: ${priceSymbol}${quote.o?.toFixed(2) || 'N/A'}
- High: ${priceSymbol}${quote.h?.toFixed(2) || 'N/A'}
- Low: ${priceSymbol}${quote.l?.toFixed(2) || 'N/A'}
- Volume: ${quote.v ? quote.v.toLocaleString() : 'N/A'}

*Data provided by TradingView*
    `.trim();
    
    return analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    return `Unable to analyze "${symbol}". Please verify the ticker symbol is correct.

${getDiverseTickerExamples()}`;
  }
}

/**
 * Get historical data for chart visualization using TradingView
 * Note: TradingView doesn't provide free historical data API, so we'll use a free alternative
 */
async function getStockChartData(symbol: string, period: string = '6mo'): Promise<string> {
  try {
    // Enhanced search with support for multiple asset types
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${symbol.toUpperCase()}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData || searchData.length === 0) {
      return `Could not find chart data for "${symbol}". Please verify the ticker symbol.

${getDiverseTickerExamples()}`;
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
    const assetType = getAssetType(symbolInfo);
    const priceSymbol = getPriceSymbol(assetType, exchange);
    
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
      assetType: assetType,
      period: period,
      currentPrice: currentPrice?.toFixed(2),
      change: changePercent,
      priceSymbol: priceSymbol,
      data: chartData,
      note: `For detailed historical ${assetType.toLowerCase()} charts, visit TradingView.com`
    })}[/CHART_DATA]`;
    
  } catch (error) {
    console.error('Chart data error:', error);
    return `Unable to fetch chart data for "${symbol}". For detailed historical charts, please visit TradingView.com directly.

${getDiverseTickerExamples()}`;
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

