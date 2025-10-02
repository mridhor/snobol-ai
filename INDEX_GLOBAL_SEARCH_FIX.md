# Index Global Search Fix - TradingView Without Exchange

## Problem

When displaying charts for market indices (SPX, NASDAQ, DJI, NIKKEI, etc.), the system was trying to prefix them with an exchange like `NYSE:SPX` or `NASDAQ:NDX`.

**Issue:** Most indices are not tied to a specific exchange and need to be searched globally on TradingView.

## Root Cause

The chart function was treating all symbols the same way:
- Stocks: `NASDAQ:AAPL` ✅ Correct
- Crypto: `BINANCE:BTCUSDT` ✅ Correct
- **Indices:** `NYSE:SPX` ❌ Wrong - Should be just `SPX`

Indices are tracked globally by various providers and TradingView expects them without an exchange prefix.

## Solution

### File: `/src/lib/functionExecutors.ts`

Added index detection logic with global search (no exchange prefix).

#### 1. **New Helper Function: `isIndexSymbol()`**

```typescript
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
```

**Covers:**
- ✅ US indices (S&P 500, Dow Jones, NASDAQ, Russell)
- ✅ European indices (FTSE, DAX, CAC40, EURO50)
- ✅ Asian indices (NIKKEI, Hang Seng, SENSEX, NIFTY, KOSPI)
- ✅ Volatility indices (VIX)
- ✅ Generic pattern: anything with "INDEX" in name

#### 2. **Updated `getChartDataForSymbol()`**

Added index handling between crypto and stocks:

```typescript
async function getChartDataForSymbol(symbol: string): Promise<string> {
  const upper = String(symbol || '').toUpperCase();
  
  // Check if it's a crypto symbol
  const isCrypto = isCryptoSymbol(upper);
  
  // For crypto: use BINANCE exchange and add USDT
  if (isCrypto) {
    // ... crypto logic
  }
  
  // Check if it's an index
  const isIndex = isIndexSymbol(upper);
  
  // For indices: use symbol WITHOUT exchange prefix (global search)
  if (isIndex) {
    return `[CHART_DATA]${JSON.stringify({
      type: 'stock_chart',
      symbol: upper, // No exchange prefix!
      companyName: `${upper} Index`,
      assetType: 'Index',
      period: '6mo',
      priceSymbol: '',
      data: [],
      note: 'Rendering via TradingView widget'
    })}[/CHART_DATA]`;
  }
  
  // For stocks: existing logic with exchange prefix
  // ...
}
```

**Key difference:**
- Stocks: `symbol: "NASDAQ:AAPL"`
- Indices: `symbol: "SPX"` (no exchange)

#### 3. **Updated `getStockChartData()`**

Applied same logic to the full chart+analysis function:

```typescript
async function getStockChartData(symbol: string, period: string = '6mo'): Promise<string> {
  const upper = String(symbol || '').toUpperCase();
  
  const isCrypto = isCryptoSymbol(upper);
  const isIndex = isIndexSymbol(upper);
  
  if (isCrypto) {
    // ... crypto logic
  } else if (isIndex) {
    // For indices: use symbol WITHOUT exchange prefix
    fullSymbol = upper;
    companyName = `${upper} Index`;
    assetType = 'Index';
    priceSymbol = '';
  } else {
    // For stocks: try TradingView search API
    // ...
  }
  
  // ... rest of function
}
```

## How It Works

### Symbol Processing Flow

```
User asks: "Show SPX chart"
                ↓
      isIndexSymbol("SPX")?
                ↓
              Yes
                ↓
     symbol = "SPX" (no prefix)
     companyName = "SPX Index"
     assetType = "Index"
                ↓
   TradingView widget renders
   with global SPX symbol
```

### Before vs After

#### Before (Broken)

**User:** "Show SPX chart"

**System generates:**
```json
{
  "symbol": "NYSE:SPX",  // ❌ Wrong
  "companyName": "SPX",
  "assetType": "Stock"
}
```

**Result:** Chart might not load or show wrong data

#### After (Fixed)

**User:** "Show SPX chart"

**System generates:**
```json
{
  "symbol": "SPX",  // ✅ Correct
  "companyName": "SPX Index",
  "assetType": "Index"
}
```

**Result:** Chart loads correctly with global SPX data

