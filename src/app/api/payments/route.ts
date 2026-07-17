import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Admission from "@/models/Admission";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get("admissionId");

    let query = {};
    if (admissionId) {
      query = { admissionId };
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch payments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { admissionId, amountReceived, paymentMode, referenceNo, remarks, company, particulars } = body;

    if (!admissionId || !amountReceived || !paymentMode) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (admissionId, amountReceived, paymentMode)." },
        { status: 400 }
      );
    }

    // 1. Find the admission record
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return NextResponse.json(
        { success: false, message: "Admission record not found." },
        { status: 404 }
      );
    }

    // 2. Create the payment record
    const payment = new Payment({
      admissionId,
      studentName: admission.fullName,
      amountReceived: Number(amountReceived),
      paymentMode,
      referenceNo,
      remarks,
      company: company || admission.companyAssigned,
      particulars,
    });
    await payment.save();

    // 3. Update the admission balance and last transaction details
    admission.remainingBalance = Math.max(0, admission.remainingBalance - Number(amountReceived));
    await admission.save();

    return NextResponse.json(
      { success: true, message: "Payment processed successfully.", data: payment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process payment." },
      { status: 500 }
    );
  }
}
