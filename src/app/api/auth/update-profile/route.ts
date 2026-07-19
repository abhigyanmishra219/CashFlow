import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyJWT, signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyJWT(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { name, email, phone } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: { name: name.trim(), email: email.toLowerCase().trim(), phone: phone?.trim() } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sign new JWT with updated email in case it's used elsewhere
    const newToken = await signJWT({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    cookieStore.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: (updatedUser as any).phone || ""
      }
    });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile", message: error.message }, { status: 500 });
  }
}
