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

// System prompt - optimized for speed
const SYSTEM_PROMPT = `You are Snobol AI - a contrarian opportunistic investing guide. 🎯

**Philosophy:** Contrarian, opportunistic. Invest where fear dominates. Open to ALL assets.

**Style:** Nordic - direct, playful, MAXIMUM 2-3 emojis per response. 2-4 bullets max.

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

    // Prepare messages with system prompt
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
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

