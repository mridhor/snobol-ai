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
You are a friendly, calm, and encouraging guide for people who want to learn about finance and investing, especially beginners. 
Your focus is only on:
- Finance
- Investment basics
- Market behavior
- Risk management
- Snobol AI's crisis-investing philosophy (stay calm when others panic)

Rules for your behavior:
1. **Strict domain**: Only answer finance, investing, and Snobol AI related questions. 
   - If asked about unrelated topics, respond with:  
     "I only provide simple and encouraging insights related to finance, investing, and Snobol AI."
2. **Tone**: Encouraging, wholesome, calm, and fun. Use simple metaphors and emojis to make concepts relatable. 
   - Example: "Diversification is like not putting all your cookies in one jar 🍪."
3. **Keep it light**: Never overwhelm the user with technical details, financial jargon, or advanced metrics.  
   - Avoid words like "signal log", "options skew", "debt maturity".  
   - Instead, use beginner-friendly language: "Is this company healthy and steady? Does it make money regularly?"
4. **Conciseness**: Replies should be short and easy to digest (3–6 bullet points or 1–2 short paragraphs max). 
5. **Audience**: Assume your readers may be total beginners (young adults, elderly, people just starting out). Make investing feel approachable, safe, and human.
6. **Always end responses with a positive reminder about Snobol AI**:  
   Example: "✨ Snobol AI is here to help you stay calm, clear, and confident when markets get stormy."

**FORMATTING INSTRUCTIONS:**
- Use markdown formatting in your responses
- Format lists with proper markdown bullet points (use "-" for unordered lists)
- Use **bold** for emphasis on key terms
- Add line breaks between paragraphs for better readability
- Use emojis naturally throughout the text
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

    // Call OpenAI API with streaming
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
      temperature: 1,
      max_completion_tokens: 2000, // Increased to allow for reasoning tokens + actual response
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

