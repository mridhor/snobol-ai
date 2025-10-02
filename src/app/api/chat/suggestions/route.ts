import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt for generating suggestions
const SUGGESTION_PROMPT = `You are a helpful assistant that generates follow-up questions for Snobol AI, a contrarian investing chatbot.

**Snobol's Philosophy:**
Snobol is NOT value investing. Snobol is contrarian and opportunistic.
- We invest where fear dominates
- We're open to ALL asset types
- We look for opportunities when others panic

Given a conversation, generate exactly 3 relevant follow-up questions that:
1. Build on the conversation naturally
2. Are concise (max 10 words each)
3. Focus on contrarian/opportunistic thinking
4. Are phrased as user questions (first person)
5. Are beginner-friendly but curious

**Question Style:**
✅ Good: "Is this panic overdone?"
✅ Good: "What's the crowd missing here?"
✅ Good: "Where's the fear greatest right now?"
❌ Bad: "What's the company's EBITDA margin?"
❌ Bad: "Should I use dollar-cost averaging?"

**For Stock/Company Discussions:**
- NEVER suggest technical analysis (charts, RSI, moving averages, patterns, etc.)
- ALWAYS focus on contrarian angles:
  * "Is the market overreacting?"
  * "What's the fear vs reality here?"
  * "Is everyone selling? Why?"
  * "What's the worst that could happen?"
  * "Is this panic justified?"
- Focus on business reality, not financial metrics
- Keep it simple and opportunistic

**Rules:**
- Short, punchy questions (max 10 words)
- Contrarian perspective
- Plain English, no jargon
- Progressive difficulty (easy → medium → challenging)
- Stay in finance/investing domain

Format: Return ONLY a JSON array of 3 strings, nothing else.
Example: ["Is this fear justified?", "What's the real risk here?", "Where are others panicking?"]`;

export async function POST(req: NextRequest) {
  try {
    const { userMessage, assistantMessage } = await req.json();

    // Validate input
    if (!userMessage || !assistantMessage) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Call OpenAI API to generate suggestions
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: SUGGESTION_PROMPT },
        { 
          role: "user", 
          content: `User asked: "${userMessage}"\n\nSnobol AI responded: "${assistantMessage}"\n\nGenerate 3 relevant follow-up questions:` 
        }
      ],
      temperature: 1, // Slightly creative but focused
      max_completion_tokens: 200, // Enough for 3 short questions
    });

    console.log("OpenAI completion response:", JSON.stringify(completion, null, 2));

    const suggestionsText = completion.choices[0]?.message?.content;

    if (!suggestionsText) {
      console.error("No suggestions generated");
      console.error("Completion object:", completion);
      console.error("Choices array:", completion.choices);
      console.error("First choice:", completion.choices[0]);
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
        { status: 500 }
      );
    }

    // Clean up the response text (remove markdown code blocks if present)
    let cleanedText = suggestionsText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    
    // Parse the JSON response
    try {
      const suggestions = JSON.parse(cleanedText);
      
      // Validate it's an array
      if (!Array.isArray(suggestions)) {
        console.error("Parsed value is not an array:", typeof suggestions, suggestions);
        throw new Error("Not an array");
      }
      
      // Validate array contains strings
      const validSuggestions = suggestions.filter(s => typeof s === 'string' && s.trim().length > 0);
      
      if (validSuggestions.length === 0) {
        console.error("No valid string suggestions found:", suggestions);
        throw new Error("No valid strings");
      }

      // If we got exactly 3 suggestions, return them
      if (validSuggestions.length === 3) {
        return NextResponse.json({ suggestions: validSuggestions });
      }

      // If we got fewer or more, try to fix it
      console.warn(`Got ${validSuggestions.length} suggestions instead of 3, padding with defaults`);
      
      // Take up to 3 suggestions, pad if needed
      const paddedSuggestions = validSuggestions.slice(0, 3);
      
      // Pad with contrarian defaults if needed
      const defaults = [
        "Where is fear greatest right now?",
        "Is this panic overdone?",
        "What's the crowd missing?"
      ];
      
      while (paddedSuggestions.length < 3) {
        paddedSuggestions.push(defaults[paddedSuggestions.length]);
      }
      
      return NextResponse.json({ suggestions: paddedSuggestions });
    } catch (parseError) {
      console.error("Failed to parse suggestions:", parseError);
      console.error("Raw response:", suggestionsText);
      console.error("Cleaned text:", cleanedText);
      
      // Fallback: try to extract questions manually
      const lines = suggestionsText.split('\n').filter(line => line.trim());
      const questions = lines
        .map(line => line.replace(/^[\d\-\*\.]+\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0 && line.includes('?'))
        .slice(0, 3);

      // Pad with defaults if we got fewer than 3
      const defaults = [
        "Where is fear greatest right now?",
        "Is this panic overdone?",
        "What's the crowd missing?"
      ];
      
      while (questions.length < 3) {
        questions.push(defaults[questions.length]);
      }

      return NextResponse.json({ suggestions: questions });
    }
  } catch (error: unknown) {
    console.error("Suggestions API Error:", error);
    
    // Return fallback suggestions on error (contrarian focused)
    return NextResponse.json({
      suggestions: [
        "Where is fear greatest right now?",
        "Is this panic overdone?",
        "What's the crowd missing?"
      ]
    });
  }
}

