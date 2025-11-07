import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, users, fixtures } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { predictionSchema } from "@/lib/validations";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const predictionType = body.predictionType || "match";

    // Get user's current coins
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has enough coins
    if (user.coins < body.coinsWagered) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 }
      );
    }

    if (predictionType === "league") {
      // Handle league prediction
      if (!body.leagueId || !body.predictedWinnerId) {
        return NextResponse.json(
          { error: "League ID and predicted winner ID are required" },
          { status: 400 }
        );
      }

      // Check if user already has a prediction for this league
      const existingPrediction = await db
        .select()
        .from(predictions)
        .where(
          and(
            eq(predictions.userId, currentUser.userId),
            eq(predictions.leagueId, body.leagueId),
            eq(predictions.predictionType, "league")
          )
        )
        .limit(1);

      if (existingPrediction.length > 0) {
        return NextResponse.json(
          { error: "You have already predicted this league winner" },
          { status: 400 }
        );
      }

      // Create league prediction
      const [newPrediction] = await db
        .insert(predictions)
        .values({
          userId: currentUser.userId,
          predictionType: "league",
          leagueId: body.leagueId,
          leagueName: body.leagueName,
          predictedWinnerId: body.predictedWinnerId,
          predictedWinnerName: body.predictedWinnerName,
          predictedWinnerLogo: body.predictedWinnerLogo,
          coinsWagered: body.coinsWagered,
        })
        .returning();

      // Deduct coins from user
      await db
        .update(users)
        .set({
          coins: sql`${users.coins} - ${body.coinsWagered}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.userId));

      return NextResponse.json(
        {
          message: "League prediction created successfully",
          prediction: newPrediction,
        },
        { status: 201 }
      );
    } else {
      // Handle match prediction (existing logic)
      const validatedData = predictionSchema.parse(body);

      // Check if user already has a prediction for this fixture API ID
      const existingPrediction = await db
        .select()
        .from(predictions)
        .where(
          and(
            eq(predictions.userId, currentUser.userId),
            eq(predictions.fixtureApiId, validatedData.fixtureApiId),
            eq(predictions.predictionType, "match")
          )
        )
        .limit(1);

      if (existingPrediction.length > 0) {
        return NextResponse.json(
          { error: "You have already predicted this match" },
          { status: 400 }
        );
      }

      // Get or create fixture in DB (optional, for caching)
      let fixture = await db
        .select()
        .from(fixtures)
        .where(eq(fixtures.apiId, validatedData.fixtureApiId))
        .limit(1)
        .then(res => res[0]);

      let fixtureId = fixture?.id;
      
      // If fixture doesn't exist in our DB, fetch from SofaScore and create entry
      if (!fixtureId) {
        try {
          // Fetch match data from SofaScore to get team names and logos
          const sofascoreResponse = await fetch(
            `https://www.sofascore.com/api/v1/event/${validatedData.fixtureApiId}`
          );
          
          let fixtureData: any = {
            apiId: validatedData.fixtureApiId,
            name: "Match",
            startingAt: new Date(Date.now() + 86400000),
          };

          if (sofascoreResponse.ok) {
            const data = await sofascoreResponse.json();
            const event = data.event;
            
            // Get team logos (SofaScore may not include direct logo URL, construct it from team ID)
            const homeTeamLogo = event.homeTeam?.logo || 
                               (event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null);
            const awayTeamLogo = event.awayTeam?.logo || 
                               (event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null);
            
            fixtureData = {
              apiId: validatedData.fixtureApiId,
              name: `${event.homeTeam?.name || 'Home'} vs ${event.awayTeam?.name || 'Away'}`,
              homeTeamId: event.homeTeam?.id,
              homeTeamName: event.homeTeam?.name,
              homeTeamLogo: homeTeamLogo,
              awayTeamId: event.awayTeam?.id,
              awayTeamName: event.awayTeam?.name,
              awayTeamLogo: awayTeamLogo,
              startingAt: event.startTimestamp 
                ? new Date(event.startTimestamp * 1000)
                : new Date(Date.now() + 86400000),
              stateId: event.status?.code,
              stateName: event.status?.type || event.status?.description,
              leagueId: event.tournament?.uniqueTournament?.id,
              leagueName: event.tournament?.uniqueTournament?.name,
            };
          }

          const [newFixture] = await db
            .insert(fixtures)
            .values(fixtureData)
            .returning();
          fixtureId = newFixture.id;
        } catch (error) {
          console.error("Error fetching fixture data from SofaScore:", error);
          // Fallback to minimal fixture if API call fails
          const [newFixture] = await db
            .insert(fixtures)
            .values({
              apiId: validatedData.fixtureApiId,
              name: "Match",
              startingAt: new Date(Date.now() + 86400000),
            })
            .returning();
          fixtureId = newFixture.id;
        }
      }

      // Create prediction and deduct coins
      const [newPrediction] = await db
        .insert(predictions)
        .values({
          userId: currentUser.userId,
          predictionType: "match",
          fixtureId: fixtureId,
          fixtureApiId: validatedData.fixtureApiId,
          predictedHomeScore: validatedData.predictedHomeScore,
          predictedAwayScore: validatedData.predictedAwayScore,
          coinsWagered: validatedData.coinsWagered,
        })
        .returning();

      // Deduct coins from user
      await db
        .update(users)
        .set({
          coins: sql`${users.coins} - ${validatedData.coinsWagered}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.userId));

      return NextResponse.json(
        {
          message: "Prediction created successfully",
          prediction: newPrediction,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Create prediction error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's predictions
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get predictions with fixture data using a join
    const userPredictions = await db
      .select({
        id: predictions.id,
        userId: predictions.userId,
        predictionType: predictions.predictionType,
        // Match prediction fields
        fixtureId: predictions.fixtureId,
        fixtureApiId: predictions.fixtureApiId,
        predictedHomeScore: predictions.predictedHomeScore,
        predictedAwayScore: predictions.predictedAwayScore,
        // League prediction fields
        leagueId: predictions.leagueId,
        leagueName: predictions.leagueName,
        predictedWinnerId: predictions.predictedWinnerId,
        predictedWinnerName: predictions.predictedWinnerName,
        predictedWinnerLogo: predictions.predictedWinnerLogo,
        // Common fields
        coinsWagered: predictions.coinsWagered,
        coinsWon: predictions.coinsWon,
        verdict: predictions.verdict,
        isSettled: predictions.isSettled,
        createdAt: predictions.createdAt,
        updatedAt: predictions.updatedAt,
        fixture: {
          homeTeamName: fixtures.homeTeamName,
          awayTeamName: fixtures.awayTeamName,
          homeTeamLogo: fixtures.homeTeamLogo,
          awayTeamLogo: fixtures.awayTeamLogo,
          homeScore: fixtures.homeScore,
          awayScore: fixtures.awayScore,
          stateName: fixtures.stateName,
          startingAt: fixtures.startingAt,
        },
      })
      .from(predictions)
      .leftJoin(fixtures, eq(predictions.fixtureId, fixtures.id))
      .where(eq(predictions.userId, currentUser.userId))
      .orderBy(sql`${predictions.createdAt} DESC`);

    return NextResponse.json(
      { predictions: userPredictions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
