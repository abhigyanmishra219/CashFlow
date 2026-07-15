import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("mobile"); // Fallback to mobile for backward compatibility

    if (!q) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Sanitize search: remove spaces/hyphens for phone matching
    const cleanQ = q.replace(/[\s-]/g, "");
    
    // Create regex pattern for partial matching
    const regex = new RegExp(q, "i");
    const cleanRegex = new RegExp(cleanQ, "i");

    // Match across multiple fields
    const enquiries = await Enquiry.find({
      $or: [
        { studentFullName: regex },
        { parentsName: regex },
        { emailAddress: regex },
        { enquiryId: regex },
        { primaryPhoneMobile: cleanRegex },
        { parentsPhoneNumber: cleanRegex },
        // Try slicing last 10 digits if it's a long number for partial mobile matching
        { primaryPhoneMobile: { $regex: cleanQ.length > 5 ? cleanQ.slice(-10) : cleanQ, $options: "i" } },
        { parentsPhoneNumber: { $regex: cleanQ.length > 5 ? cleanQ.slice(-10) : cleanQ, $options: "i" } },
      ],
    }).sort({ createdAt: -1 }).limit(50); // limit to 50 results

    if (enquiries && enquiries.length > 0) {
      const formattedResults = enquiries.map((enquiry: any) => {
        let lastFollowUp = null;
        let nextFollowUp = null;

        if (enquiry.followUps && enquiry.followUps.length > 0) {
          const sortedFollowUps = [...enquiry.followUps].sort((a: any, b: any) => {
            return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
          });

          const now = new Date();
          const pastFollowUps = sortedFollowUps.filter(f => new Date(`${f.date}T${f.time}`) <= now);
          const futureFollowUps = sortedFollowUps.filter(f => new Date(`${f.date}T${f.time}`) > now);

          lastFollowUp = pastFollowUps.length > 0 ? pastFollowUps[pastFollowUps.length - 1] : null;
          nextFollowUp = futureFollowUps.length > 0 ? futureFollowUps[0] : null;
        }

        return {
          ...enquiry.toObject(),
          lastFollowUp: lastFollowUp ? `${lastFollowUp.date} at ${lastFollowUp.time}` : "None",
          nextFollowUp: nextFollowUp ? `${nextFollowUp.date} at ${nextFollowUp.time}` : "None",
        };
      });

      return NextResponse.json({
        stage: "ENQUIRY",
        data: formattedResults
      });
    }

    // Not Found anywhere
    return NextResponse.json({ stage: "NOT_FOUND", data: [] });

  } catch (error: any) {
    console.error("Error searching admission database:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
