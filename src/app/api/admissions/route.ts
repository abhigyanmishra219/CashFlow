import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admission from "@/models/Admission";
import Enquiry from "@/models/Enquiry";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const admission = new Admission(data);
    await admission.save();

    // Optionally update the original enquiry status if enquiryId is present
    if (data.enquiryId) {
      await Enquiry.findByIdAndUpdate(data.enquiryId, { status: "Admitted" });
    }

    return NextResponse.json(
      { success: true, message: "Admission generated successfully", data: admission },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admission Creation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate admission" },
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
export async function GET() {
  try {
    await dbConnect();
    const admissions = await Admission.find({}).sort({ createdAt: -1 });
=======
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    let query = {};
    if (q) {
      const regex = new RegExp(q, "i");
      const cleanQ = q.replace(/[\s-]/g, "");
      const cleanRegex = new RegExp(cleanQ, "i");

      query = {
        $or: [
          { fullName: regex },
          { admissionId: regex },
          { mobileNumber: cleanRegex },
          { email: regex },
        ],
      };
    }

    const admissions = await Admission.find(query).sort({ createdAt: -1 });
>>>>>>> Chaitanya-local
    return NextResponse.json({ success: true, data: admissions });
  } catch (error: any) {
    console.error("Fetch Admissions Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch admissions" },
      { status: 500 }
    );
  }
}
