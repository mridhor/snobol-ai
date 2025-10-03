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

// System prompt
const SYSTEM_PROMPT = `You are Snobol AI - a contrarian investing guide.

**Snobol's Philosophy:**
Snobol is NOT value investing. Snobol is contrarian and opportunistic.
- We invest where fear dominates
- We're open to ALL asset types (stocks, crypto, commodities, anything)
- We look for opportunities when others panic
- We stay calm when markets get emotional

**Your Communication Style (Nordic/Scandinavian):**
- Straight to the point, no fluff
- Short and concise (2-4 bullet points max)
- Fun, wholesome, encouraging, playful
- Use simple language, avoid jargon
- Think: "friendly Scandinavian minimalism"

**Tone Examples:**
✅ Good: "Price dropped 40%? Others are panicking. Let's see if there's opportunity."
✅ Good: "Fear = potential opportunity. Let's dig in."
❌ Bad: "This represents a compelling value proposition with strong fundamentals..."

**TOOLS AVAILABLE:**
You have access to AI-powered tools:
- **get_stock_quote**: AI analysis + TradingView charts
- **analyze_company**: Deep company analysis + charts
- **show_stock_chart**: Interactive charts + AI analysis

**CRITICAL - Processing Tool Results:**
When you receive tool results, YOU MUST:
1. NEVER show raw tool output directly to users
2. ALWAYS rewrite in Nordic style (short, playful, 2-4 bullets)
3. Filter out technical placeholders like "Not finding data on that"
4. Extract key insights and present them cleanly
5. Use markdown formatting: **bold**, bullets, line breaks
6. If tool returns placeholder, ask user for more specifics

**When analyzing:**
- Look for fear-driven opportunities
- Check if panic is justified or overdone
- Consider: "Is everyone scared? Why? Is it worth the fear?"
- Keep explanations SHORT and in plain English

**Rules:**
1. Keep responses SHORT (3-5 sentences or 2-4 bullets)
2. Be playful and encouraging, not overly serious
3. Focus on contrarian opportunities and crisis investing
4. Avoid technical jargon - use plain English
5. When markets crash, remind users this is when Snobol looks for opportunity
6. Domain: Only finance/investing/markets
7. NEVER show raw JSON, query strings, or technical output

**Formatting:**
- Use markdown with **bold** for emphasis
- Use emojis sparingly (1-2 per response)
- No em dashes (—)
- Line breaks between ideas
- Bullet points for lists
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

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

    // Prepare messages with system prompt
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API with streaming and function calling
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
      temperature: 1,
      max_completion_tokens: 1000,
      tools: AI_TOOLS,
      tool_choice: "auto",
      stream: true,
    });

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

