import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Brand from "@/models/Brand";

import Company from "@/models/Company";
import User from "@/models/User";
import Admission from "@/models/Admission";

export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({}).sort({ createdAt: -1 }).lean();

    const enrichedBrands = await Promise.all(brands.map(async (brand: any) => {
      // 1. Legal Entities
      const entities = await Company.find({ 
        $or: [
          { brand: brand.name }, 
          { brands: brand.name },
          { name: { $in: brand.companies || [] } }
        ] 
      }).lean();
      
      // 2. Revenue (from Admissions for this brand)
      const admissions = await Admission.find({ brand: brand.name }).lean();
      let totalRevenue = 0;
      admissions.forEach((a: any) => {
        totalRevenue += Number(a.finalFee || 0);
      });

      // 3. Active Staff (Counsellors)
      const counsellorsCount = await User.countDocuments({ role: "counsellor", brandScope: brand.name });

      // 4. Brand Managers
      const brandManagersCount = await User.countDocuments({ role: "brand-manager", brandScope: brand.name });

      return {
        ...brand,
        stats: {
          entitiesCount: entities.length,
          revenue: totalRevenue,
          counsellorsCount,
          brandManagersCount,
        },
        legalEntities: entities,
      };
    }));

    return NextResponse.json({ success: true, brands: enrichedBrands });
  } catch (error: any) {
    console.error("Fetch Brands Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, code, logoUrl, description, phone, email, website, address, companies } = body;

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const newBrand = await Brand.create({
      name,
      code,
      logoUrl,
      description,
      phone,
      email,
      website,
      address,
      companies: Array.isArray(companies) ? companies : [],
      status: "ACTIVE",
    });

    return NextResponse.json({ success: true, brand: newBrand }, { status: 201 });
  } catch (error: any) {
    console.error("Create Brand Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create brand" }, { status: 500 });
  }
}
