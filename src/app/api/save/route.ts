import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, elementId, content } = body;

    // Log the saved content for now
    console.log("Saved content:", {
      html,
      elementId,
      content,
      timestamp: new Date().toISOString(),
    });

    // TODO: Save to Supabase or other database
    // For now, just return success

    return NextResponse.json(
      { 
        success: true, 
        message: "Content saved successfully",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to save content" 
      },
      { status: 500 }
    );
  }
}
