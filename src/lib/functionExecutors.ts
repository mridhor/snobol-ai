// Function executors for AI tool calling

/**
 * Enhanced search using multiple strategies
 */
async function searchWeb(query: string): Promise<string> {
  try {
    // Strategy 1: Try DuckDuckGo Instant Answer API
    const ddgResponse = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    const ddgData = await ddgResponse.json();
    
    let result = '';
    if (ddgData.Abstract) {
      result += `${ddgData.Abstract}\n\n`;
    }
    if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
      const topics = ddgData.RelatedTopics.slice(0, 3)
        .filter((topic: { Text?: string }) => topic.Text)
        .map((topic: { Text: string }) => topic.Text)
        .join('\n\n');
      if (topics) {
        result += `${topics}`;
      }
    }
    
    if (result.trim()) {
      return result.trim();
    }
    
    // Strategy 2: Return structured placeholder with actionable info
    return buildPlaceholderResponse(query);
  } catch (error) {
    console.error('Search error:', error);
    return buildPlaceholderResponse(query);
  }
}

/**
 * Build a helpful placeholder when external APIs fail
 */
function buildPlaceholderResponse(query: string): string {
  const isStockQuery = /stock|price|ticker|symbol/i.test(query);
  const isCompanyQuery = /company|overview|business|profile/i.test(query);
  const isFinancialsQuery = /financial|revenue|profit|earnings|balance sheet/i.test(query);
  
  if (isStockQuery) {
    return `**Real-time stock data** is available via financial portals like Yahoo Finance, Google Finance, or your brokerage platform. Check the sources below for live pricing and charts.`;
  }
  
  if (isCompanyQuery) {
    return `**Company overview:** Most publicly traded companies publish their business description, mission, and key products on their investor relations website. You can also find summaries on financial news sites and SEC filings (10-K annual reports).`;
  }
  
  if (isFinancialsQuery) {
    return `**Financial statements** (income statement, balance sheet, cash flow) are published quarterly and annually. Check the company's investor relations page or SEC.gov for official filings.`;
  }
  
  return `For the most current information about "${query}", I recommend checking recent financial news sources, company investor relations pages, or financial data platforms.`;
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
 * ALWAYS includes TradingView chart data
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    const summary = await searchWeb(`${upper} stock price today summary`);
    const howToView = `You can view live pricing via the search link below.`;
    
    // Get TradingView chart data
    const chartData = await getChartDataForSymbol(upper);
    
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
${chartData}
    `.trim();
  } catch (error) {
    console.error('Stock quote (DuckDuckGo) error:', error);
    
    // Still try to include chart even on error
    let chartData = '';
    try {
      chartData = await getChartDataForSymbol(String(symbol || '').toUpperCase());
    } catch (e) {
      // Chart failed too, continue without it
    }
    
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo Search', url: `https://duckduckgo.com/?q=${encodeURIComponent(String(symbol) + ' stock price today')}` }
      ]
    };
    return `
**${String(symbol).toUpperCase()} – Quick Stock Snapshot**

- Web search temporarily unavailable. Please open the search link below for live price.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartData}
    `.trim();
  }
}

/**
 * Analyze company using DuckDuckGo (rich-text summary; no direct financials API)
 * ALWAYS includes TradingView chart data
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    const overview = await searchWeb(`${upper} company overview business description`);
    const financials = await searchWeb(`${upper} financials revenue profit margin balance sheet basics`);
    const risks = await searchWeb(`${upper} key risks competition market share simple terms`);
    
    // Get TradingView chart data
    const chartData = await getChartDataForSymbol(upper);
    
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
${chartData}
    `.trim();
  } catch (error) {
    console.error('Analysis (DuckDuckGo) error:', error);
    const upper = String(symbol || '').toUpperCase();
    
    // Still try to include chart even on error
    let chartData = '';
    try {
      chartData = await getChartDataForSymbol(upper);
    } catch (e) {
      // Chart failed too, continue without it
    }
    
    const sourcesPayload = {
      sources: [
        { name: 'DuckDuckGo: Overview', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' company overview')}` }
      ]
    };
    return `
**${upper} – Company Snapshot**

- Web search temporarily unavailable. Please open the source below for details.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartData}
    `.trim();
  }
}

/**
 * Helper to generate chart data payload for a symbol
 */
