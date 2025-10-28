import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { addCoinsSchema } from "@/lib/validations";
import { eq, sql } from "drizzle-orm";

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
    const validatedData = addCoinsSchema.parse(body);

    // Update user's coins
    const [updatedUser] = await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${validatedData.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.userId))
      .returning({
        id: users.id,
        email: users.email,
        coins: users.coins,
      });

    return NextResponse.json(
      {
        message: "Coins added successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Add coins error:", error);

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
