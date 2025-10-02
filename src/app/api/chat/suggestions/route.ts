import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt for generating suggestions
const SUGGESTION_PROMPT = `You are a helpful assistant that generates follow-up questions for a financial advice chatbot.

Given a conversation between a user and Snobol AI (a financial/investment advisor), generate exactly 3 relevant follow-up questions that:
1. Build naturally on the conversation topic
2. Help the user dive deeper into related concepts
3. Are specific, actionable, and within Snobol AI's domain (finance, investing, crisis investing, risk management)
4. Are phrased as questions the user would ask (first person perspective)
5. Are concise (max 12 words each)

Rules:
- Questions must be relevant to the last exchange
- Avoid repeating what was already discussed
- Focus on practical, beginner-friendly questions
- Stay within finance/investing topics only
- Make questions progressively helpful (easy to more advanced)

Format: Return ONLY a JSON array of 3 strings, nothing else.
Example: ["How much should I invest monthly?", "What are index funds?", "When should I sell stocks?"]`;

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
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: SUGGESTION_PROMPT },
        { 
          role: "user", 
          content: `User asked: "${userMessage}"\n\nSnobol AI responded: "${assistantMessage}"\n\nGenerate 3 relevant follow-up questions:` 
        }
      ],
      temperature: 1, // Slightly creative but focused
      max_completion_tokens: 150, // Enough for 3 short questions
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

    // Parse the JSON response
    try {
      const suggestions = JSON.parse(suggestionsText);
      
      // Validate it's an array of 3 strings
      if (!Array.isArray(suggestions) || suggestions.length !== 3) {
        throw new Error("Invalid format");
      }

      return NextResponse.json({ suggestions });
    } catch (parseError) {
      console.error("Failed to parse suggestions:", parseError);
      console.error("Raw response:", suggestionsText);
      
      // Fallback: try to extract questions manually
      const lines = suggestionsText.split('\n').filter(line => line.trim());
      const questions = lines
        .map(line => line.replace(/^[\d\-\*\.]+\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0 && line.includes('?'))
        .slice(0, 3);

      if (questions.length === 3) {
        return NextResponse.json({ suggestions: questions });
      }

      // Final fallback to default suggestions
      return NextResponse.json({
        suggestions: [
          "How should beginners start investing?",
          "What are the key risks to consider?",
          "Can you explain more about this topic?"
        ]
      });
    }
  } catch (error: unknown) {
    console.error("Suggestions API Error:", error);
    const err = error as { message?: string };
    
    // Return fallback suggestions on error
    return NextResponse.json({
      suggestions: [
        "How should beginners start investing?",
        "What are the key risks to consider?",
        "Can you explain more about this topic?"
      ]
    });
  }
}

