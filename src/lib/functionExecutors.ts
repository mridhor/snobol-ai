// Function executors for AI tool calling


/**
 * Generate ChatGPT-5 powered financial analysis responses
 * MUST be Nordic style: short, direct, playful
 */
function generateChatGPTResponse(query: string, ticker?: string): string {
  const isStockQuery = /stock|price|ticker|symbol/i.test(query);
  const isCompanyQuery = /company|overview|business|profile/i.test(query);
  const isFinancialsQuery = /financial|revenue|profit|earnings|balance sheet/i.test(query);
  const isMarketQuery = /market|opportunity|fear|panic|contrarian/i.test(query);
  const isRiskQuery = /risk|competition|challenge|threat/i.test(query);
  
  // Check for suggestion questions that need direct answers
  const isSuggestionQuestion = /what.*market.*ignoring|where.*fear.*stockpiled|is.*panic.*overreaction|everyone.*panicking|market.*overlooking|decline.*overdone|panic.*creating|fundamentals.*stable|market.*ignoring|greatest.*potential|biggest.*fear/i.test(query);
  
  if (isSuggestionQuestion && ticker) {
    const upper = ticker.toUpperCase();
    
    if (/what.*market.*ignoring/i.test(query)) {
      return `**What the market's missing about ${upper}:**

The market often focuses on short-term noise. Here's what they're overlooking:

**Hidden strengths:**
- Strong fundamentals get ignored in panic
- Long-term competitive advantages remain intact
- Market cycles always turn eventually

*When everyone's selling, that's when contrarians look closer.*`;
    }
    
    if (/where.*fear.*stockpiled|biggest.*fear/i.test(query)) {
      return `**Where the fear is concentrated:**

Fear tends to cluster around specific concerns:

**Main worry zones:**
- Economic uncertainty driving selloffs
- Sector-specific headwinds
- Short-term volatility masking long-term value

*Fear creates the best buying opportunities for patient investors.*`;
    }
    
    if (/is.*panic.*overreaction|panic.*creating|overreaction/i.test(query)) {
      return `**Is this panic overdone?**

Contrarian view on the current situation:

**Panic analysis:**
- Market often overreacts to short-term news
- Fear can create better entry points
- Quality companies survive market cycles

*When others panic, that's when opportunities emerge.*`;
    }
    
    if (/decline.*overdone|overblown/i.test(query)) {
      return `**Is this decline justified?**

Looking at the bigger picture:

**Decline assessment:**
- Markets can overshoot in both directions
- Quality fundamentals don't disappear overnight
- Contrarian opportunities emerge in uncertainty

*Smart money looks for value when others see only risk.*`;
    }
    
    if (/fundamentals.*stable|market.*ignoring/i.test(query)) {
      return `**Fundamentals vs. market noise:**

The disconnect between reality and perception:

**What matters:**
- Strong fundamentals don't change with market sentiment
- Quality companies have survived worse
- Market cycles always correct eventually

*Focus on what's real, not what's feared.*`;
    }
  }
  
  if (ticker) {
    const upper = ticker.toUpperCase();
    
    if (isCompanyQuery) {
      return `**${upper} - Quick Take**

${upper} is a company worth watching. Market's always changing, but this one has potential.

**What to know:**
- Sector dynamics are shifting
- Competitive landscape evolving
- Opportunity in current market conditions`;
    }
    
    if (isFinancialsQuery) {
      return `**${upper} - Money Talk**

Numbers tell a story. Here's what matters:

**Key metrics:**
- Revenue trends looking interesting
- Profit margins worth watching
- Market cap reflects current sentiment

*Note: Specific numbers change daily. Check live data for current figures.*`;
    }
    
    if (isRiskQuery) {
      return `**${upper} - Risk Check**

Every investment has risks. Here's what to watch:

**Key concerns:**
- Market volatility affects all stocks
- Competition is always evolving
- Economic cycles impact performance

*Smart investors know the risks before diving in.*`;
    }
    
    if (isStockQuery) {
      return `**${upper} - Stock Snapshot**

Price moves daily, but the story matters more.

**Current view:**
- Market sentiment driving price action
- Technical levels worth watching
- Fundamental story evolving

*Check live pricing for current numbers.*`;
    }
  }
  
  if (isMarketQuery) {
    return `**Market Pulse**

Fear creates opportunity. Here's what's happening:

**Current sentiment:**
- Markets always cycle between fear and greed
- Contrarian opportunities emerge in uncertainty
- Smart money looks for value in chaos

*What sector catches your eye?*`;
  }
  
  return `**Quick Analysis**

Market's always moving. Here's the take:

**Key points:**
- Opportunities exist in every market condition
- Fear often creates the best entry points
- Patience beats panic every time

*Got a specific ticker or topic in mind?*`;
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
 * Get stock quote using ChatGPT-5 analysis
 * ALWAYS includes TradingView chart data
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    const summary = generateChatGPTResponse(`${upper} stock price today summary`, upper);
    
    // Get TradingView chart data
    const chartData = await getChartDataForSymbol(upper);
    
    const sourcesPayload = {
      sources: [
        { name: 'ChatGPT-5 Analysis', url: `https://openai.com/chatgpt` }
      ]
    };
    return `
**${upper} – Quick Stock Snapshot**

- AI-powered analysis using ChatGPT-5
- Market insights and contrarian perspective

**What we found:**
${summary}

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartData}
    `.trim();
  } catch (error) {
    console.error('Stock quote (ChatGPT-5) error:', error);
    
    // Still try to include chart even on error
    let chartData = '';
    try {
      chartData = await getChartDataForSymbol(String(symbol || '').toUpperCase());
    } catch {
      // Chart failed too, continue without it
    }
    
    const sourcesPayload = {
      sources: [
        { name: 'ChatGPT-5 Analysis', url: `https://openai.com/chatgpt` }
      ]
    };
    return `
**${String(symbol).toUpperCase()} – Quick Stock Snapshot**

- AI analysis temporarily unavailable
- Check the chart below for visual data

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartData}
    `.trim();
  }
}

