import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Default fallback values
const DEFAULT_PRICE = 18.49;
const DEFAULT_SP500_PRICE = 3.30;

// File path to store prices
const PRICE_FILE_PATH = path.join(process.cwd(), 'data', 'current-price.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read prices from file
function readPrices() {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PRICE_FILE_PATH)) {
      const data = fs.readFileSync(PRICE_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading price file:', error);
  }
  return {
    currentPrice: DEFAULT_PRICE,
    currentSP500Price: DEFAULT_SP500_PRICE,
    updatedAt: new Date().toISOString()
  };
}

// Write prices to file
function writePrices(currentPrice: number, currentSP500Price: number) {
  try {
    ensureDataDirectory();
    const data = {
      currentPrice,
      currentSP500Price,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(PRICE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing price file:', error);
    return false;
  }
}

export async function GET() {
  try {
    const prices = readPrices();
    return NextResponse.json({
      success: true,
      currentPrice: prices.currentPrice,
      currentSP500Price: prices.currentSP500Price
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
    const validatedPrice = typeof newPrice === 'number' && newPrice >= 0 
      ? (newPrice === 0 ? 0.01 : newPrice) 
      : DEFAULT_PRICE;
    
    const validatedSP500Price = typeof newSP500Price === 'number' && newSP500Price >= 0 
      ? (newSP500Price === 0 ? 0.01 : newSP500Price) 
      : DEFAULT_SP500_PRICE;

    // Write to file
    const success = writePrices(validatedPrice, validatedSP500Price);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update price' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      currentPrice: validatedPrice,
      currentSP500Price: validatedSP500Price,
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
