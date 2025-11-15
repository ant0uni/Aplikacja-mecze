import { NextResponse } from "next/server";

// Test route for SofaScore API - now client-side
export async function GET() {
  return NextResponse.json({
    message: "SofaScore API testing should be done client-side",
    instructions: "Use browser DevTools Network tab to test SofaScore endpoints",
    endpoints: [
      "https://www.sofascore.com/api/v1/sport/football/scheduled-events/{date}",
      "https://www.sofascore.com/api/v1/unique-tournament/{id}/seasons",
      "https://www.sofascore.com/api/v1/event/{id}"
    ]
  }, { status: 200 });
}
