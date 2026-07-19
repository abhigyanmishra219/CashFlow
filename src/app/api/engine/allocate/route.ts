import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import Brand from "@/models/Brand";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const brandName = searchParams.get("brand");

    if (!brandName) {
      return NextResponse.json({ success: false, message: "Brand is required" }, { status: 400 });
    }

    const brandDoc = await Brand.findOne({ name: brandName }).lean();
    const brandCompanies = brandDoc?.companies || [];
    
    const availableCompanies = await Company.find({
      $or: [
        { brand: brandName },
        { brands: brandName },
        { name: { $in: brandCompanies } }
      ],
      status: "ACTIVE"
    });

    if (availableCompanies.length > 0) {
      availableCompanies.sort((a, b) => {
        const capA = (a.annualCapacityCap || 1949999) - (a.collectedRevenue || 0);
        const capB = (b.annualCapacityCap || 1949999) - (b.collectedRevenue || 0);
        return capB - capA;
      });
      
      return NextResponse.json({ success: true, company: availableCompanies[0].name });
    } else {
      return NextResponse.json({ success: true, company: "Unallocated" });
    }
  } catch (error: any) {
    console.error("Engine Allocation Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
