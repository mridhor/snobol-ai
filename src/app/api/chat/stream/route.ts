import { NextRequest } from "next/server";
import OpenAI from "openai";
import { AI_TOOLS } from "@/lib/aiTools";
import { executeFunction } from "@/lib/functionExecutors";

// Type extension for GPT-5 reasoning support
interface DeltaWithReasoning {
  content?: string | null;
  reasoning_content?: string | null;
  role?: string;
}

// Type for tool calls
interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Helper function to extract last mentioned company from conversation history
function getLastMentionedCompany(messages: Array<{ role: string; content: string }>): string | null {
  // Look through recent messages for company mentions
  for (let i = messages.length - 1; i >= Math.max(0, messages.length - 10); i--) {
    const message = messages[i];
    if (message.role === 'user' || message.role === 'assistant') {
      const content = message.content.toLowerCase();
      
      // Look for explicit company mentions
      const companyMatches = content.match(/\b(apple|aapl|microsoft|msft|google|googl|amazon|amzn|tesla|tsla|meta|facebook|fb|nvidia|nvda|netflix|nflx|alphabet|uber|uber|spotify|spot|paypal|pypl|adobe|adbe|salesforce|crm|oracle|orcl|intel|intc|amd|advanced micro devices|coca-cola|ko|pepsi|pep|mcdonalds|mcd|walmart|wmt|home depot|hd|nike|nke|disney|dis|jpmorgan|jpm|bank of america|bac|wells fargo|wfc|goldman sachs|gs|morgan stanley|ms|visa|v|mastercard|ma|american express|axp|berkshire hathaway|brk\.a|brk\.b|brka|brkb|procter & gamble|pg|johnson & johnson|jnj|unilever|ul|p&g|3m|mmm|general electric|ge|boeing|ba|general motors|gm|ford|f|chevron|cvx|exxon|xom|shell|rds\.a|rds\.b|bp|british petroleum|total|ttf|eni|eni|repsol|rep|petrobras|pbr|vale|vale|bhp|bhp|rio tinto|rio|glencore|glen|anglo american|aal|freeport-mcmoran|fcx|newmont|nem|barrick|gld|gold|silver|slv|platinum|palladium|copper|oil|crude|natural gas|wheat|corn|soybeans|coffee|sugar|cocoa|cotton|lumber|steel|aluminum|nickel|zinc|lead|tin|uranium|bitcoin|btc|ethereum|eth|binance coin|bnb|cardano|ada|solana|sol|polkadot|dot|chainlink|link|litecoin|ltc|bitcoin cash|bch|stellar|xlm|monero|xmr|dash|dash|zcash|zec|ripple|xrp|dogecoin|doge|shiba inu|shib|avalanche|avax|polygon|matic|cosmos|atom|algorand|algo|vechain|vet|filecoin|fil|internet computer|icp|the graph|grt|uniswap|uni|aave|aave|compound|comp|maker|mkr|sushi|sushi|yearn|yfi|curve|crv|balancer|bal|1inch|1inch|pancakeswap|cake|bancor|bnt|kyber|knc|0x|zrx|augur|rep|golem|gnt|basic attention token|bat|civic|cvc|district0x|dnt|funfair|fun|gnosis|gno|icon|icx|kyber network|knc|lisk|lsk|loopring|lrc|omisego|omg|quant|qnt|request|req|status|snt|storj|storj|tron|trx|verge|xvg|waves|waves|waltonchain|wtc|zilliqa|zil)\b/g);
      
      if (companyMatches && companyMatches.length > 0) {
        const lastMatch = companyMatches[companyMatches.length - 1];
        // Convert company name to ticker symbol
        const tickerMap: { [key: string]: string } = {
          'apple': 'AAPL', 'aapl': 'AAPL',
          'microsoft': 'MSFT', 'msft': 'MSFT',
          'google': 'GOOGL', 'googl': 'GOOGL', 'alphabet': 'GOOGL',
          'amazon': 'AMZN', 'amzn': 'AMZN',
          'tesla': 'TSLA', 'tsla': 'TSLA',
          'meta': 'META', 'facebook': 'META', 'fb': 'META',
          'nvidia': 'NVDA', 'nvda': 'NVDA',
          'netflix': 'NFLX', 'nflx': 'NFLX',
          'uber': 'UBER', 'spotify': 'SPOT', 'spot': 'SPOT',
          'paypal': 'PYPL', 'pypl': 'PYPL',
          'adobe': 'ADBE', 'adbe': 'ADBE',
          'salesforce': 'CRM', 'crm': 'CRM',
          'oracle': 'ORCL', 'orcl': 'ORCL',
          'intel': 'INTC', 'intc': 'INTC',
          'amd': 'AMD', 'advanced micro devices': 'AMD',
          'coca-cola': 'KO', 'ko': 'KO',
          'pepsi': 'PEP', 'pep': 'PEP',
          'mcdonalds': 'MCD', 'mcd': 'MCD',
          'walmart': 'WMT', 'wmt': 'WMT',
          'home depot': 'HD', 'hd': 'HD',
          'nike': 'NKE', 'nke': 'NKE',
          'disney': 'DIS', 'dis': 'DIS',
          'bitcoin': 'BTC', 'btc': 'BTC',
          'ethereum': 'ETH', 'eth': 'ETH',
          'binance coin': 'BNB', 'bnb': 'BNB',
          'cardano': 'ADA', 'ada': 'ADA',
          'solana': 'SOL', 'sol': 'SOL',
          'polkadot': 'DOT', 'dot': 'DOT',
          'chainlink': 'LINK', 'link': 'LINK',
          'litecoin': 'LTC', 'ltc': 'LTC',
          'bitcoin cash': 'BCH', 'bch': 'BCH',
          'stellar': 'XLM', 'xlm': 'XLM',
          'monero': 'XMR', 'xmr': 'XMR',
          'dash': 'DASH',
          'zcash': 'ZEC', 'zec': 'ZEC',
          'ripple': 'XRP', 'xrp': 'XRP',
          'dogecoin': 'DOGE', 'doge': 'DOGE',
          'shiba inu': 'SHIB', 'shib': 'SHIB',
          'avalanche': 'AVAX', 'avax': 'AVAX',
          'polygon': 'MATIC', 'matic': 'MATIC',
          'cosmos': 'ATOM', 'atom': 'ATOM',
          'algorand': 'ALGO', 'algo': 'ALGO',
          'vechain': 'VET', 'vet': 'VET',
          'filecoin': 'FIL', 'fil': 'FIL',
          'internet computer': 'ICP', 'icp': 'ICP',
          'the graph': 'GRT', 'grt': 'GRT',
          'uniswap': 'UNI', 'uni': 'UNI',
          'aave': 'AAVE',
          'compound': 'COMP', 'comp': 'COMP',
          'maker': 'MKR', 'mkr': 'MKR',
          'sushi': 'SUSHI',
          'yearn': 'YFI', 'yfi': 'YFI',
          'curve': 'CRV', 'crv': 'CRV',
          'balancer': 'BAL', 'bal': 'BAL',
          '1inch': '1INCH',
          'pancakeswap': 'CAKE', 'cake': 'CAKE',
          'bancor': 'BNT', 'bnt': 'BNT',
          'kyber': 'KNC', 'knc': 'KNC',
          '0x': 'ZRX', 'zrx': 'ZRX',
          'augur': 'REP',
          'golem': 'GNT', 'gnt': 'GNT',
          'basic attention token': 'BAT', 'bat': 'BAT',
          'civic': 'CVC', 'cvc': 'CVC',
          'district0x': 'DNT', 'dnt': 'DNT',
          'funfair': 'FUN', 'fun': 'FUN',
          'gnosis': 'GNO', 'gno': 'GNO',
          'icon': 'ICX', 'icx': 'ICX',
          'kyber network': 'KNC',
          'lisk': 'LSK', 'lsk': 'LSK',
          'loopring': 'LRC', 'lrc': 'LRC',
          'omisego': 'OMG', 'omg': 'OMG',
          'quant': 'QNT', 'qnt': 'QNT',
          'request': 'REQ', 'req': 'REQ',
          'status': 'SNT', 'snt': 'SNT',
          'storj': 'STORJ',
          'tron': 'TRX', 'trx': 'TRX',
          'verge': 'XVG', 'xvg': 'XVG',
          'waves': 'WAVES',
          'waltonchain': 'WTC', 'wtc': 'WTC',
          'zilliqa': 'ZIL', 'zil': 'ZIL'
        };
        
        return tickerMap[lastMatch.toLowerCase()] || lastMatch.toUpperCase();
      }
    }
  }
  return null;
}

