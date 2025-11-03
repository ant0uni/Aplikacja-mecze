import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
        coins: users.coins,
        badges: users.badges,
        avatar: users.avatar,
        profileBackground: users.profileBackground,
        avatarFrame: users.avatarFrame,
        victoryEffect: users.victoryEffect,
        profileTitle: users.profileTitle,
        ownedItems: users.ownedItems,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
