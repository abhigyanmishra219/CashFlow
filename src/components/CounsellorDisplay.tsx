"use client";

import React, { useState, useEffect } from "react";
import RegisterCounsellorModal from "./RegisterCounsellorModal";

export default function CounsellorDisplay() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counsellorList, setCounsellorList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCounsellors() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/counsellors");
        const data = await response.json();
        if (data.success && data.counsellors && data.counsellors.length > 0) {
          const list = data.counsellors.map((c: any) => {
            const nameParts = (c.name || "").split(" ");
            const firstInitial = nameParts[0]?.[0] || "";
            const lastInitial = nameParts[1]?.[0] || "";
            const target = c.annualTarget || 500000;
            const revenue = c.currentRevenue || 0;
            return {
              id: c._id,
              registryId: `user-${c._id}`,
              name: c.name,
              email: c.email,
              scope: c.brandScope || "—",
              targetCollected: `₹${revenue.toLocaleString()} / ₹${target.toLocaleString()}`,
              percentage: `${((revenue / target) * 100).toFixed(1)}%`,
              status: "ACTIVE",
              annualTarget: `₹${target.toLocaleString()}`,
              revenueCollected: `₹${revenue.toLocaleString()}`,
              joiningDate: c.joiningDate ? new Date(c.joiningDate).toISOString().split("T")[0] : "—",
              admissions: `${c.admissionsRecorded || 0} Admissions`,
              initials: `${firstInitial}${lastInitial}`.toUpperCase() || "??",
              scopeBadge: "Sales Counsellor Scope"
            };
          });
          setCounsellorList(list);
          setSelectedId(list[0].id);
        } else {
          setCounsellorList([]);
          setSelectedId(null);
        }
      } catch (err) {
        console.error("Failed to load counsellors from API:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCounsellors();
  }, []);

  const selectedCounsellor = selectedId ? counsellorList.find(c => c.id === selectedId) : null;

  const stats = [
    { title: "Active Agents", value: `${counsellorList.length} Profiles`, color: "text-slate-800" },
    { 
      title: "Combined Targets", 
      value: `₹${counsellorList.reduce((acc, curr) => acc + (parseFloat(curr.annualTarget.replace(/[^\d]/g, "")) || 0), 0).toLocaleString()}`, 
      color: "text-slate-800" 
    },
    { 
      title: "Achieved Revenue", 
      value: `₹${counsellorList.reduce((acc, curr) => acc + (parseFloat(curr.revenueCollected.replace(/[^\d]/g, "")) || 0), 0).toLocaleString()}`, 
      color: "text-indigo-600" 
    },
    { 
      title: "Admissions Collected", 
      value: `${counsellorList.reduce((acc, curr) => acc + (parseInt(curr.admissions.replace(/[^\d]/g, "")) || 0), 0)} seats`, 
      color: "text-emerald-600" 
    },
    { 
      title: "Combined Achievement", 
      value: `${(counsellorList.reduce((acc, curr) => acc + (parseFloat(curr.revenueCollected.replace(/[^\d]/g, "")) || 0), 0) / Math.max(counsellorList.reduce((acc, curr) => acc + (parseFloat(curr.annualTarget.replace(/[^\d]/g, "")) || 0), 0), 1) * 100).toFixed(1)}%`, 
      color: "text-blue-600" 
    }
  ];

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between relative">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Counsellors & Agents Registry</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl font-sans">
            Track counselor pipelines, sales goals, actual yearly collection values, and active registrations.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all font-sans">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Import Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all font-sans"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Counsellor
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none font-sans">
              {stat.title}
            </span>
            <span className={`text-lg font-extrabold tracking-tight block mt-1.5 font-sans ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Content Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Left Side: List */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search counsellors by code, email, name..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-sans"
              />
            </div>
            
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none font-sans">
              <option>All Brands</option>
            </select>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none font-sans">
              <option>All Status</option>
            </select>

            <div className="flex items-center gap-0.5 select-none">
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cards list */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl gap-2 font-sans select-none text-slate-400">
                <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-semibold">Loading agent registry database...</span>
              </div>
            ) : counsellorList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl gap-3 font-sans select-none text-center">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">No Counsellors Found</h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                    There are no counsellors registered in the database yet. Click "+ New Counsellor" to create a new profile.
                  </p>
                </div>
              </div>
            ) : (
              counsellorList.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 ${
                      isSelected ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {c.initials}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap font-sans">
                            {c.name}
                            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-400 rounded-md px-1 py-0.5 font-mono select-all">
                              {c.scope}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1 font-sans">
                            Email: {c.email} | Scope: {c.scope}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 uppercase select-none font-sans">
                        {c.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 my-3"></div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 select-none font-sans">
                      <span>Target Collected: <span className="text-slate-600">{c.targetCollected}</span></span>
                      <span className="text-indigo-600">{c.percentage} Completed</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Details Pane */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between overflow-y-auto">
          {selectedCounsellor ? (
            <div className="space-y-6">
              
              {/* Detail Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/10">
                    {selectedCounsellor.initials}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 font-sans">{selectedCounsellor.name}</h2>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5 font-sans">
                      Registry ID: <span className="font-mono text-slate-500 select-all">{selectedCounsellor.registryId}</span>
                    </span>
                    <span className="inline-block text-[9px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 rounded-md px-1.5 py-0.5 mt-1.5 font-sans">
                      {selectedCounsellor.scopeBadge}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 select-none">
                  <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Performance Ledger Goals */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none font-sans">Performance Ledger Goals</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Assigned Annual Target</span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1 font-sans">{selectedCounsellor.annualTarget}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Revenue Collected</span>
                    <span className="text-sm font-extrabold text-blue-600 block mt-1 font-sans">{selectedCounsellor.revenueCollected}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Joining Date</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1.5 font-sans">{selectedCounsellor.joiningDate}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Seats Admission</span>
                    <span className="text-xs font-extrabold text-emerald-600 block mt-1.5 font-sans">{selectedCounsellor.admissions}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 font-sans">
                    <span>Actual Goal Completion Ratio</span>
                    <span className="text-indigo-600">{selectedCounsellor.percentage}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: selectedCounsellor.percentage }}></div>
                  </div>
                </div>
              </div>

              {/* Registry Credentials */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none font-sans">Registry Credentials</label>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Employee ID</span>
                    <span className="font-bold text-indigo-600 block mt-1">{selectedCounsellor.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Brand Channel Assignment</span>
                    <span className="font-bold text-slate-700 block mt-1">{selectedCounsellor.scope}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Official Email</span>
                    <span className="font-bold text-slate-700 block mt-1 select-all">{selectedCounsellor.email}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Workspace Status</span>
                    <span className="font-bold text-emerald-600 block mt-1 uppercase">{selectedCounsellor.status}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 h-full gap-3 font-sans select-none text-center">
              <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM11.25 14.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM15.75 14.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM15.75 11.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM9.75 17.25h8.25a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-8.25A2.25 2.25 0 007.5 9v6a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-700">No Profile Selected</h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Select a counsellor from the list to preview their annual targets, collections progress, and corporate credentials.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all select-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Modal: Register Sales Counsellor */}
      <RegisterCounsellorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
