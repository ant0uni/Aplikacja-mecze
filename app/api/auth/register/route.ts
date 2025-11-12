import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validations";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if nickname is already taken
    const existingNickname = await db
      .select()
      .from(users)
      .where(eq(users.nickname, validatedData.nickname))
      .limit(1);

    if (existingNickname.length > 0) {
      return NextResponse.json(
        { error: "Nickname is already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with initial coins (100)
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        nickname: validatedData.nickname,
        password: hashedPassword,
        coins: 100, // Starting coins
      })
      .returning({
        id: users.id,
        email: users.email,
        nickname: users.nickname,
        coins: users.coins,
      });

    // Create JWT token
    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          nickname: newUser.nickname,
          coins: newUser.coins,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.name === "ZodError") {
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
