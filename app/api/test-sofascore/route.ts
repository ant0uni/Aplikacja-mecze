import { NextRequest, NextResponse } from "next/server";
import { fetchFromSofaScore } from "@/lib/sofascore-proxy";

export async function GET(request: NextRequest) {
  const tests: any[] = [];
  
  // Test 1: Fetch today's fixtures
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetchFromSofaScore(`/sport/football/scheduled-events/${today}`);
    const data = await response.json();
    tests.push({
      name: "Today's Fixtures",
      status: "✅ SUCCESS",
      eventsCount: data.events?.length || 0,
      url: `/sport/football/scheduled-events/${today}`,
    });
  } catch (error: any) {
    tests.push({
      name: "Today's Fixtures",
      status: "❌ FAILED",
      error: error.message,
      url: `/sport/football/scheduled-events/${new Date().toISOString().split('T')[0]}`,
    });
  }

  // Test 2: Fetch Premier League seasons
  try {
    const response = await fetchFromSofaScore(`/unique-tournament/23/seasons`);
    const data = await response.json();
    tests.push({
      name: "Premier League Seasons",
      status: "✅ SUCCESS",
      seasonsCount: data.seasons?.length || 0,
      url: `/unique-tournament/23/seasons`,
    });
  } catch (error: any) {
    tests.push({
      name: "Premier League Seasons",
      status: "❌ FAILED",
      error: error.message,
      url: `/unique-tournament/23/seasons`,
    });
  }

  const allPassed = tests.every(test => test.status.includes("SUCCESS"));

  return NextResponse.json(
    {
      overall: allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED",
      timestamp: new Date().toISOString(),
      tests,
    },
    { status: 200 }
  );
}
