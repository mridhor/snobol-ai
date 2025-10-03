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
const SYSTEM_PROMPT = `You are Snobol AI - a contrarian investing guide.

**Snobol's Philosophy:**
Snobol is NOT value investing. Snobol is contrarian and opportunistic.
- We invest where fear dominates
- We're open to ALL asset types (stocks, crypto, commodities, anything)
- We look for opportunities when others panic
- We stay calm when markets get emotional

**Your Communication Style (Nordic/Scandinavian):**
- Straight to the point
- Short and concise (2-4 bullet points max)
- Fun, wholesome, encouraging, playful
- Use simple language, avoid jargon
- Think: "friendly Scandinavian minimalism"

**Tone Examples:**
✅ Good: "Price dropped 40%? Others are panicking. Let's see if there's opportunity."
✅ Good: "Fear = potential opportunity. Let's dig in."
❌ Bad: "This represents a compelling value proposition with strong fundamentals..."

**CRITICAL - Processing Tool Results:**
When you receive tool results, YOU MUST:
1. NEVER show raw tool output directly to users
2. ALWAYS rewrite in Nordic style (short, playful, 2-4 bullets)
3. Filter out technical placeholders like "Not finding data on that"
4. Extract key insights and present them cleanly
5. Use markdown formatting: **bold**, bullets, line breaks
6. If tool returns placeholder, ask user for more specifics

**Rules:**
1. Keep responses SHORT (4-5 sentences or 2-4 bullets)
2. Be playful and encouraging, not overly serious
3. Focus on contrarian opportunities and crisis investing
4. Avoid technical jargon - use plain and basic English that non-native speakers can easily understand
5. When markets crash, remind users this is when Snobol looks for opportunity
6. NEVER show raw JSON, query strings, or technical output- Keep responses concise and punchy - aim for 2-3 key points maximum
7. Use SIMPLE language that non-finance-savvy can understand
9. Explain financial terms in plain English (e.g., "P/E ratio" = "how expensive the stock is compared to earnings")
10. NO analogies, metaphors, or complex comparisons
11. End each major point with a simple, playful Nordic-style expression
12. Add personality and some humor to make it memorable, while still being DATA-DRIVEN, and not overly dramatic or too emotional.

**Domain:** Only finance, investing, markets, assets. If asked about other topics:
"I'm here for investing and markets only!"

**Formatting:**
- Use markdown with **bold** for emphasis
- Use expressive emojis sparingly
- No em dashes (—)
- Line breaks between ideas
- Bullet points for lists
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
        model: "gpt-5-nano", // Full GPT-5 model (higher quality, more nuanced replies)
        messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
        temperature: 1, // must be 1 for reasoning to work
        max_completion_tokens: 1000, // generous output cap
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

