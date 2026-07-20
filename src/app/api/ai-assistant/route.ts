import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { prompt, userRole, userName, userEmail, userBrandScope } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const queryLower = prompt.toLowerCase().trim();

    // CRM-specific keywords list
    const crmKeywords = [
      "lead", "student", "enquiry", "enquiries", "demo", "demos", "follow-up", "followup", "task", "tasks",
      "admission", "admissions", "admit", "fee", "fees", "counselor", "counsellor", "advisor",
      "course", "courses", "hot", "high priority", "phone", "contact", "status", "pipeline",
      "performance", "leaderboard", "brand", "manager", "my", "me",
      "summary", "overview", "stats", "statistics", "report", "today", "yesterday", "recent"
    ];

    const isCRMIntent = crmKeywords.some(kw => queryLower.includes(kw));

    // Fetch all active enquiries from MongoDB
    const allEnquiries = await Enquiry.find({}).sort({ createdAt: -1 }).lean();

    // APPLY STRICT ROLE-BASED ACCESS CONTROL (RBAC) DATA FILTERING
    const role = (userRole || "counsellor").toLowerCase().trim();
    const nameLower = (userName || "").toLowerCase().trim();
    const emailLower = (userEmail || "").toLowerCase().trim();

    let enquiries: any[] = [];
    let roleNotice = "";

    if (role === "admin" || role === "superadmin") {
      enquiries = allEnquiries;
      roleNotice = "Admin Scope (Full Application Access)";
    } else if (role === "brand manager" || role === "manager") {
      const allowedBrands = (userBrandScope || "").split(",").map((b: string) => b.trim().toLowerCase()).filter(Boolean);
      if (allowedBrands.length > 0) {
        enquiries = allEnquiries.filter((e: any) => {
          const b = (e.targetBrand || e.brand || "").toLowerCase().trim();
          return allowedBrands.some((ab: string) => b.includes(ab) || ab.includes(b));
        });
      } else {
        enquiries = allEnquiries;
      }
      roleNotice = `Brand Manager Scope (${userBrandScope || 'Assigned Brands'})`;
    } else {
      // Counsellor Role: Restricted STRICTLY to leads assigned to this counsellor!
      enquiries = allEnquiries.filter((e: any) => {
        const advisor = (e.assignedCrmAdvisor || "").toLowerCase().trim();
        return (nameLower && advisor.includes(nameLower)) || (emailLower && advisor.includes(emailLower));
      });
      roleNotice = `Counsellor Scope (Assigned Leads Only for ${userName || 'Counsellor'})`;
    }

    // 1. ROLE RESTRICTION CHECK FOR COUNSELLORS ASKING FOR COMPANY-WIDE LEADERBOARD
    if (role === "counsellor" && (queryLower.includes("leaderboard") || queryLower.includes("all counsellor") || queryLower.includes("all counselor"))) {
      const myDemos = enquiries.filter((e: any) => e.isDemoScheduled || (e.demos && e.demos.length > 0)).length;
      const myAdmissions = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim() === "admitted").length;

      return NextResponse.json({
        answer: `🔒 **Role-Based Access Control Notice**:\n\nAs a **Counsellor**, your AI Assistant is authorized to access and query data strictly assigned to your profile (${userName || 'Your Profile'}).\n\n📊 **Your Personal Performance Summary**:\n- 📥 **Assigned Leads**: ${enquiries.length}\n- 🎥 **Demos Conducted**: ${myDemos}\n- 🎓 **Admissions Converted**: ${myAdmissions}`,
        leads: enquiries.slice(0, 5),
        stats: {
          myLeads: enquiries.length,
          myDemos,
          myAdmissions
        }
      });
    }

    // 2. PERFORMANCE & LEADERBOARD QUERY (ADMIN & BRAND MANAGER ACCESS)
    if (queryLower.includes("performance") || queryLower.includes("leaderboard") || queryLower.includes("counselor") || queryLower.includes("counsellor") || queryLower.includes("brand manager")) {
      const counsellorStats: Record<string, { name: string; total: number; demos: number; admissions: number; revenue: number }> = {};
      const brandStats: Record<string, { name: string; total: number; demos: number; admissions: number; revenue: number }> = {};

      enquiries.forEach((e: any) => {
        const advisorRaw = (e.assignedCrmAdvisor || "Unassigned").trim();
        const advisorKey = advisorRaw.toLowerCase();

        const brandRaw = (e.targetBrand || e.brand || "Default Brand").trim();
        const brandKey = brandRaw.toLowerCase();

        if (!counsellorStats[advisorKey]) {
          counsellorStats[advisorKey] = { name: advisorRaw, total: 0, demos: 0, admissions: 0, revenue: 0 };
        }
        if (!brandStats[brandKey]) {
          brandStats[brandKey] = { name: brandRaw, total: 0, demos: 0, admissions: 0, revenue: 0 };
        }

        counsellorStats[advisorKey].total++;
        brandStats[brandKey].total++;

        const statusLower = (e.status || "").toLowerCase().trim();

        if (e.isDemoScheduled || (e.demos && e.demos.length > 0) || statusLower.includes("demo")) {
          counsellorStats[advisorKey].demos++;
          brandStats[brandKey].demos++;
        }

        if (statusLower === "admitted") {
          counsellorStats[advisorKey].admissions++;
          brandStats[brandKey].admissions++;

          const fee = parseFloat(String(e.feesCollected || e.expectedConversionFee || "0").replace(/[^0-9.]/g, ""));
          const feeVal = isNaN(fee) ? 0 : fee;
          counsellorStats[advisorKey].revenue += feeVal;
          brandStats[brandKey].revenue += feeVal;
        }
      });

      const cList = Object.values(counsellorStats).map(c => ({
        ...c,
        convRate: c.total > 0 ? ((c.admissions / c.total) * 100).toFixed(1) : "0.0"
      })).sort((a, b) => b.revenue - a.revenue);

      const bList = Object.values(brandStats).map(b => ({
        ...b,
        convRate: b.total > 0 ? ((b.admissions / b.total) * 100).toFixed(1) : "0.0"
      })).sort((a, b) => b.revenue - a.revenue);

      const cSummary = cList.map(c => `- 🏆 **${c.name}**: ${c.admissions} Admissions | ${c.demos} Demos | ₹${c.revenue.toLocaleString('en-IN')} Revenue (${c.convRate}% Conv)`).join('\n');
      const bSummary = bList.map(b => `- 🏢 **${b.name}**: ${b.admissions} Admissions | ${b.total} Total Leads (${b.convRate}% Conv)`).join('\n');

      return NextResponse.json({
        answer: `🏆 **Team Performance & Conversion Leaderboard** (*${roleNotice}*):\n\n**Counsellor Performance Breakdown**:\n${cSummary || "No counsellor data recorded yet."}\n\n**Brand Scope Performance Breakdown**:\n${bSummary || "No brand data recorded yet."}`,
        leads: enquiries.slice(0, 5),
        stats: {
          counsellorsCount: cList.length,
          brandsCount: bList.length
        }
      });
    }

    // 3. DEMO CLASSES QUERY (ROLE-BASED)
    if (queryLower.includes("demo") || queryLower.includes("class")) {
      const demoLeads = enquiries.filter((e: any) => {
        const hasDemos = e.demos && e.demos.length > 0;
        const statusLower = (e.status || "").toLowerCase().trim();
        const isScheduled = e.isDemoScheduled || statusLower.includes("demo");
        const hasDemoTask = (e.followUps || []).some((f: any) => 
          (f.typeOfContact || "").toLowerCase().includes("demo") || (f.remarks || "").toLowerCase().includes("demo")
        );
        return hasDemos || isScheduled || hasDemoTask;
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const todayDemos = demoLeads.filter((e: any) => {
        if (e.demoDate === todayStr) return true;
        if ((e.demos || []).some((d: any) => d.date === todayStr)) return true;
        if ((e.followUps || []).some((f: any) => f.date === todayStr && ((f.typeOfContact || "").toLowerCase().includes("demo") || (f.remarks || "").toLowerCase().includes("demo")))) return true;
        return false;
      });

      return NextResponse.json({
        answer: `📊 **Demo Classes Summary** (*${roleNotice}*):\n\n- **Total Demo Sessions**: ${demoLeads.length}\n- **Demos Scheduled For Today (${todayStr})**: ${todayDemos.length}\n\nHere are the top demo student profiles in your authorized scope:`,
        leads: demoLeads.slice(0, 8),
        stats: {
          totalDemos: demoLeads.length,
          todayDemos: todayDemos.length
        }
      });
    }

    // 4. HIGH PRIORITY / HOT LEADS QUERY (ROLE-BASED)
    if (queryLower.includes("hot") || queryLower.includes("high") || queryLower.includes("priority")) {
      const highPriorityLeads = enquiries.filter((e: any) => {
        const pLevel = (e.priorityLevel || e.priority || "").toLowerCase().trim();
        const hasHighTask = (e.followUps || []).some((f: any) => (f.priority || "").toLowerCase().trim() === "high");
        return pLevel === "high" || hasHighTask;
      });

      return NextResponse.json({
        answer: `🔥 **High Priority (Hot) Leads** (*${roleNotice}*):\n\nFound **${highPriorityLeads.length} high priority student leads** in your authorized scope:`,
        leads: highPriorityLeads.slice(0, 10),
        stats: {
          hotLeadsCount: highPriorityLeads.length
        }
      });
    }

    // 5. ADMISSIONS & REVENUE QUERY (ROLE-BASED)
    if (queryLower.includes("admit") || queryLower.includes("admission") || queryLower.includes("fee") || queryLower.includes("collected")) {
      const admittedLeads = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim() === "admitted");
      const totalFeeCollected = enquiries.reduce((sum: number, e: any) => {
        const feeNum = parseFloat(String(e.feesCollected || e.expectedConversionFee || "0").replace(/[^0-9.]/g, ""));
        return sum + (isNaN(feeNum) ? 0 : feeNum);
      }, 0);

      return NextResponse.json({
        answer: `🎓 **Admissions & Financial Summary** (*${roleNotice}*):\n\n- **Total Converted Admissions**: ${admittedLeads.length}\n- **Recorded Fee Collection**: ₹${totalFeeCollected.toLocaleString('en-IN')}\n\nBelow are the recent student admission profiles in your authorized scope:`,
        leads: admittedLeads.length > 0 ? admittedLeads.slice(0, 8) : enquiries.slice(0, 5),
        stats: {
          totalAdmissions: admittedLeads.length,
          totalRevenue: totalFeeCollected
        }
      });
    }

    // 6. FOLLOW-UP TASKS QUERY (ROLE-BASED)
    if (queryLower.includes("follow") || queryLower.includes("task") || queryLower.includes("pending")) {
      let pendingCount = 0;
      const leadsWithPendingTasks: any[] = [];

      enquiries.forEach((e: any) => {
        const pendingTasks = (e.followUps || []).filter((f: any) => !f.isCompleted && (f.status || "").toLowerCase().trim() !== "completed");
        if (pendingTasks.length > 0) {
          pendingCount += pendingTasks.length;
          leadsWithPendingTasks.push({
            ...e,
            pendingTasksCount: pendingTasks.length
          });
        }
      });

      return NextResponse.json({
        answer: `⏳ **Pending Follow-up Tasks Summary** (*${roleNotice}*):\n\n- **Total Active Pending Tasks**: ${pendingCount}\n- **Students with Pending Tasks**: ${leadsWithPendingTasks.length}\n\nHere are the top profiles with pending follow-up interactions:`,
        leads: leadsWithPendingTasks.slice(0, 8),
        stats: {
          pendingTasks: pendingCount
        }
      });
    }

    // 7. DIRECT STUDENT SEARCH (ROLE-BASED)
    const directMatches = enquiries.filter((e: any) => {
      const searchHaystack = `${e.studentFullName || ''} ${e.phone || ''} ${e.targetCourse || ''} ${e.assignedCrmAdvisor || ''} ${e.enquiryId || ''}`.toLowerCase();
      return queryLower.split(' ').some(word => word.length > 2 && searchHaystack.includes(word));
    });

    if (directMatches.length > 0) {
      return NextResponse.json({
        answer: `🔍 **Application Search Results** (*${roleNotice}*):\n\nFound **${directMatches.length} matching student records** in your authorized dataset for query "*${prompt}*":`,
        leads: directMatches.slice(0, 8),
        stats: {
          matchesCount: directMatches.length
        }
      });
    }

    // 8. EXPLICIT GENERAL CRM SUMMARY REQUEST (ROLE-BASED)
    const summaryKeywords = ["summary", "overview", "stats", "pipeline", "dashboard", "health", "all leads"];
    if (summaryKeywords.some(kw => queryLower.includes(kw))) {
      const totalLeads = enquiries.length;
      const newLeads = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim() === "new").length;
      const contactedLeads = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim() === "contacted").length;
      const demoLeads = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim().includes("demo")).length;
      const admittedLeads = enquiries.filter((e: any) => (e.status || "").toLowerCase().trim() === "admitted").length;

      return NextResponse.json({
        answer: `📊 **CashFlow CRM Summary** (*${roleNotice}*):\n\n- 📥 **Authorized Enquiries**: ${totalLeads}\n- 🆕 **New Uncontacted Leads**: ${newLeads}\n- 📞 **Contacted Leads**: ${contactedLeads}\n- 🎥 **Demo Scheduled/Attended**: ${demoLeads}\n- 🎓 **Admitted Students**: ${admittedLeads}\n\nHere are the active student leads in your authorized scope:`,
        leads: enquiries.slice(0, 6),
        stats: {
          totalLeads,
          newLeads,
          demoLeads,
          admittedLeads
        }
      });
    }

    // 9. UNWANTED / NON-CRM QUERY
    return NextResponse.json({
      answer: `⚠️ **Query Out of Scope**: I am your **CashFlow CRM AI Assistant**, specially configured to access and answer questions only about your authorized application data (*${roleNotice}*).\n\nYour question "*${prompt}*" does not match any student record or CRM feature in your scope. Please ask a question related to your student enquiries!`,
      leads: [],
      stats: null
    });

  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI inquiry: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
