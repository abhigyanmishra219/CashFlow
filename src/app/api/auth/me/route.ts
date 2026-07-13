import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No session token found" },
        { status: 401 }
      );
    }

    // Verify token using default environment secret
    const decoded = await verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { authenticated: false, error: "Session token is invalid or expired" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Auth Session API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
