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
    
    // Search by name using filters parameter
    const search = searchParams.get("search");
    if (search) {
      // Use the correct filter syntax for API v3
      params.append("filters", `teamSearch:${search}`);
    }
    
    // Includes
    const includes = searchParams.get("includes") || "country";
    params.append("include", includes);
    
    // Pagination
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("perPage") || "50";
    params.append("page", page);
    params.append("per_page", perPage);

    const url = `${SPORTMONKS_API_BASE}/teams?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API error:", response.status, errorText);
      throw new Error(`Failed to fetch teams: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(
      {
        teams: data.data || [],
        pagination: data.pagination || null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Teams API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