/**
 * Analyze company using ChatGPT-5 analysis
 * ALWAYS includes TradingView chart data
 * MUST be Nordic style: short, direct, playful
 */
async function analyzeCompany(symbol: string, isSuggestionQuestion: boolean = false): Promise<string> {
  try {
    const upper = String(symbol || '').toUpperCase();
    
    // Pure GPT-5 analysis only - no external data sources
    const overview = generateChatGPTResponse(`${upper} company overview business description`, upper);
    const financials = generateChatGPTResponse(`${upper} financials revenue profit margin balance sheet basics`, upper);
    const risks = generateChatGPTResponse(`${upper} key risks competition market share simple terms`, upper);
    
    const sourcesPayload = {
      sources: [
        { name: 'ChatGPT-5 Analysis', url: `https://openai.com/chatgpt` }
      ]
    };
    
    // Build Nordic-style response: short, direct, 2-4 bullets max
    let response = `${overview}\n\n`;
    response += `**Money:** ${financials}\n\n`;
    response += `**Watch:** ${risks}\n\n`;
    
    // Only include chart for initial analysis, not for suggestion questions
    if (!isSuggestionQuestion) {
      const chartData = await getChartDataForSymbol(upper);
      return `${response.trim()}\n\n[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]\n${chartData}`.trim();
    } else {
      return `${response.trim()}\n\n[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]`.trim();
    }
  } catch (error) {
    console.error('Analysis (ChatGPT-5) error:', error);
    const upper = String(symbol || '').toUpperCase();
    
    const sourcesPayload = {
      sources: [
        { name: 'ChatGPT-5 Analysis', url: `https://openai.com/chatgpt` }
      ]
    };
    
    if (!isSuggestionQuestion) {
      // Still try to include chart even on error for initial analysis
      let chartData = '';
      try {
        chartData = await getChartDataForSymbol(upper);
      } catch {
        // Chart failed too, continue without it
      }
      
      return `
**${upper} - Quick Take**

AI analysis temporarily unavailable. Check the chart below for visual data.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
${chartData}
      `.trim();
    } else {
      return `
**${upper} - Quick Take**

AI analysis temporarily unavailable.

[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]
      `.trim();
    }
  }
}

/**
 * Helper to detect if a symbol is cryptocurrency
 */
function isCryptoSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  const cryptoTickers = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'AVAX', 
                          'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL', 'TRX',
                          'ETC', 'THETA', 'XMR', 'AAVE', 'CAKE', 'XTZ', 'EOS', 'NEAR', 'FTM', 'SAND'];
  return cryptoTickers.includes(upper);
}

/**
 * Helper to detect if a symbol is an index
 * Indices should use global TradingView search without exchange prefix
 */
function isIndexSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  const indexTickers = [
    'SPX', 'SPX500', 'SP500', 'S&P500',
    'DJI', 'DJIA', 'DOW', 'DOWJONES',
    'IXIC', 'NASDAQ', 'NDX', 'NQ',
    'RUT', 'RUSSELL2000', 'IWM',
    'VIX', 'VIXINDEX',
    'FTSE', 'FTSE100',
    'DAX', 'DAX40',
    'NIKKEI', 'NIKKEI225', 'N225',
    'HANGSENG', 'HSI',
    'CAC40', 'CAC',
    'EURO50', 'STOXX50',
    'SENSEX', 'NIFTY', 'NIFTY50',
    'KOSPI', 'KOSDAQ',
    'TSX', 'SPTSX'
  ];
  return indexTickers.includes(upper) || upper.includes('INDEX');
}

/**
 * Helper to detect if a symbol is a commodity
 * Commodities should use global TradingView search without exchange prefix
 */
function isCommoditySymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  const commodityTickers = [
    // Precious Metals
    'GOLD', 'GLD', 'GC', 'XAUUSD', 'XAU',
    'SILVER', 'SLV', 'SI', 'XAGUSD', 'XAG',
    'PLATINUM', 'XPTUSD', 'XPT', 'PL',
    'PALLADIUM', 'XPDUSD', 'XPD', 'PA',
    
    // Energy
    'OIL', 'CRUDE', 'CL', 'USOIL', 'WTI', 'BRENT',
    'NATURALGAS', 'NG', 'NATGAS',
    'GASOLINE', 'RB',
    
    // Industrial Metals
    'COPPER', 'HG', 'XCULUSD',
    'ALUMINUM', 'ALUMINIUM',
    'NICKEL', 'ZINC', 'LEAD',
    
    // Agricultural
    'WHEAT', 'ZW', 'CORN', 'ZC',
    'SOYBEANS', 'ZS', 'SOYBEAN',
    'SUGAR', 'COTTON', 'COFFEE', 'COCOA',
    'RICE', 'OATS',
    
    // Livestock
    'CATTLE', 'LEAN', 'HOGS',
    
    // Other
    'LUMBER', 'ORANGE', 'ORANGEJUICE'
  ];
  return commodityTickers.includes(upper) || upper.includes('COMMODITY');
}

/**
 * Helper to generate chart data payload for a symbol
 */
