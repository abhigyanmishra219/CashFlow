import dbConnect from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Admission from "@/models/Admission";
import Payment from "@/models/Payment";

export interface DailyReportStats {
  dateStr: string;
  generatedAtStr: string;
  totalLeads: number;
  demoSessions: number;
  admissionsToday: number;
  todaysCollection: number;
  monthlyCollection: number;
  pendingFees: number;
  overdueEmis: number;
}

export async function getDailyReportStats(): Promise<DailyReportStats> {
  await dbConnect();

  const now = new Date();
  
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  // 1. Total Leads today
  const totalLeads = await Enquiry.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // 2. Demo Sessions today (updated or created with demo status)
  const demoSessions = await Enquiry.countDocuments({
    status: { $regex: /demo/i },
    updatedAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // 3. Admissions today
  const admissionsToday = await Admission.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // 4. Today's Collection
  const todaysPaymentAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, total: { $sum: "$amountReceived" } } },
  ]);
  const todaysCollection = todaysPaymentAgg[0]?.total || 0;

  // 5. Monthly Collection
  const monthlyPaymentAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: startOfMonth, $lte: endOfDay } } },
    { $group: { _id: null, total: { $sum: "$amountReceived" } } },
  ]);
  const monthlyCollection = monthlyPaymentAgg[0]?.total || 0;

  // 6. Pending Fees across all active admissions
  const pendingFeesAgg = await Admission.aggregate([
    { $match: { remainingBalance: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$remainingBalance" } } },
  ]);
  const pendingFees = pendingFeesAgg[0]?.total || 0;

  // 7. Overdue EMIs / Active EMI admissions with remaining balance
  const overdueEmis = await Admission.countDocuments({
    remainingBalance: { $gt: 0 },
    hasEmi: true,
  });

  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const generatedAtStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    dateStr,
    generatedAtStr,
    totalLeads,
    demoSessions,
    admissionsToday,
    todaysCollection,
    monthlyCollection,
    pendingFees,
    overdueEmis,
  };
}

export async function getMonthlyReportStats(): Promise<DailyReportStats> {
  await dbConnect();

  const now = new Date();
  
  // Day 1 of current month 00:00:00
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfExecution = new Date(now);

  // 1. Total Leads Month-To-Date (Day 1 to now)
  const totalLeads = await Enquiry.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfExecution },
  });

  // 2. Demo Sessions Month-To-Date
  const demoSessions = await Enquiry.countDocuments({
    status: { $regex: /demo/i },
    updatedAt: { $gte: startOfMonth, $lte: endOfExecution },
  });

  // 3. Admissions Month-To-Date
  const admissionsToday = await Admission.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfExecution },
  });

  // 4. Monthly Collection (Day 1 to now)
  const monthlyPaymentAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: startOfMonth, $lte: endOfExecution } } },
    { $group: { _id: null, total: { $sum: "$amountReceived" } } },
  ]);
  const monthlyCollection = monthlyPaymentAgg[0]?.total || 0;

  // 5. Today's collection
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const todaysPaymentAgg = await Payment.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfExecution } } },
    { $group: { _id: null, total: { $sum: "$amountReceived" } } },
  ]);
  const todaysCollection = todaysPaymentAgg[0]?.total || 0;

  // 6. Pending Fees
  const pendingFeesAgg = await Admission.aggregate([
    { $match: { remainingBalance: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$remainingBalance" } } },
  ]);
  const pendingFees = pendingFeesAgg[0]?.total || 0;

  // 7. Overdue EMIs
  const overdueEmis = await Admission.countDocuments({
    remainingBalance: { $gt: 0 },
    hasEmi: true,
  });

  const dateStr = `Day 1 to ${now.getDate()} ${now.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;

  const generatedAtStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    dateStr,
    generatedAtStr,
    totalLeads,
    demoSessions,
    admissionsToday,
    todaysCollection,
    monthlyCollection,
    pendingFees,
    overdueEmis,
  };
}