// System prompt - optimized for speed with context awareness and multilingual support
const SYSTEM_PROMPT = `You are Snobol AI - a contrarian opportunistic investing guide. 🎯

**Philosophy:** Contrarian, opportunistic. Invest where fear dominates. Open to ALL assets.

**Style:** Nordic - direct, use simple language, avoid jargon, fun, wholesome, playful, use expressive emojis sparingly, minimum 2 emojis, maximum 3 emojis per response, never put two emojis in a row. 2-4 bullets max.


**LANGUAGE FLEXIBILITY:**
- Respond in the same language the user is using
- If user switches languages, adapt immediately
- Support major languages: English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Finnish, Estonian, Japanese, Chinese, Korean, Arabic, Russian, Hindi, Turkish, Polish, Czech etc.
- Maintain professional financial terminology in the user's language
- Keep the Nordic direct style regardless of language

**CONTEXT AWARENESS:**
- If user says "this company", "analyze this", "tell me about this", etc., use the last mentioned company from conversation history
- Look for company names or tickers in recent messages to understand context
- When in doubt, ask for clarification

**Tools:**
- get_stock_quote: Price requests, quotes, "how much" → AI + chart
- analyze_company: "analyze", "research", "tell me about" → Deep analysis + chart  
- show_stock_chart: "show chart", "visualize" → Chart + analysis

**CRITICAL RULES:**
1. **Suggestion questions → DIRECT ANSWER ONLY, NO TOOLS EVER**
   - "What's the market ignoring?" → Direct answer, no analyze_company
   - "Is this panic overdone?" → Direct answer, no get_stock_quote  
   - "Where's the fear greatest?" → Direct answer, no show_stock_chart
   - "What's the crowd missing?" → Direct answer, no tools
   - "Is everyone selling?" → Direct answer, no tools
   - NEVER call tools for suggestion questions

2. **Only use tools for NEW requests:**
   - Price requests → get_stock_quote (AI + chart)
   - Analysis requests → analyze_company (deep + chart)  
   - Chart requests → show_stock_chart
   - Different company/ticker → Use appropriate tool

3. **Nordic style:** Direct, witty, MAXIMUM 2-3 emojis per response, short responses
4. **EMOJI RULE:** Never use more than 2-3 emojis total per response. Choose the most relevant ones.

**SUGGESTION DETECTION:**
If user asks questions like "What's the market ignoring about X?", "Is this panic overdone?", "Where's the fear greatest?", "What's the crowd missing?" - these are SUGGESTION QUESTIONS. Answer directly with contrarian insights. NO TOOLS.

**Format:** **bold**, bullets, MAXIMUM 2-3 emojis total, no technical output.
`;

