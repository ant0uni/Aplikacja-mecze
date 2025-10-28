import { NextRequest, NextResponse } from "next/server";

const SPORTMONKS_API_BASE = "https://api.sportmonks.com/v3/football";
const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

export async function GET(request: NextRequest) {
  try {
    if (!API_TOKEN) {
      return NextResponse.json(
        { error: "API token not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const params = new URLSearchParams();
    params.append("api_token", API_TOKEN);
    
    // Includes - comma-separated
    const includes = searchParams.get("includes") || "country";
    params.append("include", includes);
    
    // Pagination - use per_page
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("perPage") || "100";
    params.append("page", page);
    params.append("per_page", perPage);

    const url = `${SPORTMONKS_API_BASE}/leagues?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API error:", response.status, errorText);
      throw new Error(`Failed to fetch leagues: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(
      {
        leagues: data.data || [],
        pagination: data.pagination || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Leagues API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