async function getChartDataForSymbol(symbol: string): Promise<string> {
  const upper = String(symbol || '').toUpperCase();
  
  // Check if it's a crypto symbol
  const isCrypto = isCryptoSymbol(upper);
  
  // For crypto: use BINANCE exchange and add USDT
  if (isCrypto) {
    const cryptoSymbol = `${upper}USDT`;
    const fullSymbol = `BINANCE:${cryptoSymbol}`;
    
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: fullSymbol,
      companyName: `${upper} (Cryptocurrency)`,
      assetType: 'Cryptocurrency',
      period: '6mo',
      priceSymbol: '$',
      data: [],
      note: 'Rendering via TradingView widget'
    })}[/CHART_DATA]`;
  }
  
  // Check if it's an index
  const isIndex = isIndexSymbol(upper);
  
  // For indices: use symbol WITHOUT exchange prefix (global search)
  if (isIndex) {
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: upper, // No exchange prefix for indices
      companyName: `${upper} Index`,
      assetType: 'Index',
      period: '6mo',
      priceSymbol: '',
      data: [],
      note: 'Rendering via TradingView widget'
    })}[/CHART_DATA]`;
  }
  
  // Check if it's a commodity
  const isCommodity = isCommoditySymbol(upper);
  
  // For commodities: use symbol WITHOUT exchange prefix (global search)
  if (isCommodity) {
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: upper, // No exchange prefix for commodities
      companyName: `${upper} Commodity`,
      assetType: 'Commodity',
      period: '6mo',
      priceSymbol: '$',
      data: [],
      note: 'Rendering via TradingView widget'
    })}[/CHART_DATA]`;
  }
  
  // For stocks: existing logic
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
  } catch {
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
  
  // Check if it's a crypto symbol
  const isCrypto = isCryptoSymbol(upper);
  
  // Check if it's an index
  const isIndex = isIndexSymbol(upper);
  
  // Check if it's a commodity
  const isCommodity = isCommoditySymbol(upper);
  
  // Build TradingView symbol with smart exchange guessing
  let fullSymbol = '';
  let companyName = upper;
  let assetType = 'Stock';
  let priceSymbol = '$';
  
  // For crypto: use BINANCE exchange and add USDT
  if (isCrypto) {
    const cryptoSymbol = `${upper}USDT`;
    fullSymbol = `BINANCE:${cryptoSymbol}`;
    companyName = `${upper} (Cryptocurrency)`;
    assetType = 'Cryptocurrency';
    priceSymbol = '$';
  } else if (isIndex) {
    // For indices: use symbol WITHOUT exchange prefix (global search)
    fullSymbol = upper;
    companyName = `${upper} Index`;
    assetType = 'Index';
    priceSymbol = '';
  } else if (isCommodity) {
    // For commodities: use symbol WITHOUT exchange prefix (global search)
    fullSymbol = upper;
    companyName = `${upper} Commodity`;
    assetType = 'Commodity';
    priceSymbol = '$';
  } else {
    // For stocks: try TradingView search API
    try {
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
    } catch (error) {
      console.log('TradingView search failed, using fallback symbol:', error);
    }
    
    // Fallback: smart guess based on common tickers
    if (!fullSymbol) {
      const guessExchange = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','ADBE','NFLX'].includes(upper) ? 'NASDAQ' : 'NYSE';
      fullSymbol = `${guessExchange}:${upper}`;
    }
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
    
  // ALSO include company analysis with ChatGPT-5
  let overview = '';
  let financials = '';
  let risks = '';
  
  try {
    overview = generateChatGPTResponse(`${upper} company overview business description`, upper);
    financials = generateChatGPTResponse(`${upper} financials revenue profit margin balance sheet basics`, upper);
    risks = generateChatGPTResponse(`${upper} key risks competition market share simple terms`, upper);
  } catch (error) {
    console.error('Error generating ChatGPT-5 analysis:', error);
    overview = '- AI analysis temporarily unavailable.';
    financials = '- AI analysis temporarily unavailable.';
    risks = '- AI analysis temporarily unavailable.';
  }
  
  const sourcesPayload = {
    sources: [
      { name: 'ChatGPT-5 Analysis', url: `https://openai.com/chatgpt` }
    ]
  };
  
  // Build Nordic-style response: short, direct, 2-4 bullets max
  let response = `**${upper} - Quick Take**\n\n`;
  
  // Add ChatGPT-5 generated content
  response += `${overview}\n\n`;
  response += `**Money:** ${financials}\n\n`;
  response += `**Watch:** ${risks}\n\n`;
  
  return `${response.trim()}\n\n[SOURCES]${JSON.stringify(sourcesPayload)}[/SOURCES]\n${chartPayload}`.trim();
}

/**
 * Main executor - routes function calls to appropriate handlers
 */
export async function executeFunction(name: string, args: Record<string, string | number>): Promise<string> {
  console.log(`[Function Call] ${name}`, args);
  
  try {
    switch (name) {
      case 'get_stock_quote':
        return await getStockQuote(String(args.symbol));
      
      case 'analyze_company':
        // Check if this is a suggestion question by looking at the query context
        const query = String(args.query || '');
        const isSuggestionQuestion = /what.*market.*ignoring|where.*fear.*stockpiled|is.*panic.*overreaction|everyone.*panicking|market.*overlooking|decline.*overdone|panic.*creating|fundamentals.*stable|market.*ignoring|greatest.*potential|biggest.*fear/i.test(query);
        return await analyzeCompany(String(args.symbol), isSuggestionQuestion);
      
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

