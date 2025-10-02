# Crypto Integration - BINANCE + USDT

## What Changed

Added special handling for cryptocurrency symbols to use **BINANCE** exchange with **USDT** trading pairs.

## How It Works

### Crypto Detection

30+ popular cryptocurrencies are automatically detected:
- BTC, ETH, BNB, XRP, ADA, DOGE, SOL, DOT, MATIC, AVAX
- LINK, UNI, ATOM, LTC, BCH, XLM, ALGO, VET, FIL, TRX
- ETC, THETA, XMR, AAVE, CAKE, XTZ, EOS, NEAR, FTM, SAND

### Symbol Transformation

When a crypto symbol is detected:

**Input:** `BTC` or `ETH` or `DOGE`
**TradingView Symbol:** `BINANCE:BTCUSDT` or `BINANCE:ETHUSDT` or `BINANCE:DOGEUSDT`

### Exchange Selection

| Asset Type | Exchange | Format |
|------------|----------|--------|
| Cryptocurrency | **BINANCE** | `BINANCE:{SYMBOL}USDT` |
| Stocks (NASDAQ) | NASDAQ | `NASDAQ:{SYMBOL}` |
| Stocks (NYSE) | NYSE | `NYSE:{SYMBOL}` |
| Other | TradingView Search | Auto-detected |

## Examples

### Example 1: Bitcoin
**User asks:** "Show BTC chart"
**Result:** `BINANCE:BTCUSDT`
**Chart:** Bitcoin/USDT on Binance

### Example 2: Ethereum
**User asks:** "Analyze ETH"
**Result:** `BINANCE:ETHUSDT`
**Chart:** Ethereum/USDT on Binance

### Example 3: Dogecoin
**User asks:** "What's DOGE doing?"
**Result:** `BINANCE:DOGEUSDT`
**Chart:** Dogecoin/USDT on Binance

### Example 4: Apple (Stock)
**User asks:** "Show AAPL chart"
**Result:** `NASDAQ:AAPL`
**Chart:** Apple stock on NASDAQ

## Files Modified

### `/src/lib/functionExecutors.ts`

1. **Added `isCryptoSymbol()` function:**
   - Checks if a symbol is in the crypto list
   - Returns boolean

2. **Updated `getChartDataForSymbol()`:**
   - Detects crypto symbols
   - Uses `BINANCE:{SYMBOL}USDT` format
   - Sets asset type to "Cryptocurrency"

3. **Updated `getStockChartData()`:**
   - Detects crypto symbols
   - Uses `BINANCE:{SYMBOL}USDT` format
   - Bypasses TradingView search for crypto

## Supported Cryptocurrencies

### Major Coins (30+)
```javascript
['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'AVAX', 
 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL', 'TRX',
 'ETC', 'THETA', 'XMR', 'AAVE', 'CAKE', 'XTZ', 'EOS', 'NEAR', 'FTM', 'SAND']
```

### To Add More:
Edit the `cryptoTickers` array in `isCryptoSymbol()` function.

## Testing

### Test Bitcoin:
```bash
curl -sS -N -H "Content-Type: application/json" \
  -X POST \
  -d '{"messages":[{"role":"user","content":"Show BTC chart"}]}' \
  http://localhost:3000/api/chat/stream | grep CHART_DATA
```

Expected output:
```
[CHART_DATA]{"type":"stock_chart","symbol":"BINANCE:BTCUSDT","companyName":"BTC (Cryptocurrency)",...}
```

### Test Ethereum:
```bash
curl -sS -N -H "Content-Type: application/json" \
  -X POST \
  -d '{"messages":[{"role":"user","content":"Analyze ETH"}]}' \
  http://localhost:3000/api/chat/stream | grep CHART_DATA
```

Expected output:
```
[CHART_DATA]{"type":"stock_chart","symbol":"BINANCE:ETHUSDT","companyName":"ETH (Cryptocurrency)",...}
```

## Why BINANCE + USDT?

1. **BINANCE** - Largest crypto exchange by volume, best liquidity
2. **USDT** - Most liquid trading pair, stable USD reference
3. **TradingView** - Native support for Binance data

## Contrarian Philosophy for Crypto

Snobol's contrarian approach works perfectly with crypto:

- ✅ **Fear-driven opportunities** - Crypto crashes often present opportunities
- ✅ **Panic selling** - When everyone panics, Snobol looks closer
- ✅ **All asset types** - Open to crypto, not just stocks
- ✅ **Opportunistic** - If there's fear, we investigate

### Example Questions:
- "BTC dropped 40%, is this panic overdone?"
- "Everyone's scared of crypto, should I look?"
- "What's the fear level on ETH right now?"

## User Experience

### Before:
- Crypto symbols might not work
- No standardized exchange
- Inconsistent data

### After:
- ✅ All major crypto symbols work
- ✅ Always uses BINANCE for reliability
- ✅ Always uses USDT pairs
- ✅ Consistent, clean charts

## Future Enhancements

Possible additions:
- [ ] More altcoins (add to `cryptoTickers` array)
- [ ] Support for other stablecoins (USDC, BUSD)
- [ ] Multiple exchange support (Coinbase, Kraken)
- [ ] Crypto-specific analysis tools

## Notes

- **No Alpha Vantage for crypto**: Crypto data comes from TradingView only
- **Chart-only**: No fundamental analysis API for crypto (yet)
- **USDT default**: All crypto uses USDT as quote currency
- **Case insensitive**: BTC, btc, Btc all work

---

**Crypto integration complete! 🪙**

Snobol now supports major cryptocurrencies with BINANCE:XXXUSDT format!
