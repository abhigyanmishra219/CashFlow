import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Admission from "@/models/Admission";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Company from "@/models/Company";
import { getUserFromCookies } from "@/lib/helper";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();
    
    const { searchParams } = new URL(req.url);
    let selectedBrand = searchParams.get("brand");



    // Get list of all available brands
    const companyBrands = await Company.distinct("brand");
    const enquiryBrands = await Enquiry.distinct("targetBrand");
    const admissionBrands = await Admission.distinct("brand");
    const brandSet = new Set<string>();
    [...companyBrands, ...enquiryBrands, ...admissionBrands].forEach((b) => {
      if (b && typeof b === "string" && b.trim()) {
        brandSet.add(b.trim());
      }
    });
    let availableBrands = Array.from(brandSet);

    let allowedBrands: string[] | null = null;
    if (currentUser?.brandScope && currentUser.brandScope !== "All Brands" && currentUser.brandScope !== "All") {
      allowedBrands = currentUser.brandScope.split(",").map((b: string) => b.trim());
      availableBrands = availableBrands.filter((b: string) => 
        allowedBrands!.some((ab: string) => ab.toLowerCase() === b.toLowerCase())
      );
    }

    // Build filter queries
    const filterByBrand = selectedBrand && selectedBrand !== "all" && selectedBrand !== "All Brands";
    const enquiryQuery: any = {};
    const admissionQuery: any = {};
    const companyQuery: any = {};

    if (filterByBrand) {
      enquiryQuery.targetBrand = { $regex: new RegExp(`^${selectedBrand}$`, 'i') };
      admissionQuery.brand = { $regex: new RegExp(`^${selectedBrand}$`, 'i') };
      companyQuery.brand = { $regex: new RegExp(`^${selectedBrand}$`, 'i') };
    } else if (allowedBrands) {
      const regexArray = allowedBrands.map(b => new RegExp(`^${b}$`, 'i'));
      enquiryQuery.targetBrand = { $in: regexArray };
      admissionQuery.brand = { $in: regexArray };
      companyQuery.brand = { $in: regexArray };
    }

    // 1. KPI Calculations
    const totalLeads = await Enquiry.countDocuments(enquiryQuery);
    const newLeads = await Enquiry.countDocuments({ ...enquiryQuery, status: "New" });

    // Today's date format (YYYY-MM-DD and start/end of day)
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Follow-ups scheduled for today
    const followUpsToday = await Enquiry.countDocuments({
      ...enquiryQuery,
      "followUps.date": todayStr
    });

    const admissionsCount = await Admission.countDocuments(admissionQuery);

    // Revenue, Collection, Pending Fees calculations
    const admissionsList = await Admission.find(admissionQuery).lean();
    let totalRevenue = 0;
    let totalPendingFees = 0;

    admissionsList.forEach((adm: any) => {
      totalRevenue += Number(adm.finalFee || 0);
      totalPendingFees += Number(adm.remainingBalance || 0);
    });

    // Total collections from Payment model
    const paymentQuery: any = {};
    if (filterByBrand) {
      const admissionIds = admissionsList.map((a: any) => a._id);
      paymentQuery.admissionId = { $in: admissionIds };
    }
    const paymentsList = await Payment.find(paymentQuery).lean();
    let totalCollection = 0;
    paymentsList.forEach((p: any) => {
      totalCollection += Number(p.amountReceived || 0);
    });

    // 2. Lead Pipeline Breakdown
    const pipelineStages = [
      { stage: "New Lead", status: "New", color: "bg-[#2563eb]" },
      { stage: "Contacted", status: "Contacted", color: "bg-[#22c55e]" },
      { stage: "Counselling Scheduled", status: "Counselling Scheduled", color: "bg-[#eab308]" },
      { stage: "Interested", status: "Interested", color: "bg-[#a855f7]" },
      { stage: "Demo Attended", status: "Demo Attended", color: "bg-[#06b6d4]" },
      { stage: "Admitted", status: "Admitted", color: "bg-[#10b981]" }
    ];

    const pipeline = await Promise.all(
      pipelineStages.map(async (item) => {
        const count = await Enquiry.countDocuments({ ...enquiryQuery, status: item.status });
        const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) + "%" : "0%";
        return { label: item.stage, count, pct, color: item.color };
      })
    );

    // 3. 15-Day Leads Trend Data
    const trendDays: { dateLabel: string; newLeads: number; admissions: number; lostLeads: number }[] = [];
    for (let i = 14; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);
      
      const dayLabel = `${dayStart.getDate()} ${dayStart.toLocaleString("en-US", { month: "short" })}`;

      const dayNewLeads = await Enquiry.countDocuments({
        ...enquiryQuery,
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dayAdmissions = await Admission.countDocuments({
        ...admissionQuery,
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dayLost = await import("@/models/LostLeadCounter").then(m => m.default.findOne({ date: dayStart.toISOString().split("T")[0] }).lean());

      trendDays.push({
        dateLabel: dayLabel,
        newLeads: dayNewLeads,
        admissions: dayAdmissions,
        lostLeads: dayLost ? dayLost.count : 0
      });
    }

    // 4. Top Counsellors Stats
    const counsellors = await User.find({ role: "counsellor" }).lean();
    const counsellorStats = await Promise.all(
      counsellors.map(async (c: any, index) => {
        const cName = c.name;
        const cAdmissions = admissionsList.filter((a: any) => a.counsellor === cName);
        const admCount = cAdmissions.length;
        const revSum = cAdmissions.reduce((acc: number, cur: any) => acc + Number(cur.finalFee || 0), 0);
        
        const totalAssignedEnquiries = await Enquiry.countDocuments({
          ...enquiryQuery,
          assignedCrmAdvisor: cName
        });

        const convRate = totalAssignedEnquiries > 0 
          ? ((admCount / totalAssignedEnquiries) * 100).toFixed(1) + "%"
          : (admCount > 0 ? "100%" : "0%");

        const initials = cName ? cName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "C";

        return {
          rank: index + 1,
          id: c._id,
          name: cName,
          initials,
          adm: admCount,
          rev: `₹${(revSum / 100000).toFixed(2)} L`,
          conv: convRate,
          rawRev: revSum
        };
      })
    );

    // Sort counsellors by admissions count descending
    counsellorStats.sort((a, b) => b.adm - a.adm || b.rawRev - a.rawRev);
    counsellorStats.forEach((c, idx) => { c.rank = idx + 1; });

    // 5. Enquiries by Source Breakdown
    const sources = [
      "Google Ads",
      "Meta Ads",
      "Website",
      "Seminar",
      "Hoarding",
      "Reference",
      "Paper Ads",
      "Internet Search",
      "Direct Walkin",
      "Call on Database",
      "Others"
    ];
    const colors = [
      "bg-indigo-500",
      "bg-blue-500",
      "bg-rose-500",
      "bg-[#8b5cf6]",
      "bg-[#ec4899]",
      "bg-[#10b981]",
      "bg-[#f59e0b]",
      "bg-[#06b6d4]",
      "bg-[#14b8a6]",
      "bg-[#9333ea]",
      "bg-slate-300"
    ];
    const sourceColorsHex = [
      "#6366f1",
      "#3b82f6",
      "#f43f5e",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f59e0b",
      "#06b6d4",
      "#14b8a6",
      "#9333ea",
      "#cbd5e1"
    ];

    const enquiriesBySource = await Promise.all(
      sources.map(async (source, i) => {
        const count = await Enquiry.countDocuments({
          ...enquiryQuery,
          leadSource: source === "Others" ? { $nin: sources.slice(0, 10) } : source
        });
        const pctNum = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        return {
          label: source,
          count,
          pct: `${pctNum.toFixed(1)}%`,
          pctNum,
          color: colors[i],
          hex: sourceColorsHex[i]
        };
      })
    );

    // 6. Today's Follow-ups List
    const todayEnquiries = await Enquiry.find({
      ...enquiryQuery,
      "followUps.date": todayStr
    }).limit(5).lean();

    const todayFollowupsList = todayEnquiries.map((e: any) => {
      const todayFollowup = e.followUps?.find((f: any) => f.date === todayStr);
      return {
        id: e._id,
        name: e.studentFullName,
        initials: e.studentFullName ? e.studentFullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "S",
        time: todayFollowup?.time || "Today",
        action: todayFollowup?.typeOfContact || "Follow-up",
        phone: e.primaryPhoneMobile
      };
    });

    // 7. Recent System Activity
    const recentAdmissions = await Admission.find(admissionQuery).sort({ createdAt: -1 }).limit(3).lean();
    const recentEnquiries = await Enquiry.find(enquiryQuery).sort({ createdAt: -1 }).limit(3).lean();

    const recentActivity: { text: string; time: string; color: string }[] = [];

    recentAdmissions.forEach((a: any) => {
      recentActivity.push({
        text: `New admission: ${a.fullName} (${a.course || "Course"})`,
        time: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "text-indigo-500 bg-indigo-50"
      });
    });

    recentEnquiries.forEach((e: any) => {
      recentActivity.push({
        text: `New lead from ${e.leadSource || "direct"}: ${e.studentFullName}`,
        time: new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "text-emerald-500 bg-emerald-50"
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        selectedBrand: selectedBrand || "All Brands",
        availableBrands,
        kpis: {
          totalLeads,
          newLeads,
          followUpsToday,
          admissions: admissionsCount,
          revenue: `₹${(totalRevenue / 100000).toFixed(2)} L`,
          collection: `₹${(totalCollection / 100000).toFixed(2)} L`,
          pendingFees: `₹${(totalPendingFees / 100000).toFixed(2)} L`,
        },
        pipeline,
        trendDays,
        topCounsellors: counsellorStats.slice(0, 5),
        enquiriesBySource,
        todayFollowups: todayFollowupsList,
        recentActivity: recentActivity.slice(0, 5)
      }
    });
  } catch (error: any) {
    console.error("Error in manager-dashboard stats:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to load stats" }, { status: 500 });
  }
}
