import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, name, email, phone, photoUrl, brandScope, password } = body;

    const manager = await User.findById(id);
    if (!manager) {
      return NextResponse.json({ error: "Brand Manager not found" }, { status: 404 });
    }

    if (email && email.toLowerCase() !== manager.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered to another account" }, { status: 400 });
      }
      manager.email = email;
    }

    if (name) {
      manager.name = name;
    } else if (firstName && lastName) {
      manager.name = `${firstName} ${lastName}`;
    } else if (firstName) {
      manager.name = firstName;
    }

    if (phone !== undefined) manager.phone = phone;
    if (photoUrl !== undefined) manager.photoUrl = photoUrl;
    if (brandScope !== undefined) manager.brandScope = brandScope;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      manager.password = await bcrypt.hash(password, salt);
    }

    await manager.save();

    return NextResponse.json({
      success: true,
      message: "Brand Manager updated successfully",
      data: manager,
    });
  } catch (error: any) {
    console.error("Error updating brand manager:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brand Manager deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting brand manager:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
