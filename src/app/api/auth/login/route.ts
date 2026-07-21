import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to database safely
    try {
      await dbConnect();
    } catch (dbErr: any) {
      console.error("Database connection error in login:", dbErr);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Compare passwords
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcErr: any) {
      console.error("Bcrypt compare error:", bcErr);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Sign JWT token
    const token = await signJWT(tokenPayload);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    // Set HTTP-only cookie on response
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Outer Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
