import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Admission from "@/models/Admission";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Company from "@/models/Company";
import Brand from "@/models/Brand";
import LostLeadCounter from "@/models/LostLeadCounter";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    let targetStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let targetEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let startStr = todayStr;
    let endStr = todayStr;
    
    let isFiltered = false;
    if (startDateParam && endDateParam) {
      targetStart = new Date(startDateParam);
      targetStart.setHours(0, 0, 0, 0);
      targetEnd = new Date(endDateParam);
      targetEnd.setHours(23, 59, 59, 999);
      startStr = startDateParam; // assuming YYYY-MM-DD
      endStr = endDateParam;
      isFiltered = true;
    }

    const globalFilter = isFiltered ? { createdAt: { $gte: targetStart, $lte: targetEnd } } : {};
    const dateRangeFilter = { $gte: targetStart, $lte: targetEnd };
    const stringDateFilter = { $gte: startStr, $lte: endStr };

    // 1. KPI Calculations
    const [
      totalLeads, 
      newLeadsToday, 
      followUpsToday, 
      walkinsToday,
      admissionsTotal,
      admissionsToday,
      lostLeadsToday,
      pendingFeesCount,
      totalPayments,
      pendingCalls
    ] = await Promise.all([
      Enquiry.countDocuments(globalFilter),
      Enquiry.countDocuments({ createdAt: dateRangeFilter, status: "New" }),
      Enquiry.countDocuments({ "followUps.date": stringDateFilter }),
      Enquiry.countDocuments({ createdAt: dateRangeFilter, leadSource: "Direct Walkin" }),
      Admission.countDocuments(globalFilter),
      Admission.countDocuments({ createdAt: dateRangeFilter }),
      LostLeadCounter.find({ date: { $gte: startStr, $lte: endStr } }).lean(),
      Admission.countDocuments({ ...globalFilter, remainingBalance: { $gt: 0 } }),
      Payment.find(isFiltered ? { date: stringDateFilter } : {}).lean(),
      Enquiry.countDocuments({
        followUps: {
          $elemMatch: {
            date: stringDateFilter,
            status: { $ne: "Completed" }
          }
        }
      })
    ]);

    let totalCollection = 0;
    totalPayments.forEach((p: any) => {
      totalCollection += Number(p.amountReceived || 0);
    });

    const conversionRate = totalLeads > 0 ? ((admissionsTotal / totalLeads) * 100).toFixed(1) + "%" : "0%";

    const kpis = {
      totalLeads,
      newLeadsToday,
      followUpsToday,
      walkinsToday,
      admissionsToday,
      lostLeadsToday: (Array.isArray(lostLeadsToday) ? lostLeadsToday : []).reduce((sum, item) => sum + (item.count || 0), 0),
      conversionRate,
      revenue: `₹${(totalCollection / 100000).toFixed(2)} L`,
      pendingCalls,
      hotLeads: await Enquiry.countDocuments({ ...globalFilter, status: "Negotiation" }),
    };

    // 2. Pipeline Overview
    const pipelineStages = [
      { stage: "New Lead", status: "New", color: "bg-blue-500" },
      { stage: "Contacted", status: "Contacted", color: "bg-sky-500" },
      { stage: "Counselling Scheduled", status: "Counselling Scheduled", color: "bg-orange-400" },
      { stage: "Visited", status: "Demo Attended", color: "bg-purple-500" },
      { stage: "Demo Attended", status: "Demo Attended", color: "bg-teal-500" },
      { stage: "Negotiation", status: "Negotiation", color: "bg-amber-500" },
      { stage: "Admission", status: "Admitted", color: "bg-emerald-500" }
    ];

    const pipeline = await Promise.all(
      pipelineStages.map(async (item) => {
        const count = await Enquiry.countDocuments({ status: item.status });
        const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) + "%" : "0%";
        return { stage: item.stage, count, pct, color: item.color };
      })
    );

    // 3. Trend Line Graph (30 Days)
    const trendDays = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);
      
      const dayLabel = `${dayStart.getDate()} ${dayStart.toLocaleString("en-US", { month: "short" })}`;
      
      const [dayNewLeads, dayAdmissions, dayLost, dayFollowups] = await Promise.all([
        Enquiry.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Admission.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        LostLeadCounter.findOne({ date: dayStart.toISOString().split("T")[0] }).lean(),
        Enquiry.countDocuments({
          "followUps.date": dayStart.toISOString().split("T")[0]
        })
      ]);

      trendDays.push({
        dateLabel: dayLabel,
        newLeads: dayNewLeads,
        admissions: dayAdmissions,
        lostLeads: dayLost ? dayLost.count : 0,
        followUps: dayFollowups
      });
    }

    // 4. Source Distribution
    const sources = ["Instagram", "Google Ads", "Website", "Walk-in", "Facebook", "Others"];
    const colors = ["bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-slate-300"];
    const sourceColorsHex = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#cbd5e1"];

    const dbSourceMap: Record<string, string[]> = {
      "Instagram": ["Meta Ads"],
      "Google Ads": ["Google Ads"],
      "Website": ["Internet Search"],
      "Walk-in": ["Direct Walkin"],
      "Facebook": ["Meta Ads"] // We map Meta Ads to both? Actually let's just query
    };

    const enquiriesBySource = await Promise.all(
      sources.map(async (source, i) => {
        let query: any = {};
        if (source === "Others") {
          query = { leadSource: { $nin: ["Meta Ads", "Google Ads", "Internet Search", "Direct Walkin"] } };
        } else if (source === "Instagram" || source === "Facebook") {
           query = { leadSource: "Meta Ads" }; // Rough proxy
        } else if (source === "Walk-in") {
           query = { leadSource: "Direct Walkin" };
        } else if (source === "Website") {
           query = { leadSource: "Internet Search" };
        } else {
           query = { leadSource: source };
        }
        const count = await Enquiry.countDocuments(query);
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

    // 5. Counsellor Performance
    const counsellors = await User.find({ role: "counsellor" }).lean();
    const admissionsList = await Admission.find().lean();
    
    const counsellorPerformance = await Promise.all(
      counsellors.map(async (c: any) => {
        const cName = c.name;
        const cAdmissions = admissionsList.filter((a: any) => 
          a.counsellor && typeof a.counsellor === 'string' && typeof cName === 'string' && a.counsellor.toLowerCase() === cName.toLowerCase()
        );
        const admCount = cAdmissions.length;
        const revSum = cAdmissions.reduce((acc: number, cur: any) => acc + Number(cur.finalFee || 0), 0);
        
        const escapedCName = (cName || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cNameRegex = new RegExp(`^${escapedCName}$`, "i");

        const totalAssignedEnquiries = await Enquiry.countDocuments({ assignedCrmAdvisor: { $regex: cNameRegex } });
        const followupsCount = await Enquiry.countDocuments({ assignedCrmAdvisor: { $regex: cNameRegex }, "followUps.0": { $exists: true } });

        const convRate = totalAssignedEnquiries > 0 
          ? ((admCount / totalAssignedEnquiries) * 100).toFixed(1) + "%"
          : "0%";

        return {
          name: cName,
          assigned: totalAssignedEnquiries,
          followups: followupsCount,
          admissions: admCount,
          conversion: convRate,
          rawRev: revSum
        };
      })
    );
    counsellorPerformance.sort((a, b) => b.admissions - a.admissions || b.rawRev - a.rawRev);

    // 6. Brand Performance
    const brands = await Brand.find().lean();
    const brandPerformance = await Promise.all(
      brands.map(async (b: any) => {
        const bName = b.name;
        const bAdmissions = admissionsList.filter((a: any) => 
          a.brand && typeof a.brand === 'string' && typeof bName === 'string' && a.brand.toLowerCase() === bName.toLowerCase()
        );
        const bAdmCount = bAdmissions.length;
        const bRevSum = bAdmissions.reduce((acc: number, cur: any) => acc + Number(cur.finalFee || 0), 0);
        
        const escapedBrandName = (bName || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const bLeadsCount = await Enquiry.countDocuments({ 
          targetBrand: { $regex: new RegExp(`^${escapedBrandName}$`, "i") } 
        });

        return {
          name: bName,
          leads: bLeadsCount,
          admissions: bAdmCount,
          revenue: `₹${(bRevSum / 100000).toFixed(2)} L`,
          achievePct: bLeadsCount > 0 ? ((bAdmCount / bLeadsCount) * 100).toFixed(1) + "%" : "0%"
        };
      })
    );
    brandPerformance.sort((a, b) => b.admissions - a.admissions);

    // 7. Company Limit & Utilization
    const companies = await Company.find().lean();
    const companyUtilization = companies.map((c: any) => {
      const cap = Number(c.annualCapacityCap || 1949999);
      const collected = Number(c.collectedRevenue || 0);
      const usedPct = ((collected / cap) * 100).toFixed(1) + "%";
      const remaining = cap - collected;

      return {
        name: c.name,
        collection: `₹${(collected / 100000).toFixed(2)} L`,
        usedPct,
        remaining: `₹${(remaining / 100000).toFixed(2)} L`
      };
    });

    // 8. Work Queue
    const workQueue = {
      followUpsDue: followUpsToday,
      missedCalls: await Enquiry.countDocuments({ "followUps.date": { $lt: todayStr }, status: { $nin: ["Lost", "Admitted"] } }),
      counsellingScheduled: await Enquiry.countDocuments({ status: "Counselling Scheduled" }),
      admissionsWaiting: await Enquiry.countDocuments({ status: "Negotiation" }),
      feePending: pendingFeesCount
    };

    // 9. Recent Activity
    const recentAdmDocs = await Admission.find().sort({ createdAt: -1 }).limit(3).lean();
    const recentLeadDocs = await Enquiry.find().sort({ createdAt: -1 }).limit(3).lean();
    
    const recentActivity: { text: string; time: string; color: string; timestamp: number }[] = [];
    
    recentAdmDocs.forEach((a: any) => {
      recentActivity.push({
        text: `${a.counsellor || 'Someone'} admitted ${a.fullName} to ${a.course || "Course"}`,
        time: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "bg-indigo-500",
        timestamp: new Date(a.createdAt).getTime()
      });
    });

    recentLeadDocs.forEach((e: any) => {
      recentActivity.push({
        text: `New lead from ${e.leadSource || "direct"}: ${e.studentFullName}`,
        time: new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "bg-emerald-500",
        timestamp: new Date(e.createdAt).getTime()
      });
    });

    recentActivity.sort((a, b) => b.timestamp - a.timestamp);

    // 10. Enquiries List
    const allEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(10).lean();
    const enquiriesList = allEnquiries.map((e: any) => ({
      id: e.enquiryId || e._id.toString().substring(0, 8).toUpperCase(),
      dbId: e._id.toString(),
      student: e.studentFullName || "Unknown",
      course: e.targetCourse || "Unspecified",
      counsellor: e.assignedCrmAdvisor || "Unassigned",
      stage: e.status || "New",
      priority: e.leadPriority || "Medium"
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        pipeline,
        trendDays,
        enquiriesBySource,
        counsellorPerformance,
        brandPerformance,
        companyUtilization,
        workQueue,
        recentActivity: recentActivity.slice(0, 5),
        enquiriesList
      }
    });

  } catch (error: any) {
    console.error("Error in admin-dashboard stats:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to load stats" }, { status: 500 });
  }
}
