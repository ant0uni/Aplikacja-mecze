import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fixtures } from "@/db/schema";
import { eq } from "drizzle-orm";

const SOFASCORE_API_BASE = "https://www.sofascore.com/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get date parameter (defaults to today)
    const dateParam = searchParams.get("dateFrom") || new Date().toISOString().split('T')[0];
    
    // Build SofaScore API URL - uses date format: YYYY-MM-DD
    const url = `${SOFASCORE_API_BASE}/sport/football/scheduled-events/${dateParam}`;
    
    console.log("Fetching fixtures from SofaScore:", url);

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SofaScore API error:", response.status, errorText);
      
      return NextResponse.json(
        { 
          error: "Failed to fetch fixtures from SofaScore API", 
          details: errorText, 
          status: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log("SofaScore response:", {
      eventsCount: data.events?.length || 0,
      hasData: !!data.events,
    });

    // Get client-side filters
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const leagueIds = searchParams.get("leagueIds")?.split(",").map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
    const sortBy = searchParams.get("sortBy") || "starting_at";
    const order = searchParams.get("order") || "asc";

    // Cache fixtures in database
    let fixturesData = data.events || [];
    
    // Apply date range filter if specified
    if (dateTo) {
      fixturesData = fixturesData.filter((f: any) => {
        const fixtureDate = new Date(f.startTimestamp * 1000).toISOString().split('T')[0];
        return fixtureDate <= dateTo;
      });
    }
    
    // Apply league filter if specified (using tournament.uniqueTournament.id from SofaScore)
    if (leagueIds.length > 0) {
      fixturesData = fixturesData.filter((f: any) => 
        leagueIds.includes(f.tournament?.uniqueTournament?.id)
      );
    }
    
    const cachedFixtures = [];

    for (const fixture of fixturesData) {
      // Extract data from SofaScore response structure
      const homeTeam = fixture.homeTeam;
      const awayTeam = fixture.awayTeam;
      const homeScore = fixture.homeScore;
      const awayScore = fixture.awayScore;
      const tournament = fixture.tournament;
      
      // Prepare fixture data for DB (declare outside try for error handling)
      const fixtureData = {
        apiId: fixture.id,
        sportId: 1, // Football
        leagueId: tournament?.uniqueTournament?.id || tournament?.id || null,
        leagueName: tournament?.uniqueTournament?.name || tournament?.name || null,
        seasonId: fixture.season?.id || null,
        name: `${homeTeam?.name || 'Home'} - ${awayTeam?.name || 'Away'}`,
        homeTeamId: homeTeam?.id || null,
        homeTeamName: homeTeam?.name || null,
        homeTeamLogo: homeTeam?.teamColors ? `https://img.sofascore.com/api/v1/team/${homeTeam.id}/image` : null,
        awayTeamId: awayTeam?.id || null,
        awayTeamName: awayTeam?.name || null,
        awayTeamLogo: awayTeam?.teamColors ? `https://img.sofascore.com/api/v1/team/${awayTeam.id}/image` : null,
        startingAt: new Date(fixture.startTimestamp * 1000),
        resultInfo: fixture.slug || null,
        stateId: fixture.status?.code || 0,
        stateName: fixture.status?.description || fixture.status?.type || null,
        homeScore: homeScore?.current ?? homeScore?.display ?? null,
        awayScore: awayScore?.current ?? awayScore?.display ?? null,
        venueId: null,
        venueName: null,
        hasOdds: false,
        updatedAt: new Date(),
      };
      
      try {
        const existing = await db
          .select()
          .from(fixtures)
          .where(eq(fixtures.apiId, fixture.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing fixture
          await db
            .update(fixtures)
            .set(fixtureData)
            .where(eq(fixtures.apiId, fixture.id));
          
          cachedFixtures.push({ 
            id: existing[0].id,
            api_id: fixture.id,
            name: fixtureData.name,
            starting_at: new Date(fixture.startTimestamp * 1000).toISOString(),
            result_info: fixtureData.resultInfo,
            state_id: fixtureData.stateId,
            state_name: fixtureData.stateName,
            home_team_id: homeTeam?.id || null,
            home_team_name: homeTeam?.name || null,
            home_team_logo: fixtureData.homeTeamLogo,
            away_team_id: awayTeam?.id || null,
            away_team_name: awayTeam?.name || null,
            away_team_logo: fixtureData.awayTeamLogo,
            home_score: fixtureData.homeScore,
            away_score: fixtureData.awayScore,
            league_id: fixtureData.leagueId,
            league_name: fixtureData.leagueName,
            venue_id: null,
            venue_name: null,
          });
        } else {
          // Insert new fixture
          const [newFixture] = await db
            .insert(fixtures)
            .values(fixtureData)
            .returning();
          
          cachedFixtures.push({
            id: newFixture.id,
            api_id: fixture.id,
            name: fixtureData.name,
            starting_at: new Date(fixture.startTimestamp * 1000).toISOString(),
            result_info: fixtureData.resultInfo,
            state_id: fixtureData.stateId,
            state_name: fixtureData.stateName,
            home_team_id: homeTeam?.id || null,
            home_team_name: homeTeam?.name || null,
            home_team_logo: fixtureData.homeTeamLogo,
            away_team_id: awayTeam?.id || null,
            away_team_name: awayTeam?.name || null,
            away_team_logo: fixtureData.awayTeamLogo,
            home_score: fixtureData.homeScore,
            away_score: fixtureData.awayScore,
            league_id: fixtureData.leagueId,
            league_name: fixtureData.leagueName,
            venue_id: null,
            venue_name: null,
          });
        }
      } catch (dbError) {
        console.error("Error caching fixture:", fixture.id, dbError);
        // If DB fails, still return data from API
        cachedFixtures.push({
          id: fixture.id,
          api_id: fixture.id,
          name: fixtureData.name,
          starting_at: new Date(fixture.startTimestamp * 1000).toISOString(),
          result_info: fixtureData.resultInfo,
          state_id: fixtureData.stateId,
          state_name: fixtureData.stateName,
          home_team_id: homeTeam?.id || null,
          home_team_name: homeTeam?.name || null,
          home_team_logo: fixtureData.homeTeamLogo,
          away_team_id: awayTeam?.id || null,
          away_team_name: awayTeam?.name || null,
          away_team_logo: fixtureData.awayTeamLogo,
          home_score: fixtureData.homeScore,
          away_score: fixtureData.awayScore,
          league_id: fixtureData.leagueId,
          league_name: fixtureData.leagueName,
          venue_id: null,
          venue_name: null,
        });
      }
    }

    console.log("Cached fixtures:", cachedFixtures.length);
    console.log("Sample fixture (first):", JSON.stringify(cachedFixtures[0], null, 2));

    // Validate all fixtures have api_id
    const invalidFixtures = cachedFixtures.filter(f => !f.api_id);
    if (invalidFixtures.length > 0) {
      console.error("WARNING: Some fixtures missing api_id:", invalidFixtures.length);
      console.error("First invalid fixture:", invalidFixtures[0]);
    }

    // Apply sorting
    cachedFixtures.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      // Handle date sorting
      if (sortBy === "starting_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (order === "desc") {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return NextResponse.json(
      {
        fixtures: cachedFixtures,
        count: cachedFixtures.length,
        date: dateParam,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fixtures API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch fixtures" },
      { status: 500 }
    );
  }
}
