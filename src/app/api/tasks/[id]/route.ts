import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found." },
        { status: 404 }
      );
    }

    const {
      status,
      priority,
      assignedTo,
      checklistIndex,
      isChecklistCompleted,
      commentText,
      commentAuthor,
      isEscalated
    } = body;

    // Toggle specific checklist item if index is provided
    if (typeof checklistIndex === "number" && task.checklist && task.checklist[checklistIndex]) {
      task.checklist[checklistIndex].isCompleted = isChecklistCompleted !== undefined 
        ? isChecklistCompleted 
        : !task.checklist[checklistIndex].isCompleted;
      
      // Auto complete task if all checklist items are completed
      const allCompleted = task.checklist.every((item: any) => item.isCompleted);
      if (allCompleted) {
        task.status = "Completed";
        task.completedAt = new Date();
      }
    }

    // Add comment
    if (commentText && commentAuthor) {
      task.comments.push({
        author: commentAuthor,
        text: commentText,
        createdAt: new Date()
      });
    }

    // Update status
    if (status) {
      task.status = status;
      if (status === "Completed") {
        task.completedAt = new Date();
      }
    }

    // Update priority
    if (priority) {
      task.priority = priority;
    }

    // Re-assign
    if (assignedTo) {
      task.assignedTo = assignedTo;
    }

    // Toggle escalation
    if (isEscalated !== undefined) {
      task.isEscalated = isEscalated;
      if (!isEscalated && task.status === "Escalated") {
        task.status = "Pending";
      }
    }

    await task.save();

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      task
    });
  } catch (error: any) {
    console.error("Update Task API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update task." },
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

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully."
    });
  } catch (error: any) {
    console.error("Delete Task API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete task." },
      { status: 500 }
    );
  }
}