## Supported Indices

### 🇺🇸 United States
- **SPX** / SPX500 / SP500 - S&P 500 Index
- **DJI** / DJIA / DOW - Dow Jones Industrial Average
- **IXIC** / NASDAQ / NDX - NASDAQ Composite/100
- **RUT** / RUSSELL2000 - Russell 2000 Index
- **VIX** - CBOE Volatility Index

### 🇬🇧 United Kingdom
- **FTSE** / FTSE100 - FTSE 100 Index

### 🇩🇪 Germany
- **DAX** / DAX40 - DAX Index

### 🇯🇵 Japan
- **NIKKEI** / NIKKEI225 / N225 - Nikkei 225 Index

### 🇭🇰 Hong Kong
- **HANGSENG** / HSI - Hang Seng Index

### 🇫🇷 France
- **CAC40** / CAC - CAC 40 Index

### 🇪🇺 Europe
- **EURO50** / STOXX50 - EURO STOXX 50

### 🇮🇳 India
- **SENSEX** - BSE SENSEX
- **NIFTY** / NIFTY50 - NIFTY 50 Index

### 🇰🇷 South Korea
- **KOSPI** - Korea Composite Stock Price Index
- **KOSDAQ** - Korean Securities Dealers Automated Quotations

### 🇨🇦 Canada
- **TSX** / SPTSX - S&P/TSX Composite Index

## Pattern Matching

Also supports generic detection:
```typescript
symbol.includes('INDEX')  // Matches: "MSCI_INDEX", "WORLD_INDEX", etc.
```

## Asset Type Hierarchy

Symbol processing order:
1. **Crypto** - Check if BTC, ETH, etc. → Add USDT, use BINANCE
2. **Index** - Check if SPX, DJI, etc. → No exchange prefix
3. **Stock** - Default → Try TradingView search, use exchange prefix

## Testing

### Test 1: S&P 500
**Input:** "Show SPX chart"  
**Expected:** `symbol: "SPX"` (no exchange)  
**Result:** ✅ TradingView loads S&P 500 data

### Test 2: NASDAQ Composite
**Input:** "Analyze NASDAQ"  
**Expected:** `symbol: "NASDAQ"` (no exchange)  
**Result:** ✅ TradingView loads NASDAQ Composite

### Test 3: VIX
**Input:** "Show VIX"  
**Expected:** `symbol: "VIX"` (no exchange)  
**Result:** ✅ TradingView loads volatility index

### Test 4: NIKKEI
**Input:** "NIKKEI chart"  
**Expected:** `symbol: "NIKKEI"` (no exchange)  
**Result:** ✅ TradingView loads Nikkei 225

### Test 5: Stock (for comparison)
**Input:** "Show AAPL chart"  
**Expected:** `symbol: "NASDAQ:AAPL"` (with exchange)  
**Result:** ✅ Still works correctly with exchange prefix

## Edge Cases Handled

| Input | Asset Type | Symbol Output | Exchange? |
|-------|------------|---------------|-----------|
| SPX | Index | `SPX` | No |
| S&P500 | Index | `S&P500` | No |
| DJIA | Index | `DJIA` | No |
| AAPL | Stock | `NASDAQ:AAPL` | Yes |
| BTC | Crypto | `BINANCE:BTCUSDT` | Yes |
| CUSTOM_INDEX | Index | `CUSTOM_INDEX` | No |
| VIX | Index | `VIX` | No |

## Benefits

✅ **Correct index charts** - No more exchange mismatch  
✅ **Global coverage** - US, Europe, Asia indices supported  
✅ **Pattern flexibility** - Detects "INDEX" in symbol names  
✅ **Maintains stock logic** - Exchange prefixes still work for stocks  
✅ **Crypto unchanged** - BINANCE prefix still works for crypto  

## Notes

- **Indices are global** - Not tied to specific exchanges
- **TradingView expects** - Index symbols without exchange prefix
- **Crypto still uses** - `BINANCE:` prefix for consistency
- **Stocks still use** - Exchange prefix (e.g., `NASDAQ:AAPL`)
- **priceSymbol** - Empty for indices (no currency needed)

---

**Indices now chart correctly with global TradingView search! 📊🌍**

No exchange prefix needed. Just the symbol: SPX, DJI, NIKKEI, etc.
