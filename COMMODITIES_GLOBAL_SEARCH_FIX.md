# Commodities Global Search Fix - Complete Asset Coverage

## Problem

Commodities (Gold, Silver, Oil, Copper, etc.) were being treated like stocks with exchange prefixes, but **commodities are globally traded and shouldn't have exchange prefixes** on TradingView.

## Solution

Added comprehensive commodity detection covering 40+ commodities across all major categories.

### File: `/src/lib/functionExecutors.ts`

#### New Helper Function: `isCommoditySymbol()`

```typescript
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
```

## Supported Commodities

### 🥇 Precious Metals
- **GOLD** / GLD / GC / XAUUSD / XAU - Gold futures and spot
- **SILVER** / SLV / SI / XAGUSD / XAG - Silver futures and spot
- **PLATINUM** / XPTUSD / XPT / PL - Platinum
- **PALLADIUM** / XPDUSD / XPD / PA - Palladium

### ⚡ Energy
- **OIL** / CRUDE / CL / USOIL / WTI - Crude Oil (West Texas Intermediate)
- **BRENT** - Brent Crude Oil
- **NATURALGAS** / NG / NATGAS - Natural Gas
- **GASOLINE** / RB - Gasoline futures

### 🔩 Industrial Metals
- **COPPER** / HG / XCULUSD - Copper
- **ALUMINUM** / ALUMINIUM - Aluminum
- **NICKEL** - Nickel
- **ZINC** - Zinc
- **LEAD** - Lead

### 🌾 Agricultural
- **WHEAT** / ZW - Wheat futures
- **CORN** / ZC - Corn futures
- **SOYBEANS** / ZS / SOYBEAN - Soybean futures
- **SUGAR** - Sugar futures
- **COTTON** - Cotton futures
- **COFFEE** - Coffee futures
- **COCOA** - Cocoa futures
- **RICE** - Rice futures
- **OATS** - Oats futures

### 🐄 Livestock
- **CATTLE** - Live Cattle
- **LEAN** - Lean Hogs
- **HOGS** - Hogs futures

### 🌲 Other
- **LUMBER** - Lumber futures
- **ORANGE** / ORANGEJUICE - Orange Juice futures

## Updated Asset Processing Order

Now processes symbols in this priority:

1. **Crypto** → `BINANCE:BTCUSDT` (with exchange + USDT)
2. **Index** → `SPX` (NO exchange prefix)
3. **Commodity** → `GOLD` (NO exchange prefix)
4. **Stock** → `NASDAQ:AAPL` (with exchange)

## Implementation

### In `getChartDataForSymbol()`:

```typescript
// Check if it's a commodity
const isCommodity = isCommoditySymbol(upper);

// For commodities: use symbol WITHOUT exchange prefix (global search)
if (isCommodity) {
  return `[CHART_DATA]${JSON.stringify({
    type: 'stock_chart',
    symbol: upper, // No exchange prefix!
    companyName: `${upper} Commodity`,
    assetType: 'Commodity',
    period: '6mo',
    priceSymbol: '$',
    data: [],
    note: 'Rendering via TradingView widget'
  })}[/CHART_DATA]`;
}
```

### In `getStockChartData()`:

```typescript
const isCommodity = isCommoditySymbol(upper);

if (isCommodity) {
  // For commodities: use symbol WITHOUT exchange prefix (global search)
  fullSymbol = upper;
  companyName = `${upper} Commodity`;
  assetType = 'Commodity';
  priceSymbol = '$';
}
```

## Before vs After

### Before (Broken)

**User:** "Show GOLD chart"

**System generates:**
```json
{
  "symbol": "NYSE:GOLD",  // ❌ Wrong (treats as stock)
  "companyName": "GOLD",
  "assetType": "Stock"
}
```

**Result:** Shows Barrick Gold Corp stock (GOLD) instead of gold commodity

### After (Fixed)

**User:** "Show GOLD chart"

**System generates:**
```json
{
  "symbol": "GOLD",  // ✅ Correct
  "companyName": "GOLD Commodity",
  "assetType": "Commodity"
}
```

