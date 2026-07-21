import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Task from "@/models/Task";
import { getUserFromCookies } from "@/lib/helper";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();

    const body = await req.json();

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      body.targetBrand = body.targetBrand || user.brandScope;
    }

    // Check for duplicate primary phone number for the target course
    if (body.primaryPhoneMobile && body.targetCourse) {
      const cleanDigits = String(body.primaryPhoneMobile).replace(/\D/g, "").slice(-10);
      if (cleanDigits.length === 10) {
        const existingEnquiry = await Enquiry.findOne({
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

    const newEnquiry = await Enquiry.create(body);

    // AUTO TASK ENGINE: Generate Call Lead task
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // Due in 24h
      await Task.create({
        title: `Call Lead: ${newEnquiry.studentFullName}`,
        description: `Initial contact & course counseling call for ${newEnquiry.targetCourse || 'Program'}.`,
        taskType: "Lead Call",
        linkedStudentName: newEnquiry.studentFullName,
        linkedEnquiryId: newEnquiry._id.toString(),
        assignedTo: newEnquiry.assignedCrmAdvisor || "Unassigned",
        priority: newEnquiry.priorityLevel === "High" ? "High" : "Medium",
        status: "Pending",
        dueDate,
        checklist: [
          { text: "Call candidate and introduce institute programs", isCompleted: false },
          { text: "Verify course preference & learning timeline", isCompleted: false },
          { text: "Schedule free Demo session or campus visit", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: Lead Registered"
      });
    } catch (taskErr) {
      console.error("Auto task trigger error on enquiry create:", taskErr);
    }

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
    const user = await getUserFromCookies();
    
    let query: any = {};
    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      query.targetBrand = { $regex: new RegExp(`^${user.brandScope}$`, "i") };
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });

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
