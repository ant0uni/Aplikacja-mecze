import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { SHOP_ITEMS } from "@/lib/shop-items";

// Get shop items
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's owned items
    const [user] = await db
      .select({ 
        ownedItems: users.ownedItems, 
        badges: users.badges,
        coins: users.coins 
      })
      .from(users)
      .where(eq(users.id, currentUser.userId))
      .limit(1);

    return NextResponse.json(
      {
        items: SHOP_ITEMS,
        ownedItems: user?.ownedItems || [],
        badges: user?.badges || [],
        coins: user?.coins || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get shop items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Purchase item
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
    const { itemId } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Find item in shop
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
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

    // Check if user already owns the item
    if (item.category === 'badge') {
      // For badges, check the badges array
      if (user.badges.includes(itemId)) {
        return NextResponse.json(
          { error: "You already own this badge" },
          { status: 400 }
        );
      }
    } else {
      // For other items, check ownedItems
      if (user.ownedItems.includes(itemId)) {
        return NextResponse.json(
          { error: "You already own this item" },
          { status: 400 }
        );
      }
    }

    // Check if user has enough coins
    if (user.coins < item.price) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 }
      );
    }

    // Purchase item
    if (item.category === 'badge') {
      // Add badge to badges array
      await db
        .update(users)
        .set({
          coins: sql`${users.coins} - ${item.price}`,
          badges: sql`array_append(${users.badges}, ${itemId})`,
          ownedItems: sql`array_append(${users.ownedItems}, ${itemId})`, // Also add to ownedItems for inventory tracking
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.userId));
    } else {
      // Add item to ownedItems
      await db
        .update(users)
        .set({
          coins: sql`${users.coins} - ${item.price}`,
          ownedItems: sql`array_append(${users.ownedItems}, ${itemId})`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.userId));
    }

    // Auto-equip if it's the first item of this category
    const updateFields: Record<string, string | Date> = {};
    if (item.category === "avatar" && user.avatar === "default") {
      updateFields.avatar = itemId;
    } else if (item.category === "background" && user.profileBackground === "default") {
      updateFields.profileBackground = itemId;
    } else if (item.category === "frame" && user.avatarFrame === "none") {
      updateFields.avatarFrame = itemId;
    } else if (item.category === "effect" && user.victoryEffect === "none") {
      updateFields.victoryEffect = itemId;
    } else if (item.category === "title" && !user.profileTitle) {
      updateFields.profileTitle = itemId;
    }

    if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = new Date();
      await db
        .update(users)
        .set(updateFields)
        .where(eq(users.id, currentUser.userId));
    }

    return NextResponse.json(
      {
        message: "Item purchased successfully",
        itemId,
        coinsRemaining: user.coins - item.price,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Purchase item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