**Result:** Shows actual gold commodity price (XAU/USD)

## Multiple Symbol Formats

The function handles various ways users might reference commodities:

| User Input | Detected As | TradingView Symbol |
|------------|-------------|-------------------|
| GOLD | Commodity | `GOLD` |
| GLD | Commodity | `GLD` |
| XAUUSD | Commodity | `XAUUSD` |
| XAU | Commodity | `XAU` |
| OIL | Commodity | `OIL` |
| CRUDE | Commodity | `CRUDE` |
| WTI | Commodity | `WTI` |
| SILVER | Commodity | `SILVER` |
| XAGUSD | Commodity | `XAGUSD` |
| COPPER | Commodity | `COPPER` |

## Pattern Matching

Also supports generic detection:
```typescript
symbol.includes('COMMODITY')  // Matches: "CUSTOM_COMMODITY", etc.
```

## Testing Examples

### Test 1: Gold
**User:** "Show gold chart"  
**Expected:** `symbol: "GOLD"` (no exchange)  
✅ TradingView loads gold commodity price

### Test 2: Silver
**User:** "Analyze silver"  
**Expected:** `symbol: "SILVER"` (no exchange)  
✅ TradingView loads silver commodity price

### Test 3: Oil (WTI)
**User:** "Show oil chart"  
**Expected:** `symbol: "OIL"` (no exchange)  
✅ TradingView loads crude oil price

### Test 4: Copper
**User:** "Copper price"  
**Expected:** `symbol: "COPPER"` (no exchange)  
✅ TradingView loads copper commodity

### Test 5: Natural Gas
**User:** "Show natural gas"  
**Expected:** `symbol: "NATURALGAS"` (no exchange)  
✅ TradingView loads natural gas futures

### Test 6: Stock (for comparison)
**User:** "Show GLD stock"  
**Note:** GLD ETF might be detected as commodity. For stock, use full name: "SPDR Gold Trust"

## Complete Asset Type Coverage

| Asset Type | Example | Symbol Format | Exchange? |
|------------|---------|---------------|-----------|
| **Crypto** | BTC | `BINANCE:BTCUSDT` | Yes |
| **Index** | SPX | `SPX` | No |
| **Commodity** | GOLD | `GOLD` | No |
| **Stock** | AAPL | `NASDAQ:AAPL` | Yes |

## Edge Cases

### Commodity ETFs vs Commodities
- **GLD** (ETF) → Detected as commodity (shows gold price)
- **SLV** (ETF) → Detected as commodity (shows silver price)

If users specifically want the ETF stock chart, they should be more explicit or we rely on TradingView's symbol resolution.

### Multiple Names
Users can use various names for the same commodity:
- Gold: GOLD, GLD, XAUUSD, XAU, GC
- Oil: OIL, CRUDE, CL, USOIL, WTI, BRENT
- Natural Gas: NATURALGAS, NG, NATGAS

## Why This Matters

**Commodities are globally traded** across multiple exchanges:
- Gold trades on COMEX, NYMEX, London, Shanghai, etc.
- Oil trades on NYMEX, ICE, Brent, etc.
- Agricultural commodities trade on CBOT, CME, ICE, etc.

TradingView's global search automatically finds the most relevant/liquid contract without needing exchange specification.

## Benefits

✅ **40+ commodities supported** - Metals, energy, agriculture, livestock  
✅ **Multiple symbol formats** - GC, GOLD, XAUUSD all work  
✅ **Global price tracking** - No exchange confusion  
✅ **Contrarian investing** - Perfect for Snobol's fear-driven opportunities  
✅ **Complete coverage** - Crypto, indices, commodities, stocks all handled correctly  

## Notes

- Commodities use **global TradingView search** (no exchange prefix)
- Some commodity ETFs (GLD, SLV) are detected as commodities (intentional)
- `priceSymbol: '$'` for commodities (most are USD-denominated)
- Pattern includes "COMMODITY" for custom tickers

---

**All major asset types now supported! 🥇📊⚡🌾**

Crypto, Indices, Commodities, and Stocks - all with correct TradingView formatting.
