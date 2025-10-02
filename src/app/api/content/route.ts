import { NextResponse } from "next/server";
import { getAllContent } from "../../lib/content";

export async function GET() {
  try {
    const content = getAllContent();
    
    return NextResponse.json({
      success: true,
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch content" 
      },
      { status: 500 }
    );
  }
}
