import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { event, payload } = body;

    if (!event || !payload) {
      return NextResponse.json(
        { success: false, error: "Event and payload are required for auto task trigger." },
        { status: 400 }
      );
    }

    const createdTasks: any[] = [];

    // EVENT 1: NEW LEAD REGISTERED
    if (event === "NEW_LEAD") {
      const { enquiryId, studentFullName, assignedCrmAdvisor, targetCourse, priorityLevel } = payload;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // Due in 24 hours

      const newTask = await Task.create({
        title: `Call Lead: ${studentFullName}`,
        description: `Initial contact & course counseling call for ${targetCourse || 'Target Course'}.`,
        taskType: "Lead Call",
        linkedStudentName: studentFullName,
        linkedEnquiryId: enquiryId,
        assignedTo: assignedCrmAdvisor || "Unassigned",
        priority: priorityLevel === "High" ? "High" : "Medium",
        status: "Pending",
        dueDate,
        checklist: [
          { text: "Call candidate and introduce institute programs", isCompleted: false },
          { text: "Verify course preference & learning timeline", isCompleted: false },
          { text: "Schedule free Demo session or campus visit", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: Lead Registered"
      });
      createdTasks.push(newTask);
    }

    // EVENT 2: DEMO SCHEDULED
    else if (event === "DEMO_SCHEDULED") {
      const { enquiryId, studentFullName, assignedCrmAdvisor, demoDate, demoTime } = payload;
      const dueDate = demoDate ? new Date(demoDate) : new Date();

      const newTask = await Task.create({
        title: `Conduct & Follow Up Demo: ${studentFullName}`,
        description: `Scheduled Demo Class on ${demoDate || 'Today'} at ${demoTime || 'Scheduled Time'}.`,
        taskType: "Demo",
        linkedStudentName: studentFullName,
        linkedEnquiryId: enquiryId,
        assignedTo: assignedCrmAdvisor || "Unassigned",
        priority: "High",
        status: "Pending",
        dueDate,
        checklist: [
          { text: "Send class meeting link 1 hour prior to session", isCompleted: false },
          { text: "Conduct interactive demo & answer student questions", isCompleted: false },
          { text: "Call candidate post-demo to discuss admission process", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: Demo Scheduled"
      });
      createdTasks.push(newTask);
    }

    // EVENT 3: NEW ADMISSION CONFIRMED
    else if (event === "NEW_ADMISSION") {
      const { admissionId, studentFullName, counsellor, courseName } = payload;

      const dueIn24h = new Date();
      dueIn24h.setDate(dueIn24h.getDate() + 1);

      const dueIn48h = new Date();
      dueIn48h.setDate(dueIn48h.getDate() + 2);

      const t1 = await Task.create({
        title: `Document Collection & Verification: ${studentFullName}`,
        description: `Collect Govt ID proof, past marksheets, and passport photo for ${courseName}.`,
        taskType: "Document Collection",
        linkedStudentName: studentFullName,
        linkedStudentId: admissionId,
        assignedTo: counsellor || "Unassigned",
        priority: "High",
        status: "Pending",
        dueDate: dueIn24h,
        checklist: [
          { text: "Verify Aadhaar / Govt Identity Card", isCompleted: false },
          { text: "Upload educational marksheets & photo", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: New Admission SOP Step 1"
      });

      const t2 = await Task.create({
        title: `First Installment Fee Collection: ${studentFullName}`,
        description: `Ensure registration fee receipt is issued and recorded in ERP.`,
        taskType: "Fee Collection",
        linkedStudentName: studentFullName,
        linkedStudentId: admissionId,
        assignedTo: counsellor || "Unassigned",
        priority: "High",
        status: "Pending",
        dueDate: dueIn24h,
        checklist: [
          { text: "Confirm payment credit in bank/cash register", isCompleted: false },
          { text: "Generate official PDF payment receipt", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: New Admission SOP Step 2"
      });

      const t3 = await Task.create({
        title: `Batch Allocation & LMS Access: ${studentFullName}`,
        description: `Assign batch timing and send LMS portal login details.`,
        taskType: "Batch Allocation",
        linkedStudentName: studentFullName,
        linkedStudentId: admissionId,
        assignedTo: counsellor || "Unassigned",
        priority: "Medium",
        status: "Pending",
        dueDate: dueIn48h,
        checklist: [
          { text: "Allocate batch schedule in ERP Engine", isCompleted: false },
          { text: "Generate student LMS portal login ID", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: New Admission SOP Step 3"
      });

      const t4 = await Task.create({
        title: `Send Welcome Onboarding Message: ${studentFullName}`,
        description: `Deliver official welcome onboarding kit & WhatsApp guidance package.`,
        taskType: "Welcome Onboarding",
        linkedStudentName: studentFullName,
        linkedStudentId: admissionId,
        assignedTo: counsellor || "Unassigned",
        priority: "Medium",
        status: "Pending",
        dueDate: dueIn48h,
        checklist: [
          { text: "Send Welcome WhatsApp message & student handbook", isCompleted: false },
          { text: "Add student to official batch WhatsApp group", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: New Admission SOP Step 4"
      });

      createdTasks.push(t1, t2, t3, t4);
    }

    // EVENT 4: MISSED EMI PAYMENT
    else if (event === "EMI_MISSED") {
      const { admissionId, studentFullName, counsellor, amountDue, dueDate } = payload;
      const urgentDueDate = new Date(); // Immediate attention

      const recoveryTask = await Task.create({
        title: `URGENT: Recover Missed EMI (₹${amountDue}): ${studentFullName}`,
        description: `Installment payment of ₹${amountDue} was missed on ${dueDate || 'Due Date'}. Immediate recovery call required.`,
        taskType: "EMI Recovery",
        linkedStudentName: studentFullName,
        linkedStudentId: admissionId,
        assignedTo: counsellor || "Unassigned",
        priority: "Urgent / Escalated",
        status: "Escalated",
        isEscalated: true,
        escalatedToManager: "Branch Manager",
        dueDate: urgentDueDate,
        checklist: [
          { text: "Call student/parent to discuss overdue EMI payment", isCompleted: false },
          { text: "Send payment link & WhatsApp payment reminder", isCompleted: false },
          { text: "Update payment recovery status in ERP finance tab", isCompleted: false }
        ],
        autoTriggerSource: "Auto Event: Missed EMI Recovery & Manager Escalation"
      });

      createdTasks.push(recoveryTask);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${createdTasks.length} automated SOP tasks.`,
      count: createdTasks.length,
      tasks: createdTasks
    });

  } catch (error: any) {
    console.error("Auto Trigger Task API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate auto tasks." },
      { status: 500 }
    );
  }
}
