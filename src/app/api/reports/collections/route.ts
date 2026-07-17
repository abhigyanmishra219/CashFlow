import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {};
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else if (startDate) {
      query.paymentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.paymentDate = { $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // Ensure Admission model is registered before populating
    require("@/models/Admission");

    const payments = await Payment.find(query)
      .populate({
        path: "admissionId",
        select: "fullName mobileNumber email course brand companyAssigned",
      })
      .sort({ paymentDate: -1 });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error("Collections Report API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch collections data" },
      { status: 500 }
    );
  }
}
