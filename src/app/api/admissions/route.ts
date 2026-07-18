import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admission from "@/models/Admission";
import Enquiry from "@/models/Enquiry";
import Payment from "@/models/Payment";
import { getUserFromCookies } from "@/lib/helper";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const data = await req.json();

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      data.brand = data.brand || user.brandScope;
    }

    const admission = new Admission(data);
    await admission.save();

    // Optionally update the original enquiry status if enquiryId is present
    if (data.enquiryId) {
      await Enquiry.findByIdAndUpdate(data.enquiryId, { status: "Admitted" });
    }

    // Automatically generate a Payment record for the initial payment collected during admission
    if (data.amountReceivedToday > 0) {
      const initialPayment = new Payment({
        admissionId: admission._id,
        studentName: admission.fullName,
        amountReceived: Number(data.amountReceivedToday),
        paymentMode: data.paymentMode || "Cash",
        referenceNo: data.transactionNo || "N/A",
        company: data.companyAssigned || "Unknown",
        paymentDate: admission.paymentDate || new Date(),
        particulars: {
          courseFeeDue: 0,
          registrationFeeDue: 0,
          materialFeeDue: 0,
          examFeeDue: 0
        },
        remarks: "Initial payment upon admission"
      });
      await initialPayment.save();
    }

    return NextResponse.json(
      { success: true, message: "Admission generated successfully", data: admission },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admission Creation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate admission" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    let brand = searchParams.get("brand");

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      brand = user.brandScope;
    }

    let query: any = {};
    if (q) {
      const regex = new RegExp(q, "i");
      const cleanQ = q.replace(/[\s-]/g, "");
      const cleanRegex = new RegExp(cleanQ, "i");

      query.$or = [
        { fullName: regex },
        { admissionId: regex },
        { mobileNumber: cleanRegex },
        { email: regex },
      ];
    }

    if (brand && brand !== "all") {
      query.brand = brand;
    }

    const admissions = await Admission.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: admissions });
  } catch (error: any) {
    console.error("Fetch Admissions Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch admissions" },
      { status: 500 }
    );
  }
}
