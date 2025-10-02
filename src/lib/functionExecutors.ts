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
 * Get stock quote using Yahoo Finance (free, no API key needed)
 * Using a free proxy service or direct Yahoo Finance API
 */
async function getStockQuote(symbol: string): Promise<string> {
  try {
    // Using Yahoo Finance query API (free, no auth required)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      return `Could not find stock data for symbol "${symbol}". Please verify the ticker symbol is correct.`;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    const currentPrice = meta.regularMarketPrice || quote?.close?.[0];
    const previousClose = meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = ((change / previousClose) * 100).toFixed(2);
    
    const dayHigh = quote?.high?.[0] || meta.dayHigh;
    const dayLow = quote?.low?.[0] || meta.dayLow;
    const volume = quote?.volume?.[0];
    
    return `
**${meta.symbol}** - ${meta.longName || meta.shortName || 'N/A'}

**Current Price:** $${currentPrice?.toFixed(2)}
**Change:** $${change.toFixed(2)} (${changePercent}%)
**Day Range:** $${dayLow?.toFixed(2)} - $${dayHigh?.toFixed(2)}
**Volume:** ${volume ? (volume / 1000000).toFixed(2) + 'M' : 'N/A'}
**Market:** ${meta.exchangeName || 'N/A'}

*Data as of ${new Date(meta.regularMarketTime * 1000).toLocaleString()}*
    `.trim();
  } catch (error) {
    console.error('Stock quote error:', error);
    return `Unable to fetch stock data for "${symbol}". Please verify the ticker symbol is correct (e.g., AAPL for Apple, TSLA for Tesla).`;
  }
}

/**
 * Analyze company using Yahoo Finance (comprehensive data)
 */
async function analyzeCompany(symbol: string): Promise<string> {
  try {
    // Get quote summary from Yahoo Finance
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol.toUpperCase()}?modules=assetProfile,summaryProfile,financialData,defaultKeyStatistics,price`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.quoteSummary?.result?.[0]) {
      return `Could not find company data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const info = data.quoteSummary.result[0];
    const profile = info.assetProfile || info.summaryProfile || {};
    const financial = info.financialData || {};
    const stats = info.defaultKeyStatistics || {};
    const price = info.price || {};
    
    const analysis = `
**${profile.longName || symbol}**

**Sector:** ${profile.sector || 'N/A'}
**Industry:** ${profile.industry || 'N/A'}
**Employees:** ${profile.fullTimeEmployees?.toLocaleString() || 'N/A'}

**Financial Health:**
- Market Cap: $${(price.marketCap / 1e9)?.toFixed(2)}B
- Revenue (TTM): $${(financial.totalRevenue / 1e9)?.toFixed(2)}B
- Profit Margin: ${(financial.profitMargins * 100)?.toFixed(2)}%
- Debt/Equity: ${financial.debtToEquity?.toFixed(2) || 'N/A'}
- Current Ratio: ${financial.currentRatio?.toFixed(2) || 'N/A'}

**Valuation:**
- P/E Ratio: ${stats.trailingPE?.toFixed(2) || stats.forwardPE?.toFixed(2) || 'N/A'}
- Price/Book: ${stats.priceToBook?.toFixed(2) || 'N/A'}
- 52-Week Range: $${stats.fiftyTwoWeekLow?.toFixed(2)} - $${stats.fiftyTwoWeekHigh?.toFixed(2)}

**About:**
${profile.longBusinessSummary?.slice(0, 300) || 'No description available'}...
    `.trim();
    
    return analysis;
  } catch (error) {
    console.error('Company analysis error:', error);
    return `Unable to analyze "${symbol}". The company data may not be available or the ticker symbol is incorrect.`;
  }
}

/**
 * Get historical stock data for chart visualization
 */
async function getStockChartData(symbol: string, period: string = '6mo'): Promise<string> {
  try {
    // Map period to Yahoo Finance intervals
    const intervalMap: Record<string, string> = {
      '1d': '5m',
      '5d': '15m',
      '1mo': '1d',
      '3mo': '1d',
      '6mo': '1d',
      '1y': '1wk',
      '5y': '1mo'
    };
    
    const interval = intervalMap[period] || '1d';
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=${interval}&range=${period}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      return `Could not fetch chart data for "${symbol}". Please verify the ticker symbol.`;
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const meta = result.meta;
    
    // Format data for charting
    const chartData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(period === '1y' || period === '5y' ? { year: '2-digit' } : {})
      }),
      price: quotes.close[index]?.toFixed(2),
      high: quotes.high[index]?.toFixed(2),
      low: quotes.low[index]?.toFixed(2),
      volume: quotes.volume[index]
    })).filter((item: { price?: string; high?: string; low?: string; volume?: number }) => item.price); // Remove null data points
    
    // Return as special formatted JSON that frontend can parse
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: symbol.toUpperCase(),
      companyName: meta.longName || meta.shortName || symbol,
      period: period,
      currentPrice: meta.regularMarketPrice?.toFixed(2),
      change: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      data: chartData
    })}[/CHART_DATA]`;
    
  } catch (error) {
    console.error('Chart data error:', error);
    return `Unable to fetch chart data for "${symbol}". Please try again.`;
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

