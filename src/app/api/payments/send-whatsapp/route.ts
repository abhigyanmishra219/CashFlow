import { NextResponse } from "next/server";
import { sendWhatsAppFeeReceipt } from "@/lib/msg91";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      mobileNumber,
      courseName,
      amountPaid,
      paymentDate,
      receiptNo,
      receiptUrl,
    } = body;

    if (!mobileNumber || !receiptNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (mobileNumber, receiptNo).",
        },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppFeeReceipt({
      studentName: studentName || "Student",
      mobileNumber,
      courseName: courseName || "Course",
      amountPaid: amountPaid || 0,
      paymentDate: paymentDate || new Date().toLocaleDateString("en-IN"),
      receiptNo,
      receiptUrl,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp fee receipt dispatched successfully via MSG91.",
        result: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send WhatsApp message via MSG91.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending WhatsApp receipt API:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send WhatsApp receipt.",
      },
      { status: 500 }
    );
  }
}
