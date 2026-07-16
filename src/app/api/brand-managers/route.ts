import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();
    const brandManagers = await User.find({ role: "brand manager" }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: brandManagers });
  } catch (error: any) {
    console.error("Error fetching brand managers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { firstName, lastName, email, phone, photoUrl, brandScope, password } = body;

    if (!firstName || !lastName || !email || !password || !brandScope) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create brand manager
    const newBrandManager = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: "brand manager",
      phone: phone || "",
      photoUrl: photoUrl || "",
      brandScope,
      joiningDate: new Date(),
    });

    await newBrandManager.save();

    return NextResponse.json({
      success: true,
      message: "Brand Manager provisioned successfully",
      data: {
        id: newBrandManager._id,
        name: newBrandManager.name,
        email: newBrandManager.email,
        brandScope: newBrandManager.brandScope
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating brand manager:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
