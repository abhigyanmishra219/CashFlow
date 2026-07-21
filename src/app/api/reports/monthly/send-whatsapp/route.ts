import { NextRequest, NextResponse } from "next/server";
import { getMonthlyReportStats } from "@/lib/dailyReportService";
import { sendWhatsAppMonthlyReport } from "@/lib/msg91";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const adminMobileNumber = body.adminMobileNumber || "919335913286";

    const stats = await getMonthlyReportStats();

    const result = await sendWhatsAppMonthlyReport({
      adminMobileNumber,
      reportData: stats,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Monthly WhatsApp report PDF successfully sent.",
        stats,
        result: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send Monthly WhatsApp report.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in send-whatsapp monthly route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
