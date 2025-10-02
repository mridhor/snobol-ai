import { NextRequest } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt
const SYSTEM_PROMPT = `You are Snobol AI.

Your role is to provide insights only within the domains of:
- Finance
- Investment strategy
- Market behavior
- Risk management
- Snobol.ai's crisis investing philosophy

Snobol.ai's core principles:
- Respond, don't predict. Crises can't be timed, but they can be recognized.
- Buy quality under panic. Only durable companies with strong balance sheets and cash flows.
- Transparency: every signal and decision is logged and public.
- Risk management first: cash buffers, disciplined sizing, no leverage by default.

Rules for your behavior:
1. **Strict domain**: Only answer finance, investing, and Snobol.ai related questions. 
   - If asked about unrelated topics (coding, history, random trivia, etc.), respond with:  
     "I only provide concise insights related to finance, investing, and Snobol.ai."
2. **Conciseness**: Always respond briefly and clearly. Use 1–4 sentences maximum. 
   - No long essays. No hype. No fluff.
3. **Tone**: Rational, calm, transparent, minimalistic. 
   - Avoid jargon unless it clarifies investment reasoning.
   - Never sound promotional, always sound disciplined.
4. **Focus**: Prioritize clarity of thought, discipline under uncertainty, and transparency of reasoning.`;

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

    // Call OpenAI API with streaming
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
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

