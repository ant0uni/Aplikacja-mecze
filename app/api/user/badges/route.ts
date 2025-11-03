import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

// Add badge to user (for testing/admin purposes)
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
    const { badgeId } = body;

    if (!badgeId || typeof badgeId !== "string") {
      return NextResponse.json(
        { error: "Badge ID is required" },
        { status: 400 }
      );
    }

    // Get current user badges
    const [user] = await db
      .select({ badges: users.badges })
      .from(users)
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if badge already exists
    if (user.badges.includes(badgeId)) {
      return NextResponse.json(
        { error: "Badge already owned" },
        { status: 400 }
      );
    }

    // Add badge to user
    await db
      .update(users)
      .set({
        badges: sql`array_append(${users.badges}, ${badgeId})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.userId));

    return NextResponse.json(
      {
        message: "Badge added successfully",
        badgeId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add badge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Remove badge from user
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { badgeId } = body;

    if (!badgeId || typeof badgeId !== "string") {
      return NextResponse.json(
        { error: "Badge ID is required" },
        { status: 400 }
      );
    }

    // Remove badge from user
    await db
      .update(users)
      .set({
        badges: sql`array_remove(${users.badges}, ${badgeId})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.userId));

    return NextResponse.json(
      {
        message: "Badge removed successfully",
        badgeId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove badge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
