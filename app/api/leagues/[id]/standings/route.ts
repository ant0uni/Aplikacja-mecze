import { NextResponse } from "next/server";

// Client should fetch directly from SofaScore
export async function GET() {
  return NextResponse.json({
    message: "Fetch directly from SofaScore on client",
    endpoint: "https://www.sofascore.com/api/v1/unique-tournament/{id}/season/{seasonId}/standings/total",
    note: "This route is deprecated - use client-side fetching"
  }, { status: 200 });
}
  try {
    const { id } = await params;
    const leagueId = id;
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    if (!seasonId) {
      // Fetch current season first
      const seasonsResponse = await fetchFromSofaScore(
        `/api/v1/unique-tournament/${leagueId}/seasons`
      );
      
      const seasonsData = await seasonsResponse.json();
      
      if (!seasonsData.seasons || seasonsData.seasons.length === 0) {
        return NextResponse.json(
          { error: "No seasons found for this league" },
          { status: 404 }
        );
      }
      
      const currentSeason = seasonsData.seasons[0];
      
      // Fetch standings for current season
      const standingsResponse = await fetchFromSofaScore(
        `/api/v1/unique-tournament/${leagueId}/season/${currentSeason.id}/standings/total`
      );

      const standingsData = await standingsResponse.json();

      return NextResponse.json({
        standings: standingsData.standings,
        season: currentSeason
      }, { status: 200 });
    }

    // Fetch standings for specific season
    const standingsResponse = await fetchFromSofaScore(
      `/api/v1/unique-tournament/${leagueId}/season/${seasonId}/standings/total`
    );

    const standingsData = await standingsResponse.json();

    return NextResponse.json({
      standings: standingsData.standings
    }, { status: 200 });
  } catch (error) {
    console.error("Standings fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
