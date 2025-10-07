import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, you'd want to use a database
let currentPrice = 18.49;
let currentSP500Price = 3.30;

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      currentPrice,
      currentSP500Price
    });
  } catch (error) {
    console.error('Error fetching price data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentPrice: newPrice, currentSP500Price: newSP500Price } = await request.json();
    
    // Validate the price values and set minimum to 0.01
    if (typeof newPrice === 'number' && newPrice >= 0) {
      currentPrice = newPrice === 0 ? 0.01 : newPrice;
    }
    
    if (typeof newSP500Price === 'number' && newSP500Price >= 0) {
      currentSP500Price = newSP500Price === 0 ? 0.01 : newSP500Price;
    }
    
    return NextResponse.json({
      success: true,
      currentPrice,
      currentSP500Price,
      message: 'Price updated successfully'
    });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}
