import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Simple email validation & password length constraint
    if (!email.includes("@") || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid email format or password too short (min 6 characters)" },
        { status: 400 }
      );
    }

    // Mock authentication check: accept any valid inputs for this step
    const user = {
      id: "usr_1001",
      email: email.toLowerCase(),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      role: "user",
    };

    // Sign the JWT token (it will automatically use process.env.JWT_SECRET)
    const token = await signJWT(user);

    // Set the JWT inside a secure, HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
