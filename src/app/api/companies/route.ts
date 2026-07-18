import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { getUserFromCookies } from "@/lib/helper";

const INITIAL_COMPANIES = [
  {
    companyId: "COMP-1783598625379",
    name: "Institue of Creative Studies",
    legalName: "Institue of Creative Studies",
    gst: "Not Provided",
    pan: "Not Provided",
    bank: "Bank Of India",
    annualCapacityCap: 1949999,
    collectedRevenue: 0,
    address: "No listed street, No City, No State, PIN",
    brand: "Design Gateway",
    status: "ACTIVE",
  },
  {
    companyId: "COMP-1783590745092",
    name: "Designers Choice",
    legalName: "Designers Choice",
    gst: "Not Provided",
    pan: "Not Provided",
    bank: "State Bank of India",
    annualCapacityCap: 1949999,
    collectedRevenue: 0,
    address: "No listed street, No City, No State, PIN",
    brand: "Design Gateway",
    status: "ACTIVE",
  },
  {
    companyId: "COMP-1783591173176",
    name: "Sling Shot Technologies",
    legalName: "Sling Shot Technologies",
    gst: "Not Provided",
    pan: "Not Provided",
    bank: "HDFC Bank",
    annualCapacityCap: 1949999,
    collectedRevenue: 0,
    address: "No listed street, No City, No State, PIN",
    brand: "Design Gateway",
    status: "ACTIVE",
  },
  {
    companyId: "E9B83E19-3591-4E7B-88D5-69CCABB13ADC",
    name: "Enterprise Test Company",
    legalName: "Enterprise Test Company",
    gst: "Not Provided",
    pan: "Not Provided",
    bank: "ICICI Bank",
    annualCapacityCap: 1949999,
    collectedRevenue: 0,
    address: "No listed street, No City, No State, PIN",
    brand: "Design Gateway",
    status: "ACTIVE",
  },
];

export async function GET() {
  try {
    await dbConnect();
    const user = await getUserFromCookies();

    let query: any = {};
    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      query.brand = user.brandScope;
    }

    let list = await Company.find(query).sort({ createdAt: -1 });

    if (!list || list.length === 0) {
      list = await Company.insertMany(INITIAL_COMPANIES);
    }

    return NextResponse.json({ success: true, companies: list });
  } catch (error: any) {
    console.error("Fetch Companies Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const body = await req.json();
    const { name, legalName, gst, pan, bank, annualCapacityCap, address } = body;
    let { brand } = body;

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      brand = brand || user.brandScope;
    }

    if (!name) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const newCompany = await Company.create({
      name,
      legalName: legalName || name,
      gst: gst || "Not Provided",
      pan: pan || "Not Provided",
      bank: bank || "Bank Of India",
      annualCapacityCap: annualCapacityCap ? Number(annualCapacityCap) : 1949999,
      address: address || "No listed street, No City, No State, PIN",
      brand: brand || "Design Gateway",
      status: "ACTIVE",
    });

    return NextResponse.json({ success: true, company: newCompany }, { status: 201 });
  } catch (error: any) {
    console.error("Create Company Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create company" }, { status: 500 });
  }
}
