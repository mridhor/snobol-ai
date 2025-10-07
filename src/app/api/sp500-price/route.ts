import { NextRequest, NextResponse } from 'next/server'
import { addTodayData, checkAndRecordYearlyData } from '@/utils/chartData'

export async function GET(request: NextRequest) {
  try {
    // Using Yahoo Finance API for S&P 500 Index (^GSPC) - actual index value
    const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC';
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.chart && data.chart.result && data.chart.result[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      const actualPrice = meta.regularMarketPrice;
      
      // Calculate normalized price based on 8/8/2013 baseline of $1697.48
      const baselinePrice = 1697.48;
      const normalizedPrice = actualPrice / baselinePrice;
      
      // Get current Snobol price (you can make this dynamic later)
      const currentSnobolPrice = 18.49; // This should match your current Snobol price
      
      // Update the financial data with today's data
      const updatedData = addTodayData(currentSnobolPrice, normalizedPrice);
      
      // Check if we need to record yearly data
      checkAndRecordYearlyData(currentSnobolPrice, normalizedPrice);
      
      return NextResponse.json({
        actualPrice: actualPrice,
        normalizedPrice: normalizedPrice,
        baselinePrice: baselinePrice,
        currentSnobolPrice: currentSnobolPrice,
        updatedData: updatedData,
        source: 'yahoo',
        timestamp: new Date().toISOString()
      });
    }
    
    // If Alpha Vantage fails, return a fallback price (last known good value)
    const fallbackPrice = 6713.71;
    const baselinePrice = 1697.48;
    const normalizedPrice = fallbackPrice / baselinePrice;
    const currentSnobolPrice = 18.49;
    
    // Still update the financial data with fallback values
    const updatedData = addTodayData(currentSnobolPrice, normalizedPrice);
    checkAndRecordYearlyData(currentSnobolPrice, normalizedPrice);
    
    return NextResponse.json({
      actualPrice: fallbackPrice,
      normalizedPrice: normalizedPrice,
      baselinePrice: baselinePrice,
      currentSnobolPrice: currentSnobolPrice,
      updatedData: updatedData,
      source: 'fallback',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('S&P 500 price fetch error:', error);
    
    // Return fallback price on error
    const fallbackPrice = 6713.71;
    const baselinePrice = 1697.48;
    const normalizedPrice = fallbackPrice / baselinePrice;
    const currentSnobolPrice = 18.49;
    
    // Update financial data even on error
    const updatedData = addTodayData(currentSnobolPrice, normalizedPrice);
    checkAndRecordYearlyData(currentSnobolPrice, normalizedPrice);
    
    return NextResponse.json({
      actualPrice: fallbackPrice,
      normalizedPrice: normalizedPrice,
      baselinePrice: baselinePrice,
      currentSnobolPrice: currentSnobolPrice,
      updatedData: updatedData,
      source: 'error_fallback',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 to prevent frontend errors
  }
}
