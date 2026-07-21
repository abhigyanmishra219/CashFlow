import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Admission from "@/models/Admission";
import { generateReceiptPdfBuffer } from "@/lib/pdfGenerator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptNo: string }> }
) {
  try {
    await dbConnect();
    const { receiptNo } = await params;

    if (!receiptNo) {
      return new NextResponse("Receipt number required", { status: 400 });
    }

    const payment = await Payment.findOne({ receiptNo }).lean();
    let admission: any = null;

    if (payment && payment.admissionId) {
      admission = await Admission.findById(payment.admissionId).lean();
    }

    const studentName = payment?.studentName || admission?.fullName || "Student";
    const admissionId = admission?.admissionId || "ADM-N/A";
    const courseName = admission?.course || "Course";
    const amountPaid = payment?.amountReceived || 0;
    const paymentDate = new Date(
      payment?.createdAt || payment?.paymentDate || Date.now()
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const finalFee = Number(admission?.finalFee || admission?.courseFee || 0);
    const remainingBalance = Number(admission?.remainingBalance ?? 0);
    const totalPaidToDate = Math.max(0, finalFee - remainingBalance);

    const pdfBuffer = generateReceiptPdfBuffer({
      receiptNo,
      studentName,
      admissionId,
      courseName,
      amountPaid,
      paymentDate,
      paymentMode: payment?.paymentMode || "Cash",
      referenceNo: payment?.referenceNo || "N/A",
      brandName: payment?.brand || admission?.brand || "CADD MANTRA",
      companyName: payment?.company || admission?.companyAssigned || "Design Gateway Pvt Ltd",
      totalFee: finalFee,
      totalPaidToDate,
      remainingBalance,
    });

    return new NextResponse(Uint8Array.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Fee_Receipt_${receiptNo}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error generating receipt PDF route:", error);
    return new NextResponse("Failed to generate receipt PDF", { status: 500 });
  }
}
