import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { getUserFromCookies } from "@/lib/helper";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Retrieve currently logged-in user from session/cookies (returns lean user without password)
    const sessionUser = await getUserFromCookies();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized session. Please login again." }, { status: 401 });
    }

    // Retrieve full User document from MongoDB including the password field
    const dbUser = await User.findById(sessionUser._id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database." }, { status: 404 });
    }

    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Old password and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 });
    }

    // Check old password matches database record
    const isPasswordValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect old password." }, { status: 400 });
    }

    // Hash and update to new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    dbUser.password = hashedNewPassword;
    await dbUser.save();

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (error: any) {
    console.error("Password Reset API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
