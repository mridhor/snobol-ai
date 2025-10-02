# Test Plan for New Contrarian Prompts

## Quick Tests

### Test 1: Stock Analysis
**Prompt:** "Analyze Apple stock"

**Expected:**
- ✅ SHORT response (2-4 bullets, under 100 words)
- ✅ Contrarian perspective (any fear? opportunity?)
- ✅ TradingView chart displayed
- ✅ Plain English, no jargon
- ✅ Playful, encouraging tone

**Bad Signs:**
- ❌ Long, detailed fundamental analysis
- ❌ Talk of "intrinsic value" or "margin of safety"
- ❌ More than 5 bullet points

---

### Test 2: Chart Request
**Prompt:** "Show TSLA chart"

**Expected:**
- ✅ Chart + brief contrarian commentary
- ✅ Very short (2-3 sentences max)
- ✅ Focus on fear/opportunity if relevant
- ✅ Playful tone

---

### Test 3: General Question
**Prompt:** "Where should I invest right now?"

**Expected:**
- ✅ "Where's the fear?" approach
- ✅ 2-4 bullets max
- ✅ Contrarian mindset
- ✅ No specific recommendations unless asked
- ✅ Encouraging, not preachy

---

### Test 4: Crypto
**Prompt:** "What do you think about Bitcoin?"

**Expected:**
- ✅ Open to crypto (NOT dismissive)
- ✅ Contrarian take (what's the sentiment? fear or greed?)
- ✅ Short and direct
- ✅ Opportunistic mindset

---

### Test 5: Follow-up Suggestions
**After any analysis, check suggestion pills:**

**Expected Suggestions:**
- ✅ "Is this panic overdone?"
- ✅ "What's the crowd missing?"
- ✅ "Where's the real risk?"
- ✅ "Is everyone scared?"

**NOT Expected:**
- ❌ "What's the company's moat?"
- ❌ "How's their free cash flow?"
- ❌ "What's the P/E ratio?"
- ❌ Technical analysis questions

---

## Response Quality Checklist

For each response, verify:

### Length
- [ ] Under 100 words total
- [ ] 2-4 bullet points OR 3-5 sentences
- [ ] No long paragraphs

### Tone
- [ ] Playful and encouraging
- [ ] Direct and straight-forward
- [ ] No overly formal language
- [ ] Feels "Nordic" (minimal, friendly)

### Philosophy
- [ ] Contrarian perspective present
- [ ] Focus on fear/opportunity (not fundamentals)
- [ ] Open to ALL asset types
- [ ] No "value investing" language

### Language
- [ ] Plain English
- [ ] No jargon (EBITDA, DCF, etc.)
- [ ] Simple metaphors if any
- [ ] Easy for beginners

### Formatting
- [ ] Markdown formatting used
- [ ] 1-2 emojis max
- [ ] Bold used for emphasis
- [ ] Line breaks between ideas
- [ ] No em dashes (—)

---

## Example Good Response

**User:** "Analyze Apple stock"

**Good Response:**
```
**AAPL - Quick Take** 📱

Apple makes iPhones, Macs, and services. Huge business, steady money maker.

Current vibe: Stock's been volatile lately, but no major panic.

Opportunity check: If there's fear, look closer. If everyone loves it, be cautious.

[Chart displayed above]
[Sources: Brave Search links]
```

**Word count:** ~40 words
**Style:** Short, direct, contrarian mindset
**Tone:** Friendly, not overly serious

---

## Example Bad Response

**User:** "Analyze Apple stock"

**Bad Response:**
```
Apple Inc. (AAPL) represents a compelling investment opportunity based on several key fundamental metrics:

**Business Overview:**
Apple is a technology company that designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company operates through several segments including iPhone, Mac, iPad, Wearables, Home and Accessories, and Services.

**Financial Health:**
- Strong balance sheet with $165B in cash
- Revenue growth of 8% YoY
- Operating margins above 25%
- Free cash flow of $100B annually
- Low debt-to-equity ratio

**Competitive Advantages:**
- Brand moat is exceptional
- Ecosystem lock-in creates switching costs
- Pricing power demonstrated consistently

**Valuation:**
Current P/E ratio of 28x suggests the stock is fairly valued relative to historical averages. Using a discounted cash flow model with a 10% discount rate, the intrinsic value is approximately...

[continues for 200+ more words]
```

**Problems:**
- ❌ WAY too long (200+ words)
- ❌ Value investing language ("moat", "intrinsic value")
- ❌ Too much detail and jargon
- ❌ Formal, educational tone
- ❌ No contrarian perspective
- ❌ Feels like a research report, not Snobol

---

## Quick Command Line Test

```bash
# Test the streaming endpoint
curl -sS -N -H "Content-Type: application/json" \
  -X POST \
  -d '{"messages":[{"role":"user","content":"Analyze Apple stock"}]}' \
  http://localhost:3000/api/chat/stream | head -n 80
```

Check for:
1. Short, concise response
2. Contrarian perspective
3. Chart data included
4. Plain English

---

## Success Criteria

✅ **Pass:** Responses are <100 words, contrarian, playful, direct
❌ **Fail:** Responses are long, formal, value-investing focused, detailed

Remember: **Nordic minimalism with a contrarian mindset!**
