"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useUser } from "../app/component/context/user-context";
import Sidebar from "@/components/Sidebar";
import ManagerSidebar from "@/components/ManagerSidebar";
import ProfileDisplay from "@/components/ProfileDisplay";

interface ReportsPageContentProps {
  role: "admin" | "manager";
}

const AVAILABLE_COLUMNS = [
  { id: "studentName", label: "Student Name" },
  { id: "mobileNumber", label: "Mobile Number" },
  { id: "email", label: "Email" },
  { id: "course", label: "Course" },
  { id: "brand", label: "Brand" },
  { id: "company", label: "Company" },
  { id: "receiptNo", label: "Receipt No" },
  { id: "amountReceived", label: "Amount Received" },
  { id: "paymentDate", label: "Payment Date" },
  { id: "paymentMode", label: "Payment Mode" },
];

export default function ReportsPageContent({ role }: ReportsPageContentProps) {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(AVAILABLE_COLUMNS.map(c => c.id));
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [adminPhone, setAdminPhone] = useState("919335913286");
  const [isSendingWhatsAppReport, setIsSendingWhatsAppReport] = useState(false);
  const [waReportStatus, setWaReportStatus] = useState({ text: "", type: "" });
  const [isSendingMonthlyReport, setIsSendingMonthlyReport] = useState(false);
  const [monthlyReportStatus, setMonthlyReportStatus] = useState({ text: "", type: "" });

  useEffect(() => {
    const rawUserPhone = (user as any)?.phone || (user as any)?.mobile || (user as any)?.phoneNumber || (user as any)?.mobileNumber;
    if (rawUserPhone) {
      let digits = rawUserPhone.toString().replace(/\D/g, "");
      if (digits.length === 10) digits = `91${digits}`;
      if (digits) setAdminPhone(digits);
    }
  }, [user]);

  const handleSendDailyWhatsAppReport = async () => {
    setIsSendingWhatsAppReport(true);
    setWaReportStatus({ text: "Gathering metrics & generating PDF report...", type: "info" });
    try {
      const res = await fetch("/api/reports/daily/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMobileNumber: adminPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaReportStatus({
          text: `Daily Report PDF successfully sent to ${adminPhone}! (Leads: ${data.stats?.totalLeads}, Today Coll: ₹${Number(data.stats?.todaysCollection || 0).toLocaleString('en-IN')})`,
          type: "success",
        });
      } else {
        setWaReportStatus({
          text: data.message || "Failed to send WhatsApp daily report.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      setWaReportStatus({ text: err.message || "Failed to trigger report.", type: "error" });
    } finally {
      setIsSendingWhatsAppReport(false);
    }
  };

  const handleSendMonthlyWhatsAppReport = async () => {
    setIsSendingMonthlyReport(true);
    setMonthlyReportStatus({ text: "Gathering Month-To-Date (Day 1 to Today) metrics & generating PDF...", type: "info" });
    try {
      const res = await fetch("/api/reports/monthly/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminMobileNumber: adminPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMonthlyReportStatus({
          text: `Monthly MTD Report PDF successfully sent to ${adminPhone}! (MTD Leads: ${data.stats?.totalLeads}, Monthly Coll: ₹${Number(data.stats?.monthlyCollection || 0).toLocaleString('en-IN')})`,
          type: "success",
        });
      } else {
        setMonthlyReportStatus({
          text: data.message || "Failed to send Monthly WhatsApp report.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      setMonthlyReportStatus({ text: err.message || "Failed to trigger report.", type: "error" });
    } finally {
      setIsSendingMonthlyReport(false);
    }
  };

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedColumns.length === 0) {
      setMessage({ text: "Please select at least one column to include in the report.", type: "error" });
      return;
    }

    setIsGenerating(true);
    setMessage({ text: "Fetching data...", type: "info" });

    try {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);

      const res = await fetch(`/api/reports/collections?${query.toString()}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch data");
      }

      const payments = data.data;
      if (payments.length === 0) {
        setMessage({ text: "No collections found for the selected date range.", type: "error" });
        setIsGenerating(false);
        return;
      }

      setMessage({ text: "Generating Excel file...", type: "info" });
      await generateExcel(payments);
      
      setMessage({ text: "Report downloaded successfully!", type: "success" });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "An error occurred while generating the report.", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcel = async (payments: any[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Coach CRM";
    workbook.created = new Date();

    // Organize data
    const collectionsByBrand: Record<string, any[]> = {};
    const collectionsByCompany: Record<string, any[]> = {};
    const brandTotals: Record<string, number> = {};
    const companyTotals: Record<string, number> = {};

    payments.forEach((payment) => {
      const admission = payment.admissionId || {};
      const brand = admission.brand || "Unknown Brand";
      const company = admission.companyAssigned || "Unknown Company";
      const amount = payment.amountReceived || 0;

      // Brand groupings
      if (!collectionsByBrand[brand]) collectionsByBrand[brand] = [];
      collectionsByBrand[brand].push(payment);
      brandTotals[brand] = (brandTotals[brand] || 0) + amount;

      // Company groupings
      if (!collectionsByCompany[company]) collectionsByCompany[company] = [];
      collectionsByCompany[company].push(payment);
      companyTotals[company] = (companyTotals[company] || 0) + amount;
    });

    // --- SHEET 1: SUMMARY ---
    const summarySheet = workbook.addWorksheet("Summary");
    
    // Brand Summary
    summarySheet.addRow(["COLLECTION SUMMARY BY BRAND"]);
    summarySheet.addRow(["Brand", "Total Collected (INR)"]);
    Object.entries(brandTotals).forEach(([brand, total]) => {
      summarySheet.addRow([brand, total]);
    });
    summarySheet.addRow([]); // Empty row
    
    // Company Summary
    summarySheet.addRow(["COLLECTION SUMMARY BY COMPANY"]);
    summarySheet.addRow(["Company", "Total Collected (INR)"]);
    Object.entries(companyTotals).forEach(([company, total]) => {
      summarySheet.addRow([company, total]);
    });

    // Format Summary Sheet
    summarySheet.getColumn(1).width = 30;
    summarySheet.getColumn(2).width = 25;
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getRow(2).font = { bold: true };
    const companyStartRow = Object.keys(brandTotals).length + 4;
    summarySheet.getRow(companyStartRow).font = { bold: true, size: 14 };
    summarySheet.getRow(companyStartRow + 1).font = { bold: true };

    // Define columns based on selection
    const excelColumns = AVAILABLE_COLUMNS
      .filter(col => selectedColumns.includes(col.id))
      .map(col => ({
        header: col.label,
        key: col.id,
        width: 20
      }));

    // Helper to format a row
    const formatRow = (payment: any) => {
      const admission = payment.admissionId || {};
      return {
        studentName: admission.fullName || payment.studentName || "N/A",
        mobileNumber: admission.mobileNumber || "N/A",
        email: admission.email || "N/A",
        course: admission.course || "N/A",
        brand: admission.brand || "N/A",
        company: admission.companyAssigned || "N/A",
        receiptNo: payment.receiptNo,
        amountReceived: payment.amountReceived,
        paymentDate: new Date(payment.paymentDate).toLocaleDateString(),
        paymentMode: payment.paymentMode
      };
    };

    // --- BRAND SHEETS ---
    Object.entries(collectionsByBrand).forEach(([brand, brandPayments]) => {
      // Clean sheet name (Excel limits to 31 chars and no special chars like ? * / \ [ ])
      const safeBrandName = brand.replace(/[?*/\\[\]]/g, '').substring(0, 31);
      const sheet = workbook.addWorksheet(safeBrandName);
      sheet.columns = excelColumns;
      sheet.getRow(1).font = { bold: true };

      brandPayments.forEach(payment => {
        sheet.addRow(formatRow(payment));
      });
    });

    // --- COMPANY SHEETS ---
    Object.entries(collectionsByCompany).forEach(([company, companyPayments]) => {
      const safeCompanyName = company.replace(/[?*/\\[\]]/g, '').substring(0, 31);
      
      // If a brand and company have the exact same name, we need to ensure unique sheet names
      let finalSheetName = safeCompanyName;
      if (workbook.getWorksheet(finalSheetName)) {
        finalSheetName = (safeCompanyName + " (Comp)").substring(0, 31);
      }
      
      const sheet = workbook.addWorksheet(finalSheetName);
      sheet.columns = excelColumns;
      sheet.getRow(1).font = { bold: true };

      companyPayments.forEach(payment => {
        sheet.addRow(formatRow(payment));
      });
    });

    // Generate blob and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Collections_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 font-sans overflow-hidden">
      {role === "admin" ? <Sidebar /> : <ManagerSidebar />}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header Area */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Reports</h2>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-slate-700 leading-tight">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
          <div>
            <h2 className="text-3xl font-black text-[#1e293b] tracking-tight">Data Exports</h2>
            <p className="text-slate-500 font-medium mt-1">Export comprehensive collections data and insights to Excel</p>
          </div>

          {/* Daily WhatsApp Report Trigger Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-emerald-200/80 rounded-3xl shadow-xl shadow-emerald-900/5 overflow-hidden ring-1 ring-emerald-100"
          >
            <div className="p-6 border-b border-emerald-100 bg-emerald-50/50 flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Daily WhatsApp Executive Report
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Automated 24-hour midnight dispatch & on-demand force trigger (Midnight to current time metrics in PDF format).
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                MSG91 Template: dailyreport
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Admin Mobile Number
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="e.g. 919335913286"
                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Includes: Total Leads, Demo Sessions, Admissions, Today's & Monthly Collection, Pending Fees & Overdue EMIs.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleSendDailyWhatsAppReport}
                    disabled={isSendingWhatsAppReport}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSendingWhatsAppReport ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating & Sending...
                      </>
                    ) : (
                      <>
                        <span>📲</span>
                        Send Daily Report Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {waReportStatus.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    waReportStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : waReportStatus.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {waReportStatus.text}
                </div>
              )}
            </div>
          </motion.div>

          {/* Monthly WhatsApp Report Trigger Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-indigo-200/80 rounded-3xl shadow-xl shadow-indigo-900/5 overflow-hidden ring-1 ring-indigo-100"
          >
            <div className="p-6 border-b border-indigo-100 bg-indigo-50/50 flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  Monthly WhatsApp Executive Report (Day 1 to Date)
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Automated end-of-month dispatch (last day of month at 23:59) & on-demand force trigger (Day 1 to Today MTD metrics in PDF format).
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                MSG91 Template: dailyreport (MTD)
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Target Mobile Number
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="e.g. 919335913286"
                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Aggregates: MTD Leads, MTD Demos, MTD Admissions, Monthly Collection (Day 1 to Date), Pending Fees & Overdue EMIs.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleSendMonthlyWhatsAppReport}
                    disabled={isSendingMonthlyReport}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSendingMonthlyReport ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating MTD Report...
                      </>
                    ) : (
                      <>
                        <span>📊</span>
                        Send Monthly Report Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {monthlyReportStatus.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    monthlyReportStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : monthlyReportStatus.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                  }`}
                >
                  {monthlyReportStatus.text}
                </div>
              )}
            </div>
          </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-100"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Collections Summary Report
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">Filter by date and choose the data points you want to include in the exported sheets.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Date Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Select Date Range</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          {/* Column Selector */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Select Student Details (Columns)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AVAILABLE_COLUMNS.map((col) => (
                <label key={col.id} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={selectedColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <div className="w-5 h-5 border-2 border-slate-200 rounded bg-white peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors select-none">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              {message.text && (
                <p className={`text-xs font-bold ${
                  message.type === 'error' ? 'text-rose-500' : 
                  message.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'
                }`}>
                  {message.text}
                </p>
              )}
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Excel
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      </div>
      </div>
      
      {user && (
        <ProfileDisplay
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          logout={logout}
        />
      )}
    </div>
  );
}
