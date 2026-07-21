import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admission from "@/models/Admission";
import Enquiry from "@/models/Enquiry";
import Payment from "@/models/Payment";
import Company from "@/models/Company";
import Brand from "@/models/Brand";
import Task from "@/models/Task";
import { getUserFromCookies } from "@/lib/helper";
import { sendWhatsAppFeeReceipt } from "@/lib/msg91";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const data = await req.json();

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      data.brand = data.brand || user.brandScope;
    }

    // Auto Company Allocation Engine
    let finalCompany = "Cash";

    if (data.paymentMode && data.paymentMode !== "Cash") {
      const brandDoc = await Brand.findOne({ name: data.brand }).lean();
      const brandCompanies = brandDoc?.companies || [];
      
      const availableCompanies = await Company.find({
        $or: [
          { brand: data.brand },
          { brands: data.brand },
          { name: { $in: brandCompanies } }
        ],
        status: "ACTIVE"
      });

      if (availableCompanies.length > 0) {
        // Sort by remaining capacity descending
        availableCompanies.sort((a, b) => {
          const capA = (a.annualCapacityCap || 1949999) - (a.collectedRevenue || 0);
          const capB = (b.annualCapacityCap || 1949999) - (b.collectedRevenue || 0);
          return capB - capA;
        });
        
        finalCompany = availableCompanies[0].name;
      } else {
        finalCompany = "Unallocated";
      }

      // Update Ledger (increment collectedRevenue)
      if (finalCompany && finalCompany !== "Cash" && finalCompany !== "Unallocated") {
        if (Number(data.amountReceivedToday) > 0) {
          await Company.updateOne(
            { name: finalCompany },
            { $inc: { collectedRevenue: Number(data.amountReceivedToday) } }
          );
        }
      }
    }

    data.companyAssigned = finalCompany;

    const admission = new Admission(data);
    await admission.save();

    // Optionally update the original enquiry status if enquiryId is present
    if (data.enquiryId) {
      await Enquiry.findByIdAndUpdate(data.enquiryId, { status: "Admitted" });
    }

    // Automatically generate a Payment record for the initial payment collected during admission
    let initialPaymentObj = null;
    if (data.amountReceivedToday > 0) {
      const initialPayment = new Payment({
        admissionId: admission._id,
        studentName: admission.fullName,
        amountReceived: Number(data.amountReceivedToday),
        paymentMode: data.paymentMode || "Cash",
        referenceNo: data.transactionNo || "N/A",
        company: finalCompany,
        brand: data.brand,
        paymentDate: admission.paymentDate || new Date(),
        particulars: {
          courseFeeDue: 0,
          registrationFeeDue: 0,
          materialFeeDue: 0,
          examFeeDue: 0
        },
        remarks: "Initial payment upon admission"
      });
      initialPaymentObj = await initialPayment.save();

      // Trigger MSG91 WhatsApp Fee Receipt notification
      try {
        if (admission.mobileNumber) {
          sendWhatsAppFeeReceipt({
            studentName: admission.fullName,
            mobileNumber: admission.mobileNumber,
            courseName: admission.course,
            amountPaid: Number(data.amountReceivedToday),
            paymentDate: new Date(initialPaymentObj.createdAt || Date.now()).toLocaleDateString("en-IN"),
            receiptNo: initialPaymentObj.receiptNo,
          }).catch((err) => console.error("Async MSG91 WhatsApp Error:", err));
        }
      } catch (waErr) {
        console.error("Failed to trigger WhatsApp receipt:", waErr);
      }
    }

    // AUTO TASK ENGINE: Generate 4 SOP Tasks for Admission Onboarding
    try {
      const due24h = new Date();
      due24h.setDate(due24h.getDate() + 1);

      const due48h = new Date();
      due48h.setDate(due48h.getDate() + 2);

      const counsellorName = admission.counsellor || user?.name || "Unassigned";

      await Task.create([
        {
          title: `Document Collection & Verification: ${admission.fullName}`,
          description: `Collect Govt ID proof, past marksheets, and passport photo for ${admission.course}.`,
          taskType: "Document Collection",
          linkedStudentName: admission.fullName,
          linkedStudentId: admission._id.toString(),
          assignedTo: counsellorName,
          priority: "High",
          status: "Pending",
          dueDate: due24h,
          checklist: [
            { text: "Verify Aadhaar / Govt Identity Card", isCompleted: false },
            { text: "Upload educational marksheets & photo", isCompleted: false }
          ],
          autoTriggerSource: "Auto Event: New Admission SOP Step 1"
        },
        {
          title: `First Installment Receipt & Ledger Sync: ${admission.fullName}`,
          description: `Ensure registration fee receipt is issued and ledger is verified.`,
          taskType: "Fee Collection",
          linkedStudentName: admission.fullName,
          linkedStudentId: admission._id.toString(),
          assignedTo: counsellorName,
          priority: "High",
          status: "Pending",
          dueDate: due24h,
          checklist: [
            { text: "Confirm payment credit in bank/ledger", isCompleted: true },
            { text: "Generate official PDF payment receipt", isCompleted: true }
          ],
          autoTriggerSource: "Auto Event: New Admission SOP Step 2"
        },
        {
          title: `Batch Allocation & LMS Credentials: ${admission.fullName}`,
          description: `Assign batch timing in ERP and send LMS portal credentials.`,
          taskType: "Batch Allocation",
          linkedStudentName: admission.fullName,
          linkedStudentId: admission._id.toString(),
          assignedTo: counsellorName,
          priority: "Medium",
          status: "Pending",
          dueDate: due48h,
          checklist: [
            { text: "Allocate batch schedule in ERP Engine", isCompleted: false },
            { text: "Create student LMS portal account", isCompleted: false }
          ],
          autoTriggerSource: "Auto Event: New Admission SOP Step 3"
        },
        {
          title: `Send Welcome Onboarding Package: ${admission.fullName}`,
          description: `Deliver official welcome onboarding handbook & WhatsApp package.`,
          taskType: "Welcome Onboarding",
          linkedStudentName: admission.fullName,
          linkedStudentId: admission._id.toString(),
          assignedTo: counsellorName,
          priority: "Medium",
          status: "Pending",
          dueDate: due48h,
          checklist: [
            { text: "Send Welcome WhatsApp message & student handbook", isCompleted: false },
            { text: "Add student to official batch WhatsApp group", isCompleted: false }
          ],
          autoTriggerSource: "Auto Event: New Admission SOP Step 4"
        }
      ]);
    } catch (taskErr) {
      console.error("Auto task SOP generation failed on admission:", taskErr);
    }

    return NextResponse.json(
      { success: true, message: "Admission generated successfully", data: admission, payment: initialPaymentObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admission Creation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate admission" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    let brand = searchParams.get("brand");

    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      brand = user.brandScope;
    }

    let query: any = {};
    if (q) {
      const regex = new RegExp(q, "i");
      const cleanQ = q.replace(/[\s-]/g, "");
      const cleanRegex = new RegExp(cleanQ, "i");

      query.$or = [
        { fullName: regex },
        { admissionId: regex },
        { mobileNumber: cleanRegex },
        { email: regex },
      ];
    }

    if (brand && brand !== "all") {
      query.brand = brand;
    }

    const enquiryQuery: any = {};
    if (brand && brand !== "all") {
      enquiryQuery.targetBrand = brand;
    }
    const totalEnquiries = await Enquiry.countDocuments(enquiryQuery);

    const admissions = await Admission.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: admissions, totalEnquiries });
  } catch (error: any) {
    console.error("Fetch Admissions Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch admissions" },
      { status: 500 }
    );
  }
}
