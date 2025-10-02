import { NextRequest, NextResponse } from "next/server";
import { updateContent } from "../../lib/content";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, elementId, content } = body;

    // Update content in the content management system
    const updatedContent = updateContent(
      elementId, 
      html, 
      "admin" // TODO: Get actual user ID from authentication
    );

    console.log("Content updated:", {
      id: elementId,
      content: html,
      updatedAt: updatedContent.updatedAt,
      updatedBy: updatedContent.updatedBy
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Content saved successfully",
        content: updatedContent,
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
