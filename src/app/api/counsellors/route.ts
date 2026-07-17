import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Admission from "@/models/Admission";

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

// GET: Fetch all users with role "counsellor" with live admission metrics calculation
export async function GET() {
  try {
    await dbConnect();
    const counsellors = await User.find({ role: "counsellor" }).select("-password").sort({ createdAt: -1 });
    const admissions = await Admission.find({});

    const counsellorsWithLiveStats = counsellors.map((c: any) => {
      const cObj = c.toObject();

      // Find all admissions assigned to this counsellor
      const matchingAdmissions = admissions.filter((adm: any) => {
        if (!adm.counsellor) return false;
        const admCounsellor = adm.counsellor.toLowerCase().trim();
        const cName = (c.name || "").toLowerCase().trim();
        const cEmail = (c.email || "").toLowerCase().trim();
        const cId = c._id.toString();

        return (
          admCounsellor === cName ||
          admCounsellor === cEmail ||
          admCounsellor === cId ||
          (cName && admCounsellor.includes(cName)) ||
          (cName && cName.includes(admCounsellor))
        );
      });

      const actualAdmissionsCount = matchingAdmissions.length;
      const actualRevenue = matchingAdmissions.reduce((sum: number, adm: any) => {
        const paid =
          adm.amountReceivedToday ||
          Number(adm.finalFee || 0) - Number(adm.remainingBalance || 0);
        return sum + Math.max(Number(paid) || 0, 0);
      }, 0);

      return {
        ...cObj,
        currentRevenue: actualRevenue > 0 ? actualRevenue : c.currentRevenue || 0,
        admissionsRecorded: actualAdmissionsCount > 0 ? actualAdmissionsCount : c.admissionsRecorded || 0,
      };
    });

    return NextResponse.json({ success: true, counsellors: counsellorsWithLiveStats });
  } catch (error: any) {
    console.error("Counsellor Fetch API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch counsellors" },
      { status: 500 }
    );
  }
}
