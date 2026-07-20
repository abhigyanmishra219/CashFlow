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
      startStr = startDateParam;
      endStr = endDateParam;
      isFiltered = true;
    }

    const globalFilter = isFiltered ? { createdAt: { $gte: targetStart, $lte: targetEnd } } : {};
    const dateRangeFilter = { $gte: targetStart, $lte: targetEnd };
    const stringDateFilter = { $gte: startStr, $lte: endStr };

    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    // Parallel execution of all primary data queries using MongoDB Aggregations
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
      pendingCalls,
      hotLeads,
      statusCountsGroup,
      sourceCountsGroup,
      thirtyDayEnquiryTrends,
      thirtyDayAdmissionTrends,
      thirtyDayFollowupTrends,
      lostLeadTrends,
      counsellors,
      admissionsList,
      counsellorEnquiryStatsGroup,
      brands,
      brandEnquiryStatsGroup,
      companies,
      missedCallsCount,
      counsellingScheduledCount,
      admissionsWaitingCount,
      recentAdmDocs,
      recentLeadDocs,
      allEnquiries
    ] = await Promise.all([
      Enquiry.countDocuments(globalFilter),
      Enquiry.countDocuments({ createdAt: dateRangeFilter, status: "New" }),
      Enquiry.countDocuments({ "followUps.date": stringDateFilter }),
      Enquiry.countDocuments({ createdAt: dateRangeFilter, leadSource: "Direct Walkin" }),
      Admission.countDocuments(globalFilter),
      Admission.countDocuments({ createdAt: dateRangeFilter }),
      LostLeadCounter.find({ date: { $gte: startStr, $lte: endStr } }).lean(),
      Admission.countDocuments({ ...globalFilter, remainingBalance: { $gt: 0 } }),
      Payment.find(isFiltered ? { date: stringDateFilter } : {}).select("amountReceived").lean(),
      Enquiry.countDocuments({
        followUps: {
          $elemMatch: {
            date: stringDateFilter,
            status: { $ne: "Completed" }
          }
        }
      }),
      Enquiry.countDocuments({ ...globalFilter, status: "Negotiation" }),
      
      // Status aggregation for Pipeline
      Enquiry.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // Source aggregation for Sources chart
      Enquiry.aggregate([
        { $group: { _id: "$leadSource", count: { $sum: 1 } } }
      ]),

      // 30-Day Trend Aggregations (Replaces 120-query loop with 4 single queries)
      Enquiry.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]),
      Admission.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]),
      Enquiry.aggregate([
        { $unwind: "$followUps" },
        { $match: { "followUps.date": { $gte: thirtyDaysAgoStr } } },
        {
          $group: {
            _id: "$followUps.date",
            count: { $sum: 1 }
          }
        }
      ]),
      LostLeadCounter.find({ date: { $gte: thirtyDaysAgoStr } }).lean(),

      // Counsellor data
      User.find({ role: "counsellor" }).select("name").lean(),
      Admission.find().select("counsellor brand finalFee").lean(),
      Enquiry.aggregate([
        {
          $group: {
            _id: { $toLower: "$assignedCrmAdvisor" },
            totalAssigned: { $sum: 1 },
            followupsCount: {
              $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$followUps", []] } }, 0] }, 1, 0] }
            }
          }
        }
      ]),

      // Brand data
      Brand.find().select("name").lean(),
      Enquiry.aggregate([
        {
          $group: {
            _id: { $toLower: "$targetBrand" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Companies data
      Company.find().select("name annualCapacityCap collectedRevenue").lean(),

      // Work Queue counts
      Enquiry.countDocuments({ "followUps.date": { $lt: todayStr }, status: { $nin: ["Lost", "Admitted"] } }),
      Enquiry.countDocuments({ status: "Counselling Scheduled" }),
      Enquiry.countDocuments({ status: "Negotiation" }),

      // Recent Activity & Table Data
      Admission.find().select("counsellor fullName course createdAt").sort({ createdAt: -1 }).limit(3).lean(),
      Enquiry.find().select("leadSource studentFullName createdAt").sort({ createdAt: -1 }).limit(3).lean(),
      Enquiry.find().select("enquiryId studentFullName targetCourse assignedCrmAdvisor status leadPriority").sort({ createdAt: -1 }).limit(10).lean()
    ]);

    // 1. Process KPIs
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
      hotLeads,
    };

    // 2. Process Pipeline Overview
    const statusMap = new Map(statusCountsGroup.map((g: any) => [g._id, g.count]));
    const pipelineStages = [
      { stage: "New Lead", status: "New", color: "bg-blue-500" },
      { stage: "Contacted", status: "Contacted", color: "bg-sky-500" },
      { stage: "Counselling Scheduled", status: "Counselling Scheduled", color: "bg-orange-400" },
      { stage: "Visited", status: "Demo Attended", color: "bg-purple-500" },
      { stage: "Demo Attended", status: "Demo Attended", color: "bg-teal-500" },
      { stage: "Negotiation", status: "Negotiation", color: "bg-amber-500" },
      { stage: "Admission", status: "Admitted", color: "bg-emerald-500" }
    ];

    const pipeline = pipelineStages.map((item) => {
      const count = (statusMap.get(item.status) as number) || 0;
      const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) + "%" : "0%";
      return { stage: item.stage, count, pct, color: item.color };
    });

    // 3. Process 30-Day Trend
    const enquiryTrendMap = new Map(thirtyDayEnquiryTrends.map((g: any) => [g._id, g.count]));
    const admissionTrendMap = new Map(thirtyDayAdmissionTrends.map((g: any) => [g._id, g.count]));
    const followupTrendMap = new Map(thirtyDayFollowupTrends.map((g: any) => [g._id, g.count]));
    const lostLeadTrendMap = new Map(lostLeadTrends.map((l: any) => [l.date, l.count]));

    const trendDays = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;

      trendDays.push({
        dateLabel: dayLabel,
        newLeads: enquiryTrendMap.get(dateStr) || 0,
        admissions: admissionTrendMap.get(dateStr) || 0,
        lostLeads: lostLeadTrendMap.get(dateStr) || 0,
        followUps: followupTrendMap.get(dateStr) || 0
      });
    }

    // 4. Process Source Distribution
    const sourceMap = new Map(sourceCountsGroup.map((g: any) => [g._id, g.count]));
    const sources = ["Instagram", "Google Ads", "Website", "Walk-in", "Facebook", "Others"];
    const colors = ["bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-slate-300"];
    const sourceColorsHex = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#cbd5e1"];

    const enquiriesBySource = sources.map((source, i) => {
      let count = 0;
      if (source === "Others") {
        const known = (sourceMap.get("Meta Ads") || 0) + (sourceMap.get("Google Ads") || 0) + (sourceMap.get("Internet Search") || 0) + (sourceMap.get("Direct Walkin") || 0);
        count = Math.max(0, totalLeads - known);
      } else if (source === "Instagram" || source === "Facebook") {
        count = sourceMap.get("Meta Ads") || 0;
      } else if (source === "Walk-in") {
        count = sourceMap.get("Direct Walkin") || 0;
      } else if (source === "Website") {
        count = sourceMap.get("Internet Search") || 0;
      } else {
        count = sourceMap.get(source) || 0;
      }
      const pctNum = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
      return {
        label: source,
        count,
        pct: `${pctNum.toFixed(1)}%`,
        pctNum,
        color: colors[i],
        hex: sourceColorsHex[i]
      };
    });

    // 5. Process Counsellor Performance
    const counsellorStatsMap = new Map(counsellorEnquiryStatsGroup.map((g: any) => [g._id, g]));
    const counsellorPerformance = counsellors.map((c: any) => {
      const cName = c.name || "";
      const lowerName = cName.toLowerCase();
      const cAdmissions = admissionsList.filter((a: any) => 
        a.counsellor && typeof a.counsellor === 'string' && a.counsellor.toLowerCase() === lowerName
      );
      const admCount = cAdmissions.length;
      const revSum = cAdmissions.reduce((acc: number, cur: any) => acc + Number(cur.finalFee || 0), 0);
      
      const stats = counsellorStatsMap.get(lowerName) || { totalAssigned: 0, followupsCount: 0 };
      const totalAssignedEnquiries = stats.totalAssigned;
      const followupsCount = stats.followupsCount;

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
    });
    counsellorPerformance.sort((a: any, b: any) => b.admissions - a.admissions || b.rawRev - a.rawRev);

    // 6. Process Brand Performance
    const brandStatsMap = new Map(brandEnquiryStatsGroup.map((g: any) => [g._id, g.count]));
    const brandPerformance = brands.map((b: any) => {
      const bName = b.name || "";
      const lowerBName = bName.toLowerCase();
      const bAdmissions = admissionsList.filter((a: any) => 
        a.brand && typeof a.brand === 'string' && a.brand.toLowerCase() === lowerBName
      );
      const bAdmCount = bAdmissions.length;
      const bRevSum = bAdmissions.reduce((acc: number, cur: any) => acc + Number(cur.finalFee || 0), 0);
      
      const bLeadsCount = brandStatsMap.get(lowerBName) || 0;

      return {
        name: bName,
        leads: bLeadsCount,
        admissions: bAdmCount,
        revenue: `₹${(bRevSum / 100000).toFixed(2)} L`,
        achievePct: bLeadsCount > 0 ? ((bAdmCount / bLeadsCount) * 100).toFixed(1) + "%" : "0%"
      };
    });
    brandPerformance.sort((a: any, b: any) => b.admissions - a.admissions);

    // 7. Process Company Limit & Utilization
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

    // 8. Process Work Queue
    const workQueue = {
      followUpsDue: followUpsToday,
      missedCalls: missedCallsCount,
      counsellingScheduled: counsellingScheduledCount,
      admissionsWaiting: admissionsWaitingCount,
      feePending: pendingFeesCount
    };

    // 9. Process Recent Activity
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

    // 10. Process Enquiries List
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
