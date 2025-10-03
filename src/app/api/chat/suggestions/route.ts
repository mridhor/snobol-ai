import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Optimized system prompt for speed
const SUGGESTION_PROMPT = `Generate 3 contrarian follow-up questions for Snobol AI (contrarian investing chatbot).

**Style:** Short, contrarian, max 10 words each. Focus on fear/opportunity.

**Good examples:**
- "Is this panic overdone?"
- "What's the crowd missing?"
- "Where's the fear greatest?"

**Rules:**
- Contrarian perspective
- Plain English, no jargon
- Business reality, not technical analysis, not investor-savvy language
- Return JSON array: ["question1", "question2", "question3"]`;

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

    // Call OpenAI API to generate suggestions - optimized for speed
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano", // Faster model
      messages: [
        { role: "system", content: SUGGESTION_PROMPT },
        { 
          role: "user", 
          content: `User: "${userMessage}"\nAI: "${assistantMessage}"\nGenerate 3 follow-up questions:` 
        }
      ],
      temperature: 0.5, // Even lower temperature for faster, more focused responses
      max_completion_tokens: 100, // Further reduced tokens for faster generation
    });

    // Reduced logging for performance
    console.log("Suggestions generated successfully");

    const suggestionsText = completion.choices[0]?.message?.content;

    if (!suggestionsText) {
      console.error("No suggestions generated");
      // Return fallback suggestions immediately
      return NextResponse.json({
        suggestions: [
          "Where is fear greatest right now?",
          "Is this panic overdone?",
          "What's the crowd missing?"
        ]
      });
    }

    // Clean up the response text (remove markdown code blocks if present)
    let cleanedText = suggestionsText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    
    // Fast JSON parsing with fallback
    try {
      const suggestions = JSON.parse(cleanedText);
      
      if (Array.isArray(suggestions) && suggestions.length >= 1) {
        // Take first 3 valid suggestions
        const validSuggestions = suggestions
          .filter(s => typeof s === 'string' && s.trim().length > 0)
          .slice(0, 3);
        
        // Pad with defaults if needed
        const defaults = [
          "Where is fear greatest right now?",
          "Is this panic overdone?", 
          "What's the crowd missing?"
        ];
        
        while (validSuggestions.length < 3) {
          validSuggestions.push(defaults[validSuggestions.length]);
        }
        
        return NextResponse.json({ suggestions: validSuggestions });
      }
    } catch {
      console.warn("JSON parse failed, using fallback");
    }
    
    // Fast fallback - return defaults immediately
    return NextResponse.json({
      suggestions: [
        "Where is fear greatest right now?",
        "Is this panic overdone?",
        "What's the crowd missing?"
      ]
    });
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

