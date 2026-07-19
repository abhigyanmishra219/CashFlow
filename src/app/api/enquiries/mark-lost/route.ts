import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import LostLeadCounter from "@/models/LostLeadCounter";

export async function POST(req: Request) {
  try {
    const { enquiryId, date } = await req.json();

    if (!enquiryId || !date) {
      return NextResponse.json({ message: "enquiryId and date are required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Physically delete the enquiry instead of marking it as lost
    const enquiry = await Enquiry.findByIdAndDelete(enquiryId);

    if (!enquiry) {
      return NextResponse.json({ message: "Enquiry not found" }, { status: 404 });
    }

    // 2. Increment the lost lead counter for the given date
    await LostLeadCounter.findOneAndUpdate(
      { date: date },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Lead marked as lost successfully", enquiry });
  } catch (error: any) {
    console.error("Error marking lead as lost:", error);
    return NextResponse.json({ message: error.message || "Failed to mark lead as lost" }, { status: 500 });
  }
}
