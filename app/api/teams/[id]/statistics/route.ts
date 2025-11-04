import { NextRequest, NextResponse } from "next/server";
import { fetchFromSofaScore } from "@/lib/sofascore-proxy";

// Get team statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
