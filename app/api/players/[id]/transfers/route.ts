import { NextRequest, NextResponse } from "next/server";
import { fetchFromSofaScore } from "@/lib/sofascore-proxy";

// Get player transfer history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
