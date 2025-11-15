import { NextResponse } from "next/server";

// Client should fetch directly from SofaScore
export async function GET() {
  return NextResponse.json({
    message: "Fetch directly from SofaScore on client",
    endpoint: "https://www.sofascore.com/api/v1/team/{id}/statistics",
    note: "This route is deprecated - use client-side fetching"
  }, { status: 200 });
}
  try {
    const { id } = await params;
    const teamId = id;

    // Fetch team statistics
    const statsResponse = await fetchFromSofaScore(
      `/api/v1/team/${teamId}/statistics`
    );

    const statsData = await statsResponse.json();

    return NextResponse.json(statsData, { status: 200 });
  } catch (error) {
    console.error("Team statistics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team statistics" },
      { status: 500 }
    );
  }
}
