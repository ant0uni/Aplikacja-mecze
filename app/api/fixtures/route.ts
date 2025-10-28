import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fixtures } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    
    // For FREE PLAN: Use livescores endpoint (shows fixtures from 15 min before start to 15 min after finish)
    // Start with NO includes to avoid errors - base data should have most info we need
    const url = `${SPORTMONKS_API_BASE}/livescores?api_token=${API_TOKEN}`;
    
    console.log("Fetching fixtures from livescores endpoint:", url.replace(API_TOKEN, "***"));

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute (livescores change frequently)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API error:", response.status, errorText);
      console.error("Request URL:", url.replace(API_TOKEN, "***"));
      
      return NextResponse.json(
        { 
          error: "Failed to fetch fixtures from SportMonks API", 
          details: errorText, 
          status: response.status,
          suggestion: "Check your API token and subscription plan at sportmonks.com"
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    console.log("SportMonks response:", {
      fixturesCount: data.data?.length || 0,
      hasData: !!data.data,
      subscription: data.subscription,
    });

    // Get client-side filters
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const leagueIds = searchParams.get("leagueIds")?.split(",").map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
    const sortBy = searchParams.get("sortBy") || "starting_at";
    const order = searchParams.get("order") || "asc";

    // Cache fixtures in database
    let fixturesData = data.data || [];
    
    // Apply date range filter if specified (client-side since livescores doesn't support date params)
    if (dateFrom || dateTo) {
      fixturesData = fixturesData.filter((f: any) => {
        const fixtureDate = new Date(f.starting_at);
        if (dateFrom && fixtureDate < new Date(dateFrom)) return false;
        if (dateTo && fixtureDate > new Date(dateTo + 'T23:59:59')) return false;
        return true;
      });
    }
    
    // Apply league filter if specified
    if (leagueIds.length > 0) {
      fixturesData = fixturesData.filter((f: any) => leagueIds.includes(f.league_id));
    }
    
    const cachedFixtures = [];

    for (const fixture of fixturesData) {
      // Base fixture data without includes
      // Teams and scores are in the base response
      const participants = fixture.participants || [];
      const homeTeam = participants.find((p: any) => p.meta?.location === "home");
      const awayTeam = participants.find((p: any) => p.meta?.location === "away");
      
      // Scores are in the base fixture data
      const scores = fixture.scores || [];
      const currentScore = scores.find((s: any) => s.description === "CURRENT") || scores[0];
      
      try {
        // Prepare fixture data for DB
        const fixtureData = {
          apiId: fixture.id,
          sportId: fixture.sport_id,
          leagueId: fixture.league_id,
          leagueName: fixture.league?.name || null,  // May be null without include
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
          stateName: fixture.state?.name || null,  // May be null without include
          homeScore: currentScore?.score?.goals?.home || null,
          awayScore: currentScore?.score?.goals?.away || null,
          venueId: fixture.venue_id || null,
          venueName: fixture.venue?.name || null,  // May be null without include
          hasOdds: fixture.has_odds || false,
          updatedAt: new Date(),
        };

        // Check if fixture exists
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
            name: fixture.name,
            starting_at: fixture.starting_at,
            result_info: fixture.result_info || null,
            state_id: fixture.state_id,
            state_name: fixture.state?.name || null,
            home_team_id: homeTeam?.id || null,
            home_team_name: homeTeam?.name || null,
            home_team_logo: homeTeam?.image_path || null,
            away_team_id: awayTeam?.id || null,
            away_team_name: awayTeam?.name || null,
            away_team_logo: awayTeam?.image_path || null,
            home_score: currentScore?.score?.goals?.home || null,
            away_score: currentScore?.score?.goals?.away || null,
            league_id: fixture.league_id,
            league_name: fixture.league?.name || null,
            venue_id: fixture.venue_id || null,
            venue_name: fixture.venue?.name || null,
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
            name: fixture.name,
            starting_at: fixture.starting_at,
            result_info: fixture.result_info || null,
            state_id: fixture.state_id,
            state_name: fixture.state?.name || null,
            home_team_id: homeTeam?.id || null,
            home_team_name: homeTeam?.name || null,
            home_team_logo: homeTeam?.image_path || null,
            away_team_id: awayTeam?.id || null,
            away_team_name: awayTeam?.name || null,
            away_team_logo: awayTeam?.image_path || null,
            home_score: currentScore?.score?.goals?.home || null,
            away_score: currentScore?.score?.goals?.away || null,
            league_id: fixture.league_id,
            league_name: fixture.league?.name || null,
            venue_id: fixture.venue_id || null,
            venue_name: fixture.venue?.name || null,
          });
        }
      } catch (dbError) {
        console.error("Error caching fixture:", fixture.id, dbError);
        // If DB fails, still return data from API (not fake data)
        cachedFixtures.push({
          id: fixture.id,
          api_id: fixture.id,
          name: fixture.name,
          starting_at: fixture.starting_at,
          result_info: fixture.result_info || null,
          state_id: fixture.state_id,
          state_name: fixture.state?.name || null,
          home_team_id: homeTeam?.id || null,
          home_team_name: homeTeam?.name || null,
          home_team_logo: homeTeam?.image_path || null,
          away_team_id: awayTeam?.id || null,
          away_team_name: awayTeam?.name || null,
          away_team_logo: awayTeam?.image_path || null,
          home_score: currentScore?.score?.goals?.home || null,
          away_score: currentScore?.score?.goals?.away || null,
          league_id: fixture.league_id,
          league_name: fixture.league?.name || null,
          venue_id: fixture.venue_id || null,
          venue_name: fixture.venue?.name || null,
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
        pagination: data.pagination || null,
        subscription: data.subscription || null,
        rate_limit: data.rate_limit || null,
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
