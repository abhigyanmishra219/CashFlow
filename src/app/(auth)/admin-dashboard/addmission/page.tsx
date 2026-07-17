"use client";

import React, { useState, useEffect } from "react";
import LeadProfile from "@/components/LeadProfile";
import AdmissionModal from "@/components/AdmissionModal";
import AddEnquiryModal from "@/components/AddEnquiryModal";
import Sidebar from "@/components/Sidebar";

export default function AdminAdmissionHub() {
  const [activeTab, setActiveTab] = useState("Enrollment Ledgers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ stage: string; data: any } | null>(null);

  // Modal States
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [openTaskModalOnLoad, setOpenTaskModalOnLoad] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [leadForAdmission, setLeadForAdmission] = useState<any | null>(null);
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);

  // Admissions Data
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(true);

  // Table Filters
  const [tableSearch, setTableSearch] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All Brands");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses");
  const [selectedCounsellorFilter, setSelectedCounsellorFilter] = useState("All Counsellors");

  const fetchAdmissions = async () => {
    setIsLoadingAdmissions(true);
    try {
      const res = await fetch("/api/admissions");
      const json = await res.json();
      if (json.success) {
        setAdmissions(json.data);
      }
    } catch (e) {
      console.error("Fetch admissions error:", e);
    } finally {
      setIsLoadingAdmissions(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const today = new Date();
  const todaysAdmissions = admissions.filter(
    (a: any) => new Date(a.createdAt).toDateString() === today.toDateString()
  ).length;

  const monthlyAdmissions = admissions.filter((a: any) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  const salesConversion = Math.min(
    Math.round((admissions.length / (admissions.length + 50 || 1)) * 100),
    100
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/admissions/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResult(data);
      } else {
        alert(data.error || "Search failed");
      }
    } catch (e) {
      console.error("Search error:", e);
      alert("Error searching student record.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrintSlip = (adm: any) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Slip - ${adm.fullName || "Student"}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #4338ca; font-size: 24px; }
            .header p { margin: 5px 0 0; font-size: 12px; color: #64748b; font-weight: bold; }
            .field { margin-bottom: 12px; font-size: 14px; }
            .label { font-weight: bold; color: #475569; display: inline-block; width: 160px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 11px; text-align: center; color: #94a3b8; }
            .badge { background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CoachFlow ERP - Official Admission Slip</h1>
            <p>AUTHENTICATED ENROLLMENT RECEIPT</p>
          </div>
          <div class="field"><span class="label">Admission ID:</span> <span class="badge">${adm.admissionId || "N/A"}</span></div>
          <div class="field"><span class="label">Student Name:</span> <strong>${adm.fullName || "N/A"}</strong></div>
          <div class="field"><span class="label">Course Enrolled:</span> ${adm.course || "N/A"}</div>
          <div class="field"><span class="label">Brand:</span> ${adm.brand || "N/A"}</div>
          <div class="field"><span class="label">Counselor:</span> ${adm.counsellor || "N/A"}</div>
          <div class="field"><span class="label">Total Fee:</span> ₹${adm.finalFee || "0"}</div>
          <div class="field"><span class="label">Remaining Balance:</span> ₹${adm.remainingBalance || "0"}</div>
          <div class="field"><span class="label">Admission Date:</span> ${new Date(adm.createdAt || Date.now()).toLocaleDateString("en-IN")}</div>
          <div class="footer">
            <p>This is a computer-generated document. No signature required.</p>
            <p>CoachFlow Enterprise v1.2</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Derived lists for dropdown filters
  const uniqueBrands = Array.from(new Set(admissions.map((a) => a.brand).filter(Boolean)));
  const uniqueCounsellors = Array.from(new Set(admissions.map((a) => a.counsellor).filter(Boolean)));

  // Filtered admissions list
  const filteredAdmissions = admissions.filter((adm) => {
    const query = tableSearch.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      (adm.fullName && adm.fullName.toLowerCase().includes(query)) ||
      (adm.admissionId && adm.admissionId.toLowerCase().includes(query)) ||
      (adm.course && adm.course.toLowerCase().includes(query)) ||
      (adm.brand && adm.brand.toLowerCase().includes(query)) ||
      (adm.counsellor && adm.counsellor.toLowerCase().includes(query));

    const matchesBrand =
      selectedBrandFilter === "All Brands" || adm.brand === selectedBrandFilter;

    const matchesStatus =
      selectedStatusFilter === "All Statuses" ||
      (selectedStatusFilter === "Paid" && Number(adm.remainingBalance) === 0) ||
      (selectedStatusFilter === "Pending Balance" && Number(adm.remainingBalance) > 0);

    const matchesCounsellor =
      selectedCounsellorFilter === "All Counsellors" || adm.counsellor === selectedCounsellorFilter;

    return matchesSearch && matchesBrand && matchesStatus && matchesCounsellor;
  });

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      <Sidebar />

      {/* Main Content Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <div className="p-8 pb-32">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800 mb-2">
              Admission & Enrollment Hub
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Convert vetted enquiries into official student enrollment ledgers and generate printable slip agreements.
            </p>
          </header>

          {/* Student Search & Action Center */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 text-indigo-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                />
              </svg>
              Student Search & Action Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Consolidated Search */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Search by Name / Mobile / Parent Name / Email / ID
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-slate-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Enter mobile, name, parent name, email, or registration ID"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Area */}
          {searchResult && (
            <div className="mb-8 animate-fade-in">
              {/* Scenario 1: Not Found */}
              {searchResult.stage === "NOT_FOUND" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-800">Student Not Registered</h3>
                      <p className="text-xs font-semibold text-rose-600/80">
                        This mobile number / query doesn't exist in our records.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAddEnquiryOpen(true)}
                      className="bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Create New Enquiry
                    </button>
                    <button
                      onClick={() => {
                        setLeadForAdmission({ studentFullName: searchQuery });
                        setIsAdmissionModalOpen(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      Create Direct Admission
                    </button>
                  </div>
                </div>
              )}

              {/* Scenario 2: Enquiry Found */}
              {searchResult.stage === "ENQUIRY" && searchResult.data.length > 0 && (
                <div className="space-y-6">
                  {searchResult.data.map((lead: any, index: number) => {
                    const isAdmitted = lead.status === "Admitted";
                    const c = (amberClass: string, emeraldClass: string) =>
                      isAdmitted ? emeraldClass : amberClass;
                    return (
                      <div
                        key={index}
                        className={
                          c("bg-amber-50 border-amber-200", "bg-emerald-50 border-emerald-200") +
                          " border rounded-2xl p-6"
                        }
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                c("bg-amber-100 text-amber-600", "bg-emerald-100 text-emerald-600") +
                                " h-10 w-10 rounded-full flex items-center justify-center"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3
                                className={
                                  c("text-amber-900", "text-emerald-900") +
                                  " text-sm font-bold flex items-center gap-2"
                                }
                              >
                                Active Enquiry Found
                                <span
                                  className={
                                    c("bg-amber-200 text-amber-800", "bg-emerald-200 text-emerald-800") +
                                    " text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider"
                                  }
                                >
                                  {lead.enquiryId}
                                </span>
                              </h3>
                              <p className={c("text-amber-700/80", "text-emerald-700/80") + " text-xs font-semibold"}>
                                This prospect is already in the sales pipeline.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={
                            c("border-amber-100", "border-emerald-100") +
                            " grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/60 rounded-xl border"
                          }
                        >
                          <div>
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Student Name
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.studentFullName}
                            </p>
                          </div>
                          <div>
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Course & Brand
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.targetCourse} • {lead.targetBrand}
                            </p>
                          </div>
                          <div>
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Lead Status
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.status}
                            </p>
                          </div>
                          <div>
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Assigned Counsellor
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.assignedCrmAdvisor}
                            </p>
                          </div>
                          <div>
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Last Follow-up
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.lastFollowUp || "None"}
                            </p>
                          </div>
                          <div className="col-span-3">
                            <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>
                              Next Follow-up
                            </p>
                            <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                              {lead.nextFollowUp || "None"}
                            </p>
                          </div>
                        </div>

                        {!isAdmitted && (
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setOpenTaskModalOnLoad(false);
                              }}
                              className={
                                c("border-amber-200 hover:bg-amber-100 text-amber-700", "border-emerald-200 hover:bg-emerald-100 text-emerald-700") +
                                " bg-white border text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                              }
                            >
                              View Enquiry
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setOpenTaskModalOnLoad(true);
                              }}
                              className={
                                c("border-amber-200 hover:bg-amber-100 text-amber-700", "border-emerald-200 hover:bg-emerald-100 text-emerald-700") +
                                " bg-white border text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                              }
                            >
                              Schedule Follow-up
                            </button>
                            <button
                              onClick={() => {
                                setLeadForAdmission(lead);
                                setIsAdmissionModalOpen(true);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 ml-auto"
                            >
                              Convert to Admission
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Scenario 3: Admission Found */}
              {searchResult.stage === "ADMISSION" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        Admission Already Exists
                        <span className="bg-emerald-200 text-emerald-800 text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {searchResult.data.admissionNumber || searchResult.data.admissionId}
                        </span>
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700/80">
                        This student is already enrolled in the system.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/60 rounded-xl border border-emerald-100">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Student Name</p>
                      <p className="text-xs font-bold text-emerald-950">
                        {searchResult.data.studentName || searchResult.data.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Course & Brand</p>
                      <p className="text-xs font-bold text-emerald-950">
                        {searchResult.data.course} • {searchResult.data.brand}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Admission Date</p>
                      <p className="text-xs font-bold text-emerald-950">
                        {searchResult.data.admissionDate ||
                          new Date(searchResult.data.createdAt || Date.now()).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Fee Status</p>
                      <p className="text-xs font-bold text-emerald-950">
                        {searchResult.data.feeStatus || "Enrolled"}{" "}
                        <span className="text-emerald-600 font-semibold">
                          (₹{searchResult.data.remainingBalance || searchResult.data.outstandingAmount || 0} due)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handlePrintSlip(searchResult.data)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm ml-auto"
                    >
                      Print Admission Slip
                    </button>
                  </div>
                </div>
              )}

              {/* Scenario 4: Student Found */}
              {searchResult.stage === "STUDENT" && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                        Active Student Found
                        <span className="bg-blue-200 text-blue-800 text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {searchResult.data.studentId}
                        </span>
                      </h3>
                      <p className="text-xs font-semibold text-blue-700/80">
                        This student is currently active in ongoing batches.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
                      Open Student Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Today's Enrollments
                </h3>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{todaysAdmissions}</div>
                <p className="text-[11px] font-semibold text-slate-400">New registrations</p>
              </div>
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Monthly Enrollment
                </h3>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{monthlyAdmissions}</div>
                <p className="text-[11px] font-semibold text-slate-400">This billing cycle</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                  />
                </svg>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
              <div className="w-full">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Sales Conversion
                </h3>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl font-extrabold text-slate-800">{salesConversion}%</div>
                  <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.154 5.073c.11.485-.396.883-.814.65l-4.522-2.523a.562.562 0 00-.546 0l-4.522 2.523c-.418.232-.924-.165-.814-.65l1.154-5.073a.563.563 0 00-1.81-.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                  <div
                    className="h-1 bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${salesConversion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Enrollments Pool
                </h3>
                <div className="text-3xl font-extrabold text-slate-800 mb-1">{admissions.length}</div>
                <p className="text-[11px] font-semibold text-slate-400">Total registered ledgers</p>
              </div>
              <div className="h-10 w-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab("Enrollment Ledgers")}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "Enrollment Ledgers"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                />
              </svg>
              Enrollment Ledgers ({filteredAdmissions.length})
            </button>
            <button
              onClick={() => setActiveTab("Concession Approvals")}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "Concession Approvals"
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              Concession Approvals
            </button>
          </div>

          {/* Filters Row */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-slate-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search by student name, admission #, course, brand, counsellor..."
                className="w-full bg-white border-0 py-2 pl-10 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
            </div>

            <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {/* Brand Filter */}
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All Brands">All Brands</option>
                {uniqueBrands.map((b: string, idx: number) => (
                  <option key={idx} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Paid">Paid (Full Balance)</option>
                <option value="Pending Balance">Pending Balance</option>
              </select>

              {/* Counsellor Filter */}
              <select
                value={selectedCounsellorFilter}
                onChange={(e) => setSelectedCounsellorFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All Counsellors">All Counsellors</option>
                {uniqueCounsellors.map((c: string, idx: number) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Table Area */}
          <div className="bg-white border border-slate-200/80 rounded-t-3xl min-h-[300px] flex flex-col shadow-sm overflow-hidden">
            {isLoadingAdmissions ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-500 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-xs font-bold text-slate-400">Fetching latest enrollment ledgers...</p>
              </div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <p className="text-sm font-bold text-slate-400">No matching admissions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Course & Brand</th>
                      <th className="px-6 py-4">Counselor</th>
                      <th className="px-6 py-4">Fees Details</th>
                      <th className="px-6 py-4">Admission Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmissions.map((adm: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {adm.fullName?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{adm.fullName}</p>
                              <p className="text-[10px] font-semibold text-slate-500">
                                {adm.admissionId || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{adm.course}</p>
                          <p className="text-[10px] font-semibold text-slate-500">{adm.brand}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            {adm.counsellor}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">₹{adm.finalFee}</p>
                          <p className="text-[10px] font-semibold text-red-500">
                            Bal: ₹{adm.remainingBalance}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {new Date(adm.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handlePrintSlip(adm)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                          >
                            Print Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-64 right-0 h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-500">DB Connection: Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-500">AI Assist: Connected</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400">Active Session Secured</span>
            <span className="text-[10px] font-extrabold text-indigo-600">CoachFlow Enterprise v1.2</span>
          </div>
        </div>

        {/* FAB (+) Button for Direct Admission */}
        <button
          onClick={() => {
            setLeadForAdmission(null);
            setIsAdmissionModalOpen(true);
          }}
          title="Create New Admission"
          className="fixed bottom-16 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 z-20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <LeadProfile
        lead={selectedLead}
        onClose={() => {
          setSelectedLead(null);
          setOpenTaskModalOnLoad(false);
        }}
        onSuccess={() => handleSearch()}
        defaultOpenTaskModal={openTaskModalOnLoad}
      />

      {isAdmissionModalOpen && (
        <AdmissionModal
          isOpen={isAdmissionModalOpen}
          onClose={() => {
            setIsAdmissionModalOpen(false);
            setLeadForAdmission(null);
          }}
          lead={leadForAdmission}
          onSuccess={() => {
            setIsAdmissionModalOpen(false);
            handleSearch();
            fetchAdmissions();
          }}
        />
      )}

      {isAddEnquiryOpen && (
        <AddEnquiryModal
          isOpen={isAddEnquiryOpen}
          onClose={() => setIsAddEnquiryOpen(false)}
          onSuccess={() => {
            setIsAddEnquiryOpen(false);
            handleSearch();
          }}
        />
      )}
    </div>
  );
}
