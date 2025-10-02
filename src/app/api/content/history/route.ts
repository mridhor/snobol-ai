import { NextRequest, NextResponse } from "next/server";
import { 
  getAllContentHistory, 
  getContentHistory, 
  getRecentChanges,
  getChangesByUser,
  getContentStats 
} from "../../../../lib/contentHistory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const user = searchParams.get('user');
    const recent = searchParams.get('recent');
    const stats = searchParams.get('stats');

    let data;

    if (stats === 'true') {
      data = getContentStats();
    } else if (contentId) {
      data = getContentHistory(contentId);
    } else if (user) {
      data = getChangesByUser(user);
    } else if (recent) {
      const limit = parseInt(recent) || 10;
      data = getRecentChanges(limit);
    } else {
      data = getAllContentHistory();
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching content history:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch content history" 
      },
      { status: 500 }
    );
  }
}
