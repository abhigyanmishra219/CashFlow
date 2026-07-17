import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admission from "@/models/Admission";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { studentId, customEmiPlan } = body;

    if (!studentId || !customEmiPlan) {
      return NextResponse.json(
        { success: false, message: "Student ID and customEmiPlan are required" },
        { status: 400 }
      );
    }

    const admission = await Admission.findByIdAndUpdate(
      studentId,
      { customEmiPlan },
      { new: true }
    );

    if (!admission) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: admission });
  } catch (error) {
    console.error("Error updating custom EMI plan:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
