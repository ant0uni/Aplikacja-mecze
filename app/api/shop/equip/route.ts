import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Equip item
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
    const { itemId, category } = body;

    if (!itemId || !category) {
      return NextResponse.json(
        { error: "Item ID and category are required" },
        { status: 400 }
      );
    }

    // Get user data
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

    // Check if user owns the item (or allow "default"/"none")
    if (itemId !== "default" && itemId !== "none" && !user.ownedItems.includes(itemId)) {
      return NextResponse.json(
        { error: "You don't own this item" },
        { status: 400 }
      );
    }

    // Equip item based on category
    let updateFields: any = { updatedAt: new Date() };

    switch (category) {
      case "avatar":
        updateFields.avatar = itemId;
        break;
      case "background":
        updateFields.profileBackground = itemId;
        break;
      case "frame":
        updateFields.avatarFrame = itemId;
        break;
      case "effect":
        updateFields.victoryEffect = itemId;
        break;
      case "title":
        updateFields.profileTitle = itemId === "none" ? null : itemId;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
    }

    await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, currentUser.userId));

    return NextResponse.json(
      {
        message: "Item equipped successfully",
        itemId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Equip item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
