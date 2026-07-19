import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import Brand from "@/models/Brand";

function escapeRegex(text: string) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const rawBrandName = searchParams.get("brand") || "";
    const cleanBrand = rawBrandName.trim();

    let availableCompanies: any[] = [];

    if (cleanBrand) {
      const safeBrand = escapeRegex(cleanBrand);
      const brandRegex = new RegExp(`^${safeBrand}$`, "i");

      // 1. Find Brand document case-insensitively
      const brandDoc = await Brand.findOne({
        $or: [{ name: brandRegex }, { code: brandRegex }]
      }).lean();

      const brandCompanies = brandDoc?.companies || [];

      // 2. Query Companies by brand regex or companies array
      const orConditions: any[] = [
        { brand: brandRegex },
        { brands: brandRegex }
      ];

      if (brandCompanies.length > 0) {
        const safeCompNames = brandCompanies.map((c: string) => new RegExp(`^${escapeRegex(c.trim())}$`, "i"));
        orConditions.push({ name: { $in: safeCompNames } });
      }

      availableCompanies = await Company.find({
        $or: orConditions,
        status: { $ne: "INACTIVE" }
      }).lean();
    }

    // 3. Fallback: If no companies matched specific brand or brand was empty, find all active companies
    if (availableCompanies.length === 0) {
      availableCompanies = await Company.find({
        status: { $ne: "INACTIVE" }
      }).lean();
    }

    // 4. Sort companies by remaining capacity cap (highest remaining capacity first)
    if (availableCompanies.length > 0) {
      availableCompanies.sort((a, b) => {
        const capA = (a.annualCapacityCap || 1949999) - (a.collectedRevenue || 0);
        const capB = (b.annualCapacityCap || 1949999) - (b.collectedRevenue || 0);
        return capB - capA;
      });

      const bestCompany = availableCompanies[0];
      const remCap = (bestCompany.annualCapacityCap || 1949999) - (bestCompany.collectedRevenue || 0);

      if (remCap > 0) {
        return NextResponse.json({ success: true, company: bestCompany.name });
      }
    }

    return NextResponse.json({ success: true, company: "Unallocated" });
  } catch (error: any) {
    console.error("Engine Allocation Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
