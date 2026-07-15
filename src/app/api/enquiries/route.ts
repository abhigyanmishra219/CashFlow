import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const newEnquiry = await Enquiry.create(body);

    return NextResponse.json(
      { success: true, data: newEnquiry, message: "Enquiry created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating enquiry:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create enquiry" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: enquiries },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
