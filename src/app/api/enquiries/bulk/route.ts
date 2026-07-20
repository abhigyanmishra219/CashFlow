import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import User from "@/models/User";
import { getUserFromCookies } from "@/lib/helper";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const leadsBatch = await req.json();
    const currentUser = await getUserFromCookies();

    // Fetch all counsellors for round-robin assignment
    const allCounsellors = await User.find({ role: "counsellor" }).lean();
    const brandIndexMap: Record<string, number> = {};

    if (!Array.isArray(leadsBatch)) {
      return NextResponse.json(
        { success: false, message: "Payload must be a JSON Array of leads." },
        { status: 400 }
      );
    }

    if (leadsBatch.length === 0) {
      return NextResponse.json(
        { success: false, message: "Empty leads batch payload." },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const finalLeads: any[] = [];
    const seenPhones = new Set<string>();

    // 1. Basic validation and internal duplicate check
    for (let i = 0; i < leadsBatch.length; i++) {
      const row = leadsBatch[i];
      const rowNum = i + 1;

      // Brand determination with user brandScope fallback
      const userBrandScope = (currentUser?.brandScope && currentUser.brandScope !== "All Brands" && currentUser.brandScope !== "All")
        ? currentUser.brandScope
        : "";
      const leadBrand = String(row.brand || userBrandScope || "").trim();

      if (!row.name || !row.mobile || !leadBrand || !row.course) {
        errors.push(`Row ${rowNum}: Missing required fields (Name, Mobile, Brand, Course).`);
        continue;
      }

      const mobileStr = String(row.mobile).trim();
      if (seenPhones.has(mobileStr)) {
        errors.push(`Row ${rowNum}: Duplicate phone number '${mobileStr}' within the uploaded file.`);
        continue;
      }
      seenPhones.add(mobileStr);

      // Format fee if raw number/text
      let feeVal = String(row.expectedFee || "0").trim();
      if (!feeVal.includes("₹")) {
        const numFee = parseFloat(feeVal.replace(/[^\d.]/g, ""));
        if (!isNaN(numFee) && numFee > 0) {
          feeVal = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(numFee);
        } else {
            feeVal = "₹0";
        }
      }

      // Round-robin assignment logic or counsellor self-assignment
      const eligibleCounsellors = allCounsellors.filter((c: any) => 
        c.brandScope?.toLowerCase() === leadBrand.toLowerCase() || c.brandScope === "All Brands" || c.brandScope === "All"
      );
      
      let assignedName = currentUser?.name || "Unassigned";
      
      if (currentUser?.role === "counsellor" && currentUser?.name) {
        assignedName = currentUser.name;
      } else if (eligibleCounsellors.length > 0) {
        if (brandIndexMap[leadBrand] === undefined) {
          brandIndexMap[leadBrand] = 0;
        }
        const cIndex = brandIndexMap[leadBrand] % eligibleCounsellors.length;
        assignedName = eligibleCounsellors[cIndex].name;
        brandIndexMap[leadBrand]++;
      }

      const todayDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      finalLeads.push({
        studentFullName: String(row.name).trim(),
        primaryPhoneMobile: mobileStr,
        parentsFullName: row.parentName ? String(row.parentName).trim() : "",
        parentsPhoneNumber: row.parentMobile ? String(row.parentMobile).trim() : "",
        emailAddress: row.email ? String(row.email).trim() : "",
        currentCity: row.city ? String(row.city).trim() : "",
        targetCourse: String(row.course).trim(),
        targetBrand: leadBrand,
        leadSource: row.leadSource ? String(row.leadSource).trim() : "Bulk Import",
        leadPriority: row.priority ? String(row.priority).trim() : "Medium",
        expectedCourseFee: feeVal,
        remarks: row.remarks ? String(row.remarks).trim() : "",
        assignedCrmAdvisor: assignedName,
        status: "New",
        followUps: [
          {
            date: todayDate,
            time: currentTime,
            priority: row.priority ? String(row.priority).trim() : "Medium",
            typeOfContact: "Initial Contact",
            remarks: row.remarks ? String(row.remarks).trim() : "New lead uploaded and assigned",
            status: "Pending",
            plannedBy: currentUser?.name || "System",
            isCompleted: false,
          }
        ]
      });
    }

    if (finalLeads.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid leads to import.", errors },
        { status: 400 }
      );
    }

    // 2. Database duplicate check
    const phonesToCheck = finalLeads.map((c) => c.primaryPhoneMobile);
    const existingLeads = await Enquiry.find({ primaryPhoneMobile: { $in: phonesToCheck } }).select("primaryPhoneMobile").lean();
    const existingPhones = new Set(existingLeads.map((c: any) => c.primaryPhoneMobile));

    const leadsToInsert: any[] = [];
    finalLeads.forEach((c) => {
      if (existingPhones.has(c.primaryPhoneMobile)) {
        errors.push(`Lead with phone '${c.primaryPhoneMobile}' already exists in database.`);
      } else {
        leadsToInsert.push(c);
      }
    });

    if (leadsToInsert.length === 0) {
      return NextResponse.json(
        { success: false, message: "All leads in this file already exist in the database.", errors },
        { status: 400 }
      );
    }

    // 3. Save sequentially to avoid race condition with ENQ ID generation
    const insertedLeads = [];
    for (const leadData of leadsToInsert) {
        const newLead = new Enquiry(leadData);
        await newLead.save();
        insertedLeads.push(newLead);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully imported ${insertedLeads.length} leads.`,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error bulk importing leads:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to bulk import leads." },
      { status: 500 }
    );
  }
}
