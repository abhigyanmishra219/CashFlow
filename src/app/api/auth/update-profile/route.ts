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

    const { name, email, phone, photoUrl, brandLogo } = await req.json();

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.toLowerCase().trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (photoUrl !== undefined) updateFields.photoUrl = photoUrl.trim();
    if (brandLogo !== undefined) updateFields.brandLogo = brandLogo.trim();

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updateFields },
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
        phone: (updatedUser as any).phone || "",
        photoUrl: (updatedUser as any).photoUrl || "",
        brandLogo: (updatedUser as any).brandLogo || ""
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
