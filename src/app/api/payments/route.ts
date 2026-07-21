import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Admission from "@/models/Admission";
import Company from "@/models/Company";
import Brand from "@/models/Brand";
import { getUserFromCookies } from "@/lib/helper";
import { sendWhatsAppFeeReceipt } from "@/lib/msg91";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get("admissionId");

    let query: any = {};
    if (admissionId) {
      query.admissionId = admissionId;
    }
    if (user && user.brandScope && user.brandScope !== "All Brands" && user.brandScope !== "All") {
      query.brand = user.brandScope;
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch payments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { admissionId, amountReceived, paymentMode, referenceNo, remarks, company, particulars } = body;

    if (!admissionId || !amountReceived || !paymentMode) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (admissionId, amountReceived, paymentMode)." },
        { status: 400 }
      );
    }

    // 1. Find the admission record
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return NextResponse.json(
        { success: false, message: "Admission record not found." },
        { status: 404 }
      );
    }

    // Auto Company Allocation Engine
    let finalCompany = "Cash";

    if (paymentMode !== "Cash") {
      const previousNonCashPayment = await Payment.findOne({ 
        admissionId, 
        paymentMode: { $ne: "Cash" },
        company: { $nin: ["Cash", "Unallocated"] } 
      });

      if (previousNonCashPayment && previousNonCashPayment.company) {
        finalCompany = previousNonCashPayment.company;
      } else {
        const brandDoc = await Brand.findOne({ name: admission.brand }).lean();
        const brandCompanies = brandDoc?.companies || [];
        
        const availableCompanies = await Company.find({
          $or: [
            { brand: admission.brand },
            { brands: admission.brand },
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
          finalCompany = company || "Unallocated";
        }
      }

      // Update Ledger (increment collectedRevenue)
      if (finalCompany && finalCompany !== "Cash" && finalCompany !== "Unallocated") {
        await Company.updateOne(
          { name: finalCompany },
          { $inc: { collectedRevenue: Number(amountReceived) } }
        );
      }
      
      // Lock future payments
      admission.companyAssigned = finalCompany;
    }

    // 2. Create the payment record
    const payment = new Payment({
      admissionId,
      studentName: admission.fullName,
      amountReceived: Number(amountReceived),
      paymentMode,
      referenceNo,
      remarks,
      company: finalCompany,
      brand: admission.brand,
      particulars,
    });
    await payment.save();

    // 3. Update the admission balance and last transaction details
    admission.remainingBalance = Math.max(0, admission.remainingBalance - Number(amountReceived));
    await admission.save();

    // 4. Dispatch MSG91 WhatsApp Fee Receipt notification
    try {
      if (admission.mobileNumber) {
        sendWhatsAppFeeReceipt({
          studentName: admission.fullName,
          mobileNumber: admission.mobileNumber,
          courseName: admission.course,
          amountPaid: Number(amountReceived),
          paymentDate: new Date(payment.createdAt || Date.now()).toLocaleDateString("en-IN"),
          receiptNo: payment.receiptNo,
        }).catch((err) => console.error("Async MSG91 WhatsApp Error:", err));
      }
    } catch (waErr) {
      console.error("Failed to trigger WhatsApp receipt:", waErr);
    }

    return NextResponse.json(
      { success: true, message: "Payment processed successfully.", data: payment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process payment." },
      { status: 500 }
    );
  }
}
