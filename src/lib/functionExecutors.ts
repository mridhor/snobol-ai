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
interface TradingViewSymbolInfo {
  symbol?: string;
  exchange?: string;
  type?: string;
  country?: string;
  description?: string;
}

function getAssetType(symbolInfo: TradingViewSymbolInfo): string {
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
 * Get stock quote using Yahoo Finance (free, no API key needed)
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      return `Could not find stock data for symbol "${symbol}". Please verify the ticker symbol is correct.`;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0] || {};
    
    const currentPrice = meta.regularMarketPrice || quote.close?.[0];
    const previousClose = meta.previousClose;
    const change = (currentPrice ?? 0) - (previousClose ?? 0);
    const changePercent = previousClose ? ((change / previousClose) * 100).toFixed(2) : '0.00';
    
    const dayHigh = quote.high?.[0] || meta.dayHigh;
    const dayLow = quote.low?.[0] || meta.dayLow;
    const volume = quote.volume?.[0];
    
    return `
**${meta.symbol}** - ${meta.longName || meta.shortName || 'N/A'}

**Current Price:** $${currentPrice?.toFixed(2)}
**Change:** $${change.toFixed(2)} (${changePercent}%)
**Day Range:** $${dayLow?.toFixed(2)} - $${dayHigh?.toFixed(2)}
**Volume:** ${volume ? (volume / 1000000).toFixed(2) + 'M' : 'N/A'}
**Market:** ${meta.exchangeName || 'N/A'}

*Data as of ${meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toLocaleString() : new Date().toLocaleString()}*
    `.trim();
  } catch (error) {
    console.error('Stock quote error:', error);
    // Fallback: provide a brief note sourced via web search
    const fallback = await searchWeb(`${symbol} stock price today site:finance.yahoo.com`);
    return `Unable to fetch structured quote for "${symbol}" right now. Here's a quick reference from web search:\n\n${fallback}`;
  }
}

/**
 * Analyze company using Yahoo Finance (with DuckDuckGo fallback)
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?modules=assetProfile,summaryProfile,financialData,defaultKeyStatistics,price`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.quoteSummary?.result?.[0]) {
      // Fallback to web search summary
      const web = await searchWeb(`${symbol} company overview financial profile`);
      return `Basic overview for ${symbol} (web search):\n\n${web}`;
    }
    
    const info = data.quoteSummary.result[0];
    const profile = info.assetProfile || info.summaryProfile || {};
    const financial = info.financialData || {};
    const stats = info.defaultKeyStatistics || {};
    const price = info.price || {};
    
    const analysis = `
**${profile.longName || price.longName || symbol}**

**Sector:** ${profile.sector || 'N/A'}
**Industry:** ${profile.industry || 'N/A'}
**Employees:** ${profile.fullTimeEmployees?.toLocaleString() || 'N/A'}

**Financial Health:**
- Market Cap: $${price.marketCap ? (price.marketCap / 1e9).toFixed(2) : 'N/A'}B
- Revenue (TTM): $${financial.totalRevenue ? (financial.totalRevenue / 1e9).toFixed(2) : 'N/A'}B
- Profit Margin: ${financial.profitMargins ? (financial.profitMargins * 100).toFixed(2) : 'N/A'}%
- Debt/Equity: ${financial.debtToEquity?.toFixed(2) || 'N/A'}
- Current Ratio: ${financial.currentRatio?.toFixed(2) || 'N/A'}

**Valuation:**
- P/E Ratio: ${stats.trailingPE?.toFixed(2) || stats.forwardPE?.toFixed(2) || 'N/A'}
- Price/Book: ${stats.priceToBook?.toFixed(2) || 'N/A'}
- 52-Week Range: $${stats.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - $${stats.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}

**About:**
${profile.longBusinessSummary ? String(profile.longBusinessSummary).slice(0, 400) + '...' : 'No description available'}
    `.trim();
    
    return analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    const web = await searchWeb(`${symbol} company overview financial profile`);
    return `Analysis temporarily unavailable from Yahoo Finance. Here's a quick overview from web search:\n\n${web}`;
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
      // Fallback: build a best-guess TradingView symbol and still render widget
      const upper = String(symbol || '').toUpperCase();
      const guessExchange = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','ADBE','NFLX'].includes(upper) ? 'NASDAQ' : 'NYSE';
      const guessedFull = `${guessExchange}:${upper}`;
      const assetType = 'Stock';
      const priceSymbol = '$';
      return `[CHART_DATA]${JSON.stringify({
        type: 'stock_chart',
        symbol: guessedFull,
        companyName: upper,
        assetType,
        period,
        priceSymbol,
        data: [],
        note: 'Rendering via TradingView widget (guessed symbol)'
      })}[/CHART_DATA]`;
    }
    
    // Get the first result (most relevant)
    const symbolInfo = searchData[0];
    const tradingViewSymbol = symbolInfo.symbol;
    const exchange = symbolInfo.exchange;
    const fullSymbol = `${exchange}:${tradingViewSymbol}`;
    
    // Build minimal payload for TradingView widget; no quote fetch required
    const assetType = getAssetType(symbolInfo);
    const priceSymbol = getPriceSymbol(assetType, exchange);
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: fullSymbol,
      companyName: symbolInfo.description || tradingViewSymbol,
      assetType,
      period,
      priceSymbol,
      data: [],
      note: 'Rendering via TradingView widget'
    })}[/CHART_DATA]`;
    
  } catch (error) {
    console.error('Chart data error:', error);
    // Last-resort fallback: still return a TradingView-embeddable symbol guess
    const upper = String(symbol || '').toUpperCase();
    const guessExchange = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','ADBE','NFLX'].includes(upper) ? 'NASDAQ' : 'NYSE';
    const guessedFull = `${guessExchange}:${upper}`;
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: guessedFull,
      companyName: upper,
      assetType: 'Stock',
      period,
      priceSymbol: '$',
      data: [],
      note: 'Rendering via TradingView widget (fallback guess)'
    })}[/CHART_DATA]`;
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

