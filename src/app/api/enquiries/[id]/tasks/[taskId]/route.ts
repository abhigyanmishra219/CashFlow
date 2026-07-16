import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    await dbConnect();
    const { id, taskId } = await params;
    const { isCompleted } = await req.json();

    const updatedEnquiry = await Enquiry.findOneAndUpdate(
      { _id: id, "followUps._id": taskId },
      {
        $set: {
          "followUps.$.isCompleted": isCompleted,
          "followUps.$.status": isCompleted ? "Completed" : "Pending",
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json(
        { error: "Enquiry or Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
