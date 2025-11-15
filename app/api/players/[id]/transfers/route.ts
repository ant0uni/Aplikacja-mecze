import { NextResponse } from "next/server";

// Client should fetch directly from SofaScore
export async function GET() {
  return NextResponse.json({
    message: "Fetch directly from SofaScore on client",
    endpoint: "https://www.sofascore.com/api/v1/player/{id}/transfers",
    note: "This route is deprecated - use client-side fetching"
  }, { status: 200 });
}
  try {
    const { id } = await params;
    const playerId = id;

    const transfersResponse = await fetchFromSofaScore(
      `/api/v1/player/${playerId}/transfers`
    );

    const transfersData = await transfersResponse.json();

    return NextResponse.json(transfersData, { status: 200 });
  } catch (error) {
    console.error("Player transfers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player transfers" },
      { status: 500 }
    );
  }
}