async function getChartDataForSymbol(symbol: string): Promise<string> {
  const upper = String(symbol || '').toUpperCase();
  
  // Heuristic exchange guess for common tickers
  function guessExchangeForSymbol(sym: string): string {
    const nasdaqLikely = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','ADBE','NFLX'];
    if (nasdaqLikely.includes(sym)) return 'NASDAQ';
    return 'NYSE';
  }

  let fullSymbol = `${guessExchangeForSymbol(upper)}:${upper}`;
  let companyName = upper;
  let assetType = 'Stock';
  let priceSymbol = '$';

  try {
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${upper}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=`;
    const res = await fetch(searchUrl);
    const searchData = await res.json();
    if (Array.isArray(searchData) && searchData.length > 0) {
      const info = searchData[0];
      const tradingViewSymbol = info.symbol;
      const exchange = info.exchange;
      companyName = info.description || tradingViewSymbol || upper;
      fullSymbol = `${exchange}:${tradingViewSymbol}`;
      assetType = getAssetType(info);
      priceSymbol = getPriceSymbol(assetType, exchange);
    }
  } catch (e) {
    // If search fails, we still proceed with guessed fullSymbol
  }

  return `[CHART_DATA]${JSON.stringify({
    type: 'stock_chart',
    symbol: fullSymbol,
    companyName,
    assetType,
    period: '6mo',
    priceSymbol,
    data: [],
    note: 'Rendering via TradingView widget'
  })}[/CHART_DATA]`;
}

/**
 * Get historical data for chart visualization using TradingView
 * When a chart is requested, ALSO include company analysis
 */

async function getStockChartData(symbol: string, period: string = '6mo'): Promise<string> {
  const upper = String(symbol || '').toUpperCase();
  
  // Build TradingView symbol with smart exchange guessing
  let fullSymbol = '';
  let companyName = upper;
  let assetType = 'Stock';
  let priceSymbol = '$';
  
  try {
    // Try to fetch from TradingView search API
    const searchUrl = `https://symbol-search.tradingview.com/symbol_search/?text=${upper}&exchange=&lang=en&search_type=undefined&domain=production&sort_by_country=`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (Array.isArray(searchData) && searchData.length > 0) {
        const symbolInfo = searchData[0];
        const tradingViewSymbol = symbolInfo.symbol;
        const exchange = symbolInfo.exchange;
        fullSymbol = `${exchange}:${tradingViewSymbol}`;
        companyName = symbolInfo.description || tradingViewSymbol;
        assetType = getAssetType(symbolInfo);
        priceSymbol = getPriceSymbol(assetType, exchange);
      }
    }
  } catch (e) {
    console.log('TradingView search failed, using fallback symbol:', e);
  }
  
  // Fallback: smart guess based on common tickers
  if (!fullSymbol) {
    const guessExchange = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','ADBE','NFLX'].includes(upper) ? 'NASDAQ' : 'NYSE';
    fullSymbol = `${guessExchange}:${upper}`;
  }
  
  // Generate chart data payload
  const chartPayload = `[CHART_DATA]${JSON.stringify({
    type: 'stock_chart',
    symbol: fullSymbol,
    companyName,
    assetType,
    period,
    priceSymbol,
    data: [],
    note: 'Rendering via TradingView widget'
  })}[/CHART_DATA]`;
    
  // ALSO include company analysis with proper error handling
  let overview = '';
  let financials = '';
  let risks = '';
  
  try {
    [overview, financials, risks] = await Promise.all([
      searchWeb(`${upper} company overview business description`).catch(() => '- Unable to fetch overview right now.'),
      searchWeb(`${upper} financials revenue profit margin balance sheet basics`).catch(() => '- Unable to fetch financials right now.'),
      searchWeb(`${upper} key risks competition market share simple terms`).catch(() => '- Unable to fetch risks right now.')
    ]);
  } catch (e) {
    console.error('Error fetching analysis data:', e);
    overview = '- Unable to fetch overview right now.';
    financials = '- Unable to fetch financials right now.';
    risks = '- Unable to fetch risks right now.';
  }
  
  const sourcesPayload = {
    sources: [
      { name: 'DuckDuckGo: Overview', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' company overview')}` },
      { name: 'DuckDuckGo: Financials', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' financials')}` },
      { name: 'DuckDuckGo: Risks', url: `https://duckduckgo.com/?q=${encodeURIComponent(upper + ' risks competition')}` }
    ]
  };
  
  const analysisText = `
**${upper} – Company Snapshot with Chart**

**What the company does (in plain English):**
${overview || '- Unable to fetch an overview right now.'}

**Financial health (high level):**
${financials || '- Unable to fetch financial highlights right now.'}

**What to watch (risks & context):**
${risks || '- Unable to fetch risks summary right now.'}

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartPayload}
  `.trim();
  
  return analysisText;
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

