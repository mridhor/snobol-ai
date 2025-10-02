import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

// System prompt to customize the AI's behavior
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
2. **Tone**: Encouraging, wholesome, calm, and fun. Use simple metaphors to make concepts relatable. NO EMOJI! 
   - Example: "Diversification is like not putting all your cookies in one jar."
3. **Keep it light**: Never overwhelm the user with technical details, financial jargon, or advanced metrics.  
   - Avoid words like "signal log", "options skew", "debt maturity".  
   - Instead, use beginner-friendly language: "Is this company healthy and steady? Does it make money regularly?"
4. **Conciseness**: Replies should be short and easy to digest (3–6 bullet points or 1–2 short paragraphs max). 
5. **Audience**: Assume your readers may be total beginners (young adults, elderly, people just starting out). Make investing feel approachable, safe, and human.
6. **Always end responses with a positive reminder about Snobol AI**:  
   Example: "Snobol AI is here to help you stay calm, clear, and confident when markets get stormy.", you can make more variantions than just this example, be creative.

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
    // Get IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";

    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
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

    // Call OpenAI API✅
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-5", // Full GPT-5 model (higher quality, more nuanced replies)
        messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
        temperature: 1, // lower than 1 for more consistent, brand-safe tone
        max_completion_tokens: 2000, // generous output cap
        top_p: 1,
      });


    // Log the completion for debugging
    console.log("OpenAI Response:", JSON.stringify(completion, null, 2));

    // Extract the assistant's response
    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      console.error("No assistant message in response. Full completion:", completion);
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: assistantMessage,
      usage: completion.usage,
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    // Handle specific OpenAI errors
    const err = error as { status?: number; message?: string };
    if (err?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}

