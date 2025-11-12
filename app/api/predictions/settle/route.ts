import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, users, fixtures } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all unsettled predictions for the current user
    const unsettledPredictions = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, currentUser.userId),
          eq(predictions.isSettled, false)
        )
      );

    let settledCount = 0;
    let totalCoinsWon = 0;
    const results = [];

    for (const prediction of unsettledPredictions) {
      try {
        // Skip if no fixtureApiId
        if (!prediction.fixtureApiId) {
          console.log(`Prediction ${prediction.id} has no fixtureApiId, skipping`);
          continue;
        }

        // Fetch match data from SofaScore
        const response = await fetch(
          `https://www.sofascore.com/api/v1/event/${prediction.fixtureApiId}`
        );

        if (!response.ok) {
          console.log(`Could not fetch data for match ${prediction.fixtureApiId}`);
          continue;
        }

        const data = await response.json();
        const event = data.event;

        const homeScore = event.homeScore?.current ?? event.homeScore?.display ?? null;
        const awayScore = event.awayScore?.current ?? event.awayScore?.display ?? null;
        const statusCode = event.status?.code;
        const status = event.status?.description || event.status?.type || "Unknown";
        
        // Get team data (logo might be in different formats from SofaScore)
        const homeTeamLogo = event.homeTeam?.logo || 
                           (event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null);
        const awayTeamLogo = event.awayTeam?.logo || 
                           (event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null);
        
        // Only settle if match has finished (status code 100 = finished)
        const isFinished = statusCode === 100;

        // Only settle if match is finished and has scores
        if (!isFinished || homeScore === null || awayScore === null) {
          continue;
        }

        // Update fixture in database with final scores and team data
        await db
          .update(fixtures)
          .set({
            homeScore,
            awayScore,
            stateName: status,
            stateId: statusCode,
            homeTeamId: event.homeTeam?.id,
            homeTeamName: event.homeTeam?.name,
            homeTeamLogo: homeTeamLogo,
            awayTeamId: event.awayTeam?.id,
            awayTeamName: event.awayTeam?.name,
            awayTeamLogo: awayTeamLogo,
            leagueId: event.tournament?.uniqueTournament?.id,
            leagueName: event.tournament?.uniqueTournament?.name,
            updatedAt: new Date(),
          })
          .where(eq(fixtures.apiId, prediction.fixtureApiId));

        // Check if prediction was correct
        const isExactMatch =
          prediction.predictedHomeScore === homeScore &&
          prediction.predictedAwayScore === awayScore;

        let coinsWon = 0;
        let verdict = "lose";

        if (isExactMatch) {
          // Exact score match - user wins 2x their wager
          coinsWon = prediction.coinsWagered * 2;
          verdict = "win";
          totalCoinsWon += coinsWon;
        }

        // Update prediction in database
        await db
          .update(predictions)
          .set({
            coinsWon,
            verdict,
            isSettled: true,
            updatedAt: new Date(),
          })
          .where(eq(predictions.id, prediction.id));

        // Award coins to user if they won
        if (coinsWon > 0) {
          await db
            .update(users)
            .set({
              coins: sql`${users.coins} + ${coinsWon}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, currentUser.userId));
        }

        settledCount++;
        results.push({
          predictionId: prediction.id,
          fixtureApiId: prediction.fixtureApiId,
          predicted: `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}`,
          actual: `${homeScore} - ${awayScore}`,
          verdict,
          coinsWon,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to settle prediction ${prediction.id}:`, error);
        // Continue with next prediction
      }
    }

    return NextResponse.json(
      {
        message: `Settled ${settledCount} predictions`,
        settledCount,
        totalCoinsWon,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Settle predictions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
