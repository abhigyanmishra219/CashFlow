import { NextResponse } from "next/server";
import { getDailyReportStats } from "@/lib/dailyReportService";
import { sendWhatsAppDailyReport } from "@/lib/msg91";

export async function POST(req: Request) {
  try {
    let targetPhone = "919335913286";
    
    try {
      const body = await req.json();
      if (body?.adminMobileNumber) {
        targetPhone = body.adminMobileNumber;
      }
    } catch (_) {
      // Body may be empty if called via cron trigger
    }

    if (!targetPhone) {
      targetPhone = process.env.ADMIN_WHATSAPP_NUMBER || "919335913286";
    }

    const stats = await getDailyReportStats();

    const result = await sendWhatsAppDailyReport({
      adminMobileNumber: targetPhone,
      reportData: stats,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Daily Executive WhatsApp report dispatched successfully.",
        stats,
        result: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to dispatch WhatsApp daily report.",
          stats,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error sending daily report API:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send daily report.",
      },
      { status: 500 }
    );
  }
}

// Support GET for cron job schedulers
export async function GET(req: Request) {
  return POST(req);
}
