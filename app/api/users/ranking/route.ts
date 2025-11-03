import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        email: users.email,
        coins: users.coins,
        avatar: users.avatar,
        profileBackground: users.profileBackground,
        avatarFrame: users.avatarFrame,
        profileTitle: users.profileTitle,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.coins));

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Failed to fetch ranking:", error);
    return NextResponse.json(
      { error: "Failed to fetch ranking" },
      { status: 500 }
    );
  }
}
