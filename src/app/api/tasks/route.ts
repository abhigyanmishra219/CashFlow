import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const isEscalated = searchParams.get("isEscalated");
    const search = searchParams.get("search");

    const query: any = {};

    if (assignedTo) {
      query.assignedTo = { $regex: new RegExp(assignedTo, "i") };
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (isEscalated === "true") {
      query.isEscalated = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { linkedStudentName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Auto update overdue tasks
    const now = new Date();
    await Task.updateMany(
      {
        status: { $in: ["Pending", "In Progress"] },
        dueDate: { $lt: now }
      },
      {
        $set: { status: "Overdue" }
      }
    );

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    console.error("Fetch Tasks API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      title,
      description,
      taskType = "General",
      linkedStudentName,
      linkedStudentId,
      linkedEnquiryId,
      assignedTo,
      assignedRole = "counsellor",
      priority = "Medium",
      dueDate,
      checklist = []
    } = body;

    if (!title || !assignedTo || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, assignedTo, and dueDate are required." },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      title,
      description,
      taskType,
      linkedStudentName,
      linkedStudentId,
      linkedEnquiryId,
      assignedTo,
      assignedRole,
      priority,
      status: "Pending",
      dueDate: new Date(dueDate),
      checklist: checklist.map((item: any) => ({
        text: typeof item === "string" ? item : item.text,
        isCompleted: false
      }))
    });

    return NextResponse.json({
      success: true,
      message: "Task created successfully.",
      task: newTask
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create Task API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task." },
      { status: 500 }
    );
  }
}
