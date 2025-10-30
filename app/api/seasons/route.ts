import { NextRequest, NextResponse } from "next/server";
import { fetchFromSofaScore } from "@/lib/sofascore-proxy";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("id") || "23"; // Default to Premier League
    
    console.log("Fetching seasons from SofaScore for tournament:", tournamentId);

    const response = await fetchFromSofaScore(`/unique-tournament/${tournamentId}/seasons`);
    const data = await response.json();

    console.log("SofaScore seasons response:", {
      seasonsCount: data.seasons?.length || 0,
    });

    return NextResponse.json(
      {
        seasons: data.seasons || [],
        tournament: tournamentId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Seasons API error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch seasons",
        seasons: [],
      },
      { status: 200 }
    );
  }
}
