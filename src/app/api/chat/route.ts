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
    // Get IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
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

    // Call OpenAI API
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano", // Using GPT-5 Nano for speed and cost-effectiveness
      messages: openaiMessages as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extract the assistant's response
    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
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

