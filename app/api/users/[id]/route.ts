import { db } from "@/db";
import { users, predictions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch user basic info (no predictions)
    const [user] = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        coins: users.coins,
        avatar: users.avatar,
        profileBackground: users.profileBackground,
        avatarFrame: users.avatarFrame,
        victoryEffect: users.victoryEffect,
        profileTitle: users.profileTitle,
        badges: users.badges,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user statistics
    const [stats] = await db
      .select({
        totalPredictions: sql<number>`COUNT(*)`,
        settledPredictions: sql<number>`COUNT(*) FILTER (WHERE ${predictions.isSettled} = true)`,
        wonPredictions: sql<number>`COUNT(*) FILTER (WHERE ${predictions.verdict} = 'won')`,
        lostPredictions: sql<number>`COUNT(*) FILTER (WHERE ${predictions.verdict} = 'lost')`,
        totalCoinsWagered: sql<number>`COALESCE(SUM(${predictions.coinsWagered}), 0)`,
        totalCoinsWon: sql<number>`COALESCE(SUM(${predictions.coinsWon}), 0)`,
      })
      .from(predictions)
      .where(eq(predictions.userId, userId));

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          totalPredictions: Number(stats.totalPredictions),
          settledPredictions: Number(stats.settledPredictions),
          wonPredictions: Number(stats.wonPredictions),
          lostPredictions: Number(stats.lostPredictions),
          winRate: stats.settledPredictions > 0
            ? Math.round((Number(stats.wonPredictions) / Number(stats.settledPredictions)) * 100)
            : 0,
          totalCoinsWagered: Number(stats.totalCoinsWagered),
          totalCoinsWon: Number(stats.totalCoinsWon),
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
