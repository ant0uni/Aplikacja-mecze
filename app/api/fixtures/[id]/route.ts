import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fixtures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: fixtureId } = await params;

  console.log("Fixture detail API called with ID:", fixtureId);
  console.log("Params:", { id: fixtureId });

  if (!fixtureId || fixtureId === "undefined") {
    console.error("Invalid fixture ID received:", fixtureId);
    return NextResponse.json(
      { error: "Fixture ID is required" },
      { status: 400 }
    );
  }

  try {
    const numericId = parseInt(fixtureId);
    if (isNaN(numericId)) {
      console.error("Fixture ID is not a number:", fixtureId);
      return NextResponse.json(
        { error: "Invalid fixture ID format" },
        { status: 400 }
      );
    }

    console.log("Looking up fixture in DB with API ID:", numericId);

    // First, try to get from database
    const cachedFixture = await db
      .select()
      .from(fixtures)
      .where(eq(fixtures.apiId, numericId))
      .limit(1);

    console.log("DB query result:", cachedFixture.length > 0 ? "Found" : "Not found");

    if (cachedFixture.length > 0) {
      const fixture = cachedFixture[0];
      
      // Transform to match expected format
      const transformed = {
        id: fixture.apiId,
        name: fixture.name,
        starting_at: fixture.startingAt.toISOString(),
        state: fixture.stateName || "Unknown",
        state_id: fixture.stateId,
        home_team: {
          id: fixture.homeTeamId,
          name: fixture.homeTeamName,
          logo: fixture.homeTeamLogo,
          score: fixture.homeScore,
        },
        away_team: {
          id: fixture.awayTeamId,
          name: fixture.awayTeamName,
          logo: fixture.awayTeamLogo,
          score: fixture.awayScore,
        },
        league: {
          id: fixture.leagueId,
          name: fixture.leagueName,
          logo: null,
        },
        venue: {
          id: fixture.venueId,
          name: fixture.venueName,
          city: null,
        },
        statistics: [],
        events: [],
        lineups: [],
      };

      return NextResponse.json({ fixture: transformed }, { status: 200 });
    }

    // If not in DB, fetch from API
    const apiToken = process.env.SPORTMONKS_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: "API token not configured" },
        { status: 500 }
      );
    }
    // Fetch fixture details from SportMonks API with all includes
    // Note: Use 'participant' (singular) not 'participants'
    const includes = [
      "participant",
      "league",
      "state",
      "venue",
      "round",
      "stage"
    ].join(",");

    const url = `https://api.sportmonks.com/v3/football/fixtures/${numericId}?api_token=${apiToken}&include=${includes}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API error:", response.status, errorText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Match not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch fixture from API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform and cache the data
    const fixture = data.data;
    const participants = fixture.participant || [];
    const homeTeam = participants.find((p: any) => p.meta?.location === "home");
    const awayTeam = participants.find((p: any) => p.meta?.location === "away");
    const scores = fixture.scores || [];
    const ftScore = scores.find((s: any) => s.description === "CURRENT") || scores[0];

    // Cache in database
    const fixtureData = {
      apiId: fixture.id,
      sportId: fixture.sport_id,
      leagueId: fixture.league_id,
      leagueName: fixture.league?.name || null,
      seasonId: fixture.season_id,
      name: fixture.name,
      homeTeamId: homeTeam?.id || null,
      homeTeamName: homeTeam?.name || null,
      homeTeamLogo: homeTeam?.image_path || null,
      awayTeamId: awayTeam?.id || null,
      awayTeamName: awayTeam?.name || null,
      awayTeamLogo: awayTeam?.image_path || null,
      startingAt: new Date(fixture.starting_at),
      resultInfo: fixture.result_info || null,
      stateId: fixture.state_id,
      stateName: fixture.state?.name || null,
      homeScore: ftScore?.score?.goals?.home || null,
      awayScore: ftScore?.score?.goals?.away || null,
      venueId: fixture.venue?.id || null,
      venueName: fixture.venue?.name || null,
      hasOdds: fixture.has_odds || false,
      updatedAt: new Date(),
    };

    try {
      const existing = await db
        .select()
        .from(fixtures)
        .where(eq(fixtures.apiId, fixture.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(fixtures)
          .set(fixtureData)
          .where(eq(fixtures.apiId, fixture.id));
      } else {
        await db.insert(fixtures).values(fixtureData);
      }
    } catch (dbError) {
      console.error("Error caching fixture:", dbError);
    }

    const transformed = {
      id: fixture.id,
      name: fixture.name,
      starting_at: fixture.starting_at,
      state: fixture.state?.name || "Unknown",
      state_id: fixture.state_id,
      home_team: {
        id: homeTeam?.id,
        name: homeTeam?.name,
        logo: homeTeam?.image_path,
        score: ftScore?.score?.goals?.home || null,
      },
      away_team: {
        id: awayTeam?.id,
        name: awayTeam?.name,
        logo: awayTeam?.image_path,
        score: ftScore?.score?.goals?.away || null,
      },
      league: {
        id: fixture.league?.id,
        name: fixture.league?.name,
        logo: fixture.league?.image_path,
      },
      venue: {
        id: fixture.venue?.id,
        name: fixture.venue?.name,
        city: fixture.venue?.city_name,
      },
      // These may not be available on free plans
      statistics: [],
      events: [],
      lineups: [],
    };

    return NextResponse.json({ fixture: transformed }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch fixture error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
