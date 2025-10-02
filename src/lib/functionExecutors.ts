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
 * Get stock quote using DuckDuckGo (rich-text summary; no direct price API)
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    const summary = await searchWeb(`${upper} stock price today summary`);
    const howToView = `You can view live pricing via the search link below.`;
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo Search', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' stock price today')}` }
      ]
    };
    return `
**${upper} – Quick Stock Snapshot**

- This is a brief overview gathered via web search (no direct price API).
- ${howToView}

**What we found:**
${summary || 'No concise summary available right now.'}

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
    `.trim();
  } catch (error) {
    console.error('Stock quote (DuckDuckGo) error:', error);
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo Search', url: `https://duckduckgo.com/?q=${encodeURIComponent(String(symbol) + ' stock price today')}` }
      ]
    };
    return `
**${String(symbol).toUpperCase()} – Quick Stock Snapshot**

- Web search temporarily unavailable. Please open the search link below for live price.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
    `.trim();
  }
}

/**
 * Analyze company using DuckDuckGo (rich-text summary; no direct financials API)
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    const overview = await searchWeb(`${upper} company overview business description`);
    const financials = await searchWeb(`${upper} financials revenue profit margin balance sheet basics`);
    const risks = await searchWeb(`${upper} key risks competition market share simple terms`);
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo: Overview', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' company overview')}` },
        { name: 'DuckDuckGo: Financials', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' financials')}` },
        { name: 'DuckDuckGo: Risks', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' risks competition')}` }
      ]
    };
    return `
**${upper} – Beginner-Friendly Company Snapshot**

**What the company does (in plain English):**
${overview || '- Unable to fetch an overview right now.'}

**Financial health (high level):**
${financials || '- Unable to fetch financial highlights right now.'}

**What to watch (risks & context):**
${risks || '- Unable to fetch risks summary right now.'}

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
    `.trim();
  } catch (error) {
    console.error('Analysis (DuckDuckGo) error:', error);
    const upper = String(symbol || '').toUpperCase();
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo: Overview', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' company overview')}` }
      ]
    };
    return `
**${upper} – Company Snapshot**

- Web search temporarily unavailable. Please open the source below for details.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
    `.trim();
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

