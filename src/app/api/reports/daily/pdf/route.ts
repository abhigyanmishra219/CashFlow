import { NextRequest, NextResponse } from "next/server";
import { getDailyReportStats } from "@/lib/dailyReportService";
import { generateDailyReportPdfBuffer } from "@/lib/pdfGenerator";

export async function GET(req: NextRequest) {
  try {
    const stats = await getDailyReportStats();
    const pdfBuffer = generateDailyReportPdfBuffer(stats);

    const safeDateStr = stats.dateStr.replace(/[^a-zA-Z0-9]/g, "_");

    return new NextResponse(Uint8Array.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Daily_Report_${safeDateStr}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Error generating daily report PDF:", error);
    return new NextResponse("Failed to generate daily report PDF", { status: 500 });
  }
}
