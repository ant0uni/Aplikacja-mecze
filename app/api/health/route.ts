import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasApiToken: !!process.env.SPORTMONKS_API_TOKEN,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }
  });
}
