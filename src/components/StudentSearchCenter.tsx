"use client";

import React, { useState } from "react";
import AddEnquiryModal from "./AddEnquiryModal";
import LeadProfile from "./LeadProfile";
import AdmissionModal from "./AdmissionModal";

interface StudentSearchCenterProps {
  className?: string;
}

export default function StudentSearchCenter({ className = "" }: StudentSearchCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [showFullAdmissionDetails, setShowFullAdmissionDetails] = useState(false);

  // Modals state
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [openTaskModalOnLoad, setOpenTaskModalOnLoad] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [leadForAdmission, setLeadForAdmission] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setShowFullAdmissionDetails(false);
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
      alert("An error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
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

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 select-none">
            SEARCH BY NAME / MOBILE / PARENT NAME / EMAIL / ID
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
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Display Area */}
      {searchResult && (
        <div className="animate-in fade-in duration-300">
          {/* Scenario 1: Not Found */}
          {searchResult.stage === "NOT_FOUND" && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-800">Student Not Registered</h3>
                  <p className="text-xs font-semibold text-rose-600/80">No lead or admission record found matching "{searchQuery}".</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddEnquiryOpen(true)}
                  className="bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  Create New Enquiry
                </button>
                <button
                  onClick={() => {
                    setLeadForAdmission(null);
                    setIsAdmissionModalOpen(true);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Create Direct Admission
                </button>
              </div>
            </div>
          )}

          {/* Scenario 2: Active Enquiry Found */}
          {searchResult.stage === "ENQUIRY" && searchResult.data.length > 0 && (
            <div className="space-y-4">
              {searchResult.data.map((lead: any, index: number) => {
                const isAdmitted = lead.status === "Admitted";
                const c = (amberClass: string, emeraldClass: string) => isAdmitted ? emeraldClass : amberClass;
                return (
                  <div key={index} className={c("bg-amber-50 border-amber-200", "bg-emerald-50 border-emerald-200") + " border rounded-2xl p-6 shadow-sm"}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={c("bg-amber-100 text-amber-600", "bg-emerald-100 text-emerald-600") + " h-10 w-10 rounded-full flex items-center justify-center shrink-0"}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={c("text-amber-900", "text-emerald-900") + " text-sm font-bold flex items-center gap-2"}>
                            Active Enquiry Found
                            <span className={c("bg-amber-200 text-amber-800", "bg-emerald-200 text-emerald-800") + " text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-mono"}>{lead.enquiryId}</span>
                          </h3>
                          <p className={c("text-amber-700/80", "text-emerald-700/80") + " text-xs font-semibold"}>This prospect is registered in the sales pipeline.</p>
                        </div>
                      </div>
                    </div>

                    <div className={c("border-amber-100", "border-emerald-100") + " grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/70 rounded-xl border"}>
                      <div>
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Student Name</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>{lead.studentFullName}</p>
                      </div>
                      <div>
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Course & Brand</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>{lead.targetCourse} • {lead.targetBrand}</p>
                      </div>
                      <div>
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Lead Status</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>{lead.status}</p>
                      </div>
                      <div>
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Assigned Counsellor</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>{lead.assignedCrmAdvisor}</p>
                      </div>
                      <div>
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Phone</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>{lead.primaryPhoneMobile}</p>
                      </div>
                      <div className="col-span-3">
                        <p className={c("text-amber-600/70", "text-emerald-600/70") + " text-[10px] font-bold uppercase"}>Last / Next Follow-up</p>
                        <p className={c("text-amber-950", "text-emerald-950") + " text-xs font-bold"}>
                          Last: {lead.lastFollowUp || "None"} | Next: {lead.nextFollowUp || "None"}
                        </p>
                      </div>
                    </div>

                    {!isAdmitted && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => { setSelectedLead(lead); setOpenTaskModalOnLoad(false); }}
                          className={c("border-amber-200 hover:bg-amber-100 text-amber-700", "border-emerald-200 hover:bg-emerald-100 text-emerald-700") + " bg-white border text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"}
                        >
                          View Enquiry Details
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); setOpenTaskModalOnLoad(true); }}
                          className={c("border-amber-200 hover:bg-amber-100 text-amber-700", "border-emerald-200 hover:bg-emerald-100 text-emerald-700") + " bg-white border text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"}
                        >
                          Schedule Follow-up
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); setOpenTaskModalOnLoad(false); }}
                          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
                        >
                          Schedule Demo
                        </button>
                        <button
                          onClick={() => { setLeadForAdmission(lead); setIsAdmissionModalOpen(true); }}
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

          {/* Scenario 3: Admission Already Exists */}
          {searchResult.stage === "ADMISSION" && searchResult.data && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    Admission Already Exists
                    <span className="bg-emerald-200 text-emerald-800 text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      {searchResult.data.admissionNumber || searchResult.data.admissionId}
                    </span>
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700/80">This student is officially enrolled in the system.</p>
                </div>
                <button
                  onClick={() => setShowFullAdmissionDetails(!showFullAdmissionDetails)}
                  className="bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                >
                  {showFullAdmissionDetails ? "Hide Full Details" : "View Full Details"}
                </button>
              </div>

              {/* Overview grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/80 rounded-xl border border-emerald-100">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Student Name</p>
                  <p className="text-xs font-bold text-emerald-950">{searchResult.data.studentName || searchResult.data.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Course & Brand</p>
                  <p className="text-xs font-bold text-emerald-950">{searchResult.data.course} • {searchResult.data.brand}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Admission Date</p>
                  <p className="text-xs font-bold text-emerald-950">{searchResult.data.admissionDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Fee Status</p>
                  <p className="text-xs font-bold text-emerald-950">
                    {searchResult.data.feeStatus} <span className="text-emerald-700 font-semibold">(₹{searchResult.data.outstandingAmount ?? searchResult.data.remainingBalance ?? 0} due)</span>
                  </p>
                </div>
              </div>

              {/* Extended Details */}
              {showFullAdmissionDetails && (
                <div className="mt-4 p-4 bg-white/90 rounded-xl border border-emerald-200/80 space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Student & Contact Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone</span>
                      <span className="font-bold text-slate-800">{searchResult.data.mobileNumber || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
                      <span className="font-bold text-slate-800">{searchResult.data.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent Name</span>
                      <span className="font-bold text-slate-800">{searchResult.data.parentName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parent Phone</span>
                      <span className="font-bold text-slate-800">{searchResult.data.parentPhone || "N/A"}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">Financial Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Course Fee</span>
                      <span className="font-bold text-slate-800">₹{searchResult.data.totalFee || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Discount</span>
                      <span className="font-bold text-slate-800">₹{searchResult.data.discount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Paid Amount</span>
                      <span className="font-bold text-emerald-700">₹{searchResult.data.paidAmount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Balance Due</span>
                      <span className="font-bold text-rose-600">₹{searchResult.data.remainingBalance ?? searchResult.data.outstandingAmount ?? 0}</span>
                    </div>
                  </div>

                  {searchResult.data.counsellor && (
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Counsellor</span>
                      <span className="font-bold text-slate-800">{searchResult.data.counsellor}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddEnquiryModal
        isOpen={isAddEnquiryOpen}
        onClose={() => setIsAddEnquiryOpen(false)}
        onSuccess={() => {
          setIsAddEnquiryOpen(false);
          handleSearch();
        }}
      />

      <LeadProfile
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSuccess={() => {
          setSelectedLead(null);
          handleSearch();
        }}
      />

      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        lead={leadForAdmission}
        onSuccess={() => {
          setIsAdmissionModalOpen(false);
          handleSearch();
        }}
      />
    </div>
  );
}
