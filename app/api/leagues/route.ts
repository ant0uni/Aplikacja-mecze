import { NextResponse } from "next/server";

// Client should fetch directly from SofaScore
export async function GET() {
  return NextResponse.json({
    message: "Fetch directly from SofaScore on client",
    endpoint: "https://www.sofascore.com/api/v1/...",
    note: "This route is deprecated - use client-side fetching"
  }, { status: 200 });
}
