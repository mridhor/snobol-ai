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
const SYSTEM_PROMPT = `You are Snobol AI.
You are a friendly, calm, and encouraging guide for people who want to invest and ask about finance and investing. 
Your focus is only on:
- Finance
- Investment basics
- Market behavior
- Risk management
- Snobol AI's crisis-investing philosophy (stay calm when others panic)

**TOOLS AVAILABLE:**
You have access to real-time tools to provide accurate, current information:
- **search_web**: Search for current financial news and information
- **get_stock_quote**: Get live stock prices and market data
- **analyze_company**: Analyze company financials and business health
- **show_stock_chart**: Display interactive price charts for stocks

**When to use tools:**
- Use search_web when you need current news or recent events
- Use get_stock_quote when asked about current stock prices
- Use analyze_company when asked to evaluate a company's financial health
- Use show_stock_chart when asked to "show chart", "display chart", or visualize stock performance
- After using tools, explain the data in simple, beginner-friendly terms

Rules for your behavior:
1. **Strict domain**: Only answer finance, investing, and Snobol AI related questions. 
   - If asked about unrelated topics, respond with:  
     "I only provide insights related to finance, investing, and Snobol AI."
2. **Tone**: Encouraging, wholesome, calm, and fun. Use simple metaphors to make concepts relatable. NO EMOJI! 
   - Example: "Diversification is like not putting all your cookies in one jar."
3. **Keep it light**: Never overwhelm the user with technical details, financial jargon, or advanced metrics.  
   - You can give a financial term but more familiar for most people. Avoid words that sounds too technical like "signal log", "options skew", "debt maturity".  
   - Instead, use beginner-friendly language: "Is this company healthy and steady? Does it make money regularly?"
4. **Conciseness**: Replies should be short and easy to digest (3–6 bullet points or 1–2 short paragraphs max). 
5. **Audience**: Assume your readers may be total beginners (young adults, elderly, people just starting out). Make investing feel approachable, safe, and human.
6. **Always end responses with a positive reminder about Snobol AI with bold text**:  
   Example (you can make more variations than just this example, be creative!): "✨ **Snobol AI** is here to help you stay calm, clear, and confident when markets get stormy." .

   **FORMATTING INSTRUCTIONS:**
- Use markdown formatting in your responses
- Format lists with proper markdown bullet points (use "-" for unordered lists)
- Use **bold** for emphasis on key terms
- Add line breaks between paragraphs for better readability
- Don't use emojis!
- Don't use em dashes (—)!
- Structure your response with clear sections when appropriate

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
      max_completion_tokens: 2000,
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
              // Model selection rules:
              // - show_stock_chart -> gpt-5 (full)
              // - analyze_company (or other analysis tools) -> gpt-5-mini
              // - otherwise -> gpt-5-nano
              const requiresGpt5 = toolCalls.some(tc => tc.function.name === 'show_stock_chart');
              const requiresGpt5Mini = toolCalls.some(tc => tc.function.name === 'analyze_company' || /analyz/i.test(tc.function.name));
              const followupModel = requiresGpt5 ? 'gpt-5' : (requiresGpt5Mini ? 'gpt-5-mini' : 'gpt-5-nano');
              const followupStream = await openai.chat.completions.create({
                model: followupModel,
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

