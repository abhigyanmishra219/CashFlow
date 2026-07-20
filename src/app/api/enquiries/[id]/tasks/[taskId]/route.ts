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
    const body = await req.json();
    const { isCompleted, remarks, conversionChance, leadStatus, status } = body;

    const setObj: any = {};

    if (typeof isCompleted === "boolean") {
      setObj["followUps.$.isCompleted"] = isCompleted;
      setObj["followUps.$.status"] = status || (isCompleted ? "Completed" : "Pending");
    }
    if (remarks !== undefined && remarks.trim() !== "") {
      setObj["followUps.$.remarks"] = remarks;
      setObj["followUpNotes"] = remarks;
    }
    if (conversionChance) {
      setObj["priorityLevel"] = conversionChance;
    }
    if (leadStatus) {
      setObj["status"] = leadStatus;
    }

    const updatedEnquiry = await Enquiry.findOneAndUpdate(
      { _id: id, "followUps._id": taskId },
      { $set: setObj },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json(
        { success: false, error: "Enquiry or Task not found" },
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
      { success: false, error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    await dbConnect();
    const { id, taskId } = await params;

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        $pull: {
          followUps: { _id: taskId }
        }
      },
      { new: true }
    );

    if (!updatedEnquiry) {
      return NextResponse.json(
        { success: false, error: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
      message: "Task deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
