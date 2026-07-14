import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      photoUrl,
      brandScope,
      joiningDate,
      annualTarget,
      currentRevenue,
      admissionsRecorded,
      password,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !brandScope || !password) {
      return NextResponse.json(
        { error: "Required fields (First Name, Last Name, Email, Brand Scope, Password) are missing" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role "counsellor" and counsellor-specific fields
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: "counsellor",
      phone,
      photoUrl,
      brandScope,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      annualTarget: annualTarget ? Number(annualTarget) : 500000,
      currentRevenue: currentRevenue ? Number(currentRevenue) : 0,
      admissionsRecorded: admissionsRecorded ? Number(admissionsRecorded) : 0,
    });

    // Return user without password
    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json(
      { success: true, counsellor: userObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Counsellor Registration API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}

// GET: Fetch all users with role "counsellor"
export async function GET() {
  try {
    await dbConnect();
    const list = await User.find({ role: "counsellor" }).select("-password").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, counsellors: list });
  } catch (error: any) {
    console.error("Counsellor Fetch API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch counsellors" },
      { status: 500 }
    );
  }
}
