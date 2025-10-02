import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt to customize the AI's behavior
const SYSTEM_PROMPT = `You are Snobol AI Assistant, a helpful and knowledgeable assistant for Snobol, an AI-powered investment platform that invests in various crises to generate superior returns.

Key information about Snobol:
- Snobol uses AI to identify and invest in crisis situations
- The platform has shown performance of $18.49 compared to S&P 500's $3.30
- Snobol aims to make money better than any human can through AI-driven strategies

Your role is to:
1. Answer questions about Snobol's investment approach and platform
2. Provide helpful information about AI-driven investing
3. Be professional, friendly, and concise
4. If you don't know something specific, be honest about it
5. Guide users to contact hello@snobol.com for detailed inquiries

Keep responses clear and conversational.`;

export async function POST(req: NextRequest) {
  try {
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
      model: "gpt-4o-mini", // Using GPT-4o-mini for cost-effectiveness, you can change to "gpt-4" or "gpt-4-turbo"
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

