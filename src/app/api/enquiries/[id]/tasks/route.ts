import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import { verifyJWT } from "@/lib/jwt";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let userName = "System";

    if (token) {
      try {
        const decoded = await verifyJWT(token);
        if (decoded && decoded.name) {
          userName = decoded.name;
        }
      } catch (err) {
        console.error("JWT verification failed in tasks route:", err);
      }
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        $push: {
          followUps: {
            ...body,
            plannedBy: userName,
            createdAt: new Date(),
          },
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedEnquiry, message: "Task added successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding task:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add task" },
      { status: 500 }
    );
  }
}
