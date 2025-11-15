import { NextRequest, NextResponse } from "next/server";

// Simplified route - client should fetch directly from SofaScore
// This route now only provides the endpoint information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("dateFrom") || new Date().toISOString().split('T')[0];
    
    // Return instruction for client-side fetching
    return NextResponse.json({
      message: "Fetch directly from SofaScore on the client",
      endpoint: `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${dateParam}`,
      note: "Use the dashboard's direct fetch pattern"
    }, { status: 200 });
  } catch (error) {
    console.error("Fixtures route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
