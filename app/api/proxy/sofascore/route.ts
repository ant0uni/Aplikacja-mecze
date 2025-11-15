import { NextResponse } from "next/server";

// Proxy route deprecated - use client-side fetching
export async function GET() {
  return NextResponse.json({
    message: "Proxy route deprecated - fetch directly from SofaScore on client",
    note: "SofaScore API is accessible directly from the browser",
    example: "fetch('https://www.sofascore.com/api/v1/sport/football/scheduled-events/2024-11-15')"
  }, { status: 200 });
}
