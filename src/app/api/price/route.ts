import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Default fallback values
const DEFAULT_PRICE = 18.49;
const DEFAULT_SP500_PRICE = 3.30;

export async function GET() {
  try {
    // Fetch current prices from Supabase
    const { data, error } = await supabase
      .from('snobol_current_price')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log('No price data found, returning defaults');
      return NextResponse.json({
        success: true,
        currentPrice: DEFAULT_PRICE,
        currentSP500Price: DEFAULT_SP500_PRICE
      });
    }

    return NextResponse.json({
      success: true,
      currentPrice: data.current_price || DEFAULT_PRICE,
      currentSP500Price: data.current_sp500_price || DEFAULT_SP500_PRICE
    });
  } catch (error) {
    console.error('Error fetching price data:', error);
    return NextResponse.json({
      success: true,
      currentPrice: DEFAULT_PRICE,
      currentSP500Price: DEFAULT_SP500_PRICE
    });
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

    // Check if a record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('snobol_current_price')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    let result;
    if (existingData && !fetchError) {
      // Update existing record
      result = await supabase
        .from('snobol_current_price')
        .update({
          current_price: validatedPrice,
          current_sp500_price: validatedSP500Price,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select();
    } else {
      // Insert new record
      result = await supabase
        .from('snobol_current_price')
        .insert({
          current_price: validatedPrice,
          current_sp500_price: validatedSP500Price,
          updated_at: new Date().toISOString()
        })
        .select();
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json(
        { error: 'Failed to update price in database' },
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
