import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import LostLeadCounter from "@/models/LostLeadCounter";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // Check for duplicate primary phone number for the target course
    if (body.primaryPhoneMobile && body.targetCourse) {
      const cleanDigits = String(body.primaryPhoneMobile).replace(/\D/g, "").slice(-10);
      if (cleanDigits.length === 10) {
        const existingEnquiry = await Enquiry.findOne({
          _id: { $ne: id },
          targetCourse: { $regex: new RegExp(`^${body.targetCourse.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
          primaryPhoneMobile: { $regex: cleanDigits }
        });

        if (existingEnquiry) {
          return NextResponse.json(
            { 
              success: false, 
              message: `A lead with primary phone number '${body.primaryPhoneMobile}' already exists for the course '${body.targetCourse}'.` 
            },
            { status: 400 }
          );
        }
      }
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      enquiry: updatedEnquiry,
    });
  } catch (error: any) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

    if (!deletedEnquiry) {
      return NextResponse.json(
        { error: "Enquiry not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const isLostLead = searchParams.get('lostLead') === 'true';

    if (isLostLead) {
      const todayStr = new Date().toISOString().split("T")[0];
      await LostLeadCounter.findOneAndUpdate(
        { date: todayStr },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiry", message: error.message },
      { status: 500 }
    );
  }
}

