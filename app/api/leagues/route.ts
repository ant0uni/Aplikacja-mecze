import { NextRequest, NextResponse } from "next/server";
import { handleOptions } from "@/lib/cors";

const SPORTMONKS_API_BASE = "https://api.sportmonks.com/v3/football";
const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;

export async function OPTIONS() {
  return handleOptions();
}

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
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API error:", response.status, errorText);
      
      // If API is blocked or token is invalid, return empty array
      if (response.status === 403 || response.status === 401) {
        console.warn("SportMonks API blocked request (403/401), returning empty leagues");
        return NextResponse.json(
          { 
            leagues: [],
            pagination: null,
            warning: "Unable to fetch leagues from external API. Please check API configuration."
          },
          { 
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            }
          }
        );
      }
      
      throw new Error(`Failed to fetch leagues: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(
      {
        leagues: data.data || [],
        pagination: data.pagination || null,
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error: any) {
    console.error("Leagues API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leagues" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}
