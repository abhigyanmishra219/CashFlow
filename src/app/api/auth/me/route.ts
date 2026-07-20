import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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

    await dbConnect();
    const dbUser = await User.findById(decoded.id).lean();

    if (!dbUser) {
      return NextResponse.json(
        { authenticated: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        phone: (dbUser as any).phone || "",
        photoUrl: (dbUser as any).photoUrl || "",
        brandLogo: (dbUser as any).brandLogo || "",
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
