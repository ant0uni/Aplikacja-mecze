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
    const validatedData = predictionSchema.parse(body);

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
    if (user.coins < validatedData.coinsWagered) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 }
      );
    }

    // Check if user already has a prediction for this fixture API ID
    const existingPrediction = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, currentUser.userId),
          eq(predictions.fixtureApiId, validatedData.fixtureApiId)
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
    
    // If fixture doesn't exist in our DB, create a minimal entry
    if (!fixtureId) {
      const [newFixture] = await db
        .insert(fixtures)
        .values({
          apiId: validatedData.fixtureApiId,
          name: "Match", // Placeholder, will be updated by sync
          startingAt: new Date(Date.now() + 86400000), // Tomorrow as placeholder
        })
        .returning();
      fixtureId = newFixture.id;
    }

    // Create prediction and deduct coins
    const [newPrediction] = await db
      .insert(predictions)
      .values({
        userId: currentUser.userId,
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

    const userPredictions = await db
      .select()
      .from(predictions)
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