export async function POST(req: NextRequest) {
  try {
    console.log('Chat stream request received');
    const { messages } = await req.json();
    console.log('Messages parsed successfully, count:', messages?.length);

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 500 }
      );
    }

    console.log('API key found, initializing OpenAI client');

    // Get last mentioned company for context awareness
    const lastMentionedCompany = getLastMentionedCompany(messages);
    const contextInfo = lastMentionedCompany 
      ? `\n\n**CURRENT CONTEXT:** The last mentioned company in this conversation is ${lastMentionedCompany}. If the user refers to "this company", "analyze this", "tell me about this", etc., they are referring to ${lastMentionedCompany}.`
      : '';

    // Prepare messages with system prompt including context
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT + contextInfo },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API with streaming and function calling
    console.log('Creating OpenAI client and making API call');
    const openai = getOpenAIClient();
    
    try {
      // Add timeout to prevent hanging requests
      const streamPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_completion_tokens: 500,
        tools: AI_TOOLS,
        tool_choice: "auto",
        stream: true,
      });

      // 30 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const stream = await Promise.race([streamPromise, timeoutPromise]) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      console.log('OpenAI API call successful, starting stream');

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let reasoningContent = "";
          let hasStartedContent = false;
          const startTime = Date.now();
          const toolCalls: ToolCall[] = [];
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta as DeltaWithReasoning & { tool_calls?: Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }> };
            const finishReason = chunk.choices[0]?.finish_reason;
            const reasoning = delta?.reasoning_content || "";
            const content = delta?.content || "";
            
            // Handle tool calls streaming
            if (delta?.tool_calls) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                
                if (!toolCalls[index]) {
                  toolCalls[index] = {
                    id: toolCallDelta.id || '',
                    type: 'function',
                    function: { name: '', arguments: '' }
                  };
                }
                
                if (toolCallDelta.function?.name) {
                  toolCalls[index].function.name += toolCallDelta.function.name;
                }
                if (toolCallDelta.function?.arguments) {
                  toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                }
              }
            }
            
            // Collect reasoning tokens
            if (reasoning) {
              reasoningContent += reasoning;
            }
            
            // When content starts, send reasoning metadata first
            if (content && !hasStartedContent && reasoningContent) {
              hasStartedContent = true;
              const thinkingTime = Date.now() - startTime;
              const metadata = JSON.stringify({
                type: "reasoning",
                reasoning: reasoningContent,
                thinkingTime: thinkingTime,
              });
              controller.enqueue(encoder.encode(`[REASONING]${metadata}[/REASONING]`));
            }
            
            // Stream content
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
            
            // Handle tool call execution
            if (finishReason === 'tool_calls' && toolCalls.length > 0) {
              console.log('Tool calls detected:', toolCalls.map(tc => tc.function.name));
              
              // Send tool call metadata to client for dynamic loading message
              const toolMetadata = JSON.stringify({
                type: "tool_call",
                toolName: toolCalls[0].function.name, // Use first tool for message
                toolCount: toolCalls.length
              });
              controller.enqueue(encoder.encode(`[TOOL_CALL]${toolMetadata}[/TOOL_CALL]`));
              
              // Execute all tool calls in parallel
              const toolResults = await Promise.all(
                toolCalls.map(async (toolCall) => {
                  try {
                    const args = JSON.parse(toolCall.function.arguments);
                    const result = await executeFunction(toolCall.function.name, args);
                    return {
                      tool_call_id: toolCall.id,
                      role: "tool" as const,
                      content: result,
                    };
                  } catch (error) {
                    console.error(`Error executing ${toolCall.function.name}:`, error);
                    return {
                      tool_call_id: toolCall.id,
                      role: "tool" as const,
                      content: `Error: Unable to execute ${toolCall.function.name}`,
                    };
                  }
                })
              );
              
              // Stream tool results directly so clients can parse special tags like [CHART_DATA]
              for (const tr of toolResults) {
                if (tr.content) {
                  controller.enqueue(encoder.encode(String(tr.content)));
                }
              }

              // Build new message history with tool results
              const messagesWithTools = [
                ...(openaiMessages as OpenAI.ChatCompletionMessageParam[]),
                {
                  role: "assistant" as const,
                  tool_calls: toolCalls.map(tc => ({
                    id: tc.id,
                    type: "function" as const,
                    function: {
                      name: tc.function.name,
                      arguments: tc.function.arguments
                    }
                  }))
                },
                ...toolResults
              ] as OpenAI.ChatCompletionMessageParam[];
              
              // Make follow-up streaming call with tool results
              const followupStream = await openai.chat.completions.create({
                model: "gpt-5-nano",
                messages: messagesWithTools,
                temperature: 1,
                max_completion_tokens: 1000,
                stream: true,
              });
              
              // Stream the AI's response using the tool data
              for await (const followupChunk of followupStream) {
                const followupDelta = followupChunk.choices[0]?.delta as DeltaWithReasoning;
                const followupContent = followupDelta?.content || "";
                
                if (followupContent) {
                  controller.enqueue(encoder.encode(followupContent));
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service. Please try again.",
        }),
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Chat Stream API Error:", error);
    const err = error as { message?: string };
    return new Response(
      JSON.stringify({
        error: err?.message || "Failed to process chat request",
      }),
      { status: 500 }
    );
  }
}

