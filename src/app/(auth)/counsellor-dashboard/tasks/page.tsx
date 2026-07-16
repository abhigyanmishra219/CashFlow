"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";

export default function CounsellorTasksPage() {
  const { user, logout } = useUser();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checklistFilter, setChecklistFilter] = useState("Show Pending Checklist");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [contactTypeFilter, setContactTypeFilter] = useState("All Contact Types");

  useEffect(() => {
    if (!user) return;
    fetch("/api/enquiries")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const myEnquiries = (data.data || []).filter(
            (e: any) => (e.assignedCrmAdvisor || "").toLowerCase() === (user.name || "").toLowerCase()
          );
          setEnquiries(myEnquiries);
        }
      });
  }, [user]);

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch = searchQuery === "" || 
      (enq.studentFullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.primaryPhoneMobile || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.targetCourse || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPriority = priorityFilter === "All Priorities" || enq.priorityLevel === priorityFilter;
    
    let matchesChecklist = true;
    if (checklistFilter === "Show Pending Checklist") {
      matchesChecklist = enq.status !== "Admitted";
    } else if (checklistFilter === "Show Completed") {
      matchesChecklist = enq.status === "Admitted";
    }

    let matchesContact = true;
    if (contactTypeFilter !== "All Contact Types") {
      matchesContact = (enq.followUps || []).some((f: any) => f.typeOfContact === contactTypeFilter);
    }

    return matchesSearch && matchesPriority && matchesChecklist && matchesContact;
  });

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      <CounsellorSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">
                Ctrl + K
              </span>
            </div>

            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-5 cursor-pointer" onClick={logout}>
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Priya+Singh&background=10b981&color=fff" alt="User" className="h-full w-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user.name || ""}</p>
                <p className="text-[11px] font-semibold text-emerald-600 leading-tight mt-0.5 capitalize">{user.role}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-[28px] font-black text-[#1e293b] tracking-tight">My CRM Checklist</h2>
            <p className="text-[#64748b] text-sm font-bold mt-1">Interactive checklist for logging interactions and tracking scheduled reminders.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
            <div className="relative mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Search checklist tasks by student name or details..."
                className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={checklistFilter}
                  onChange={(e) => setChecklistFilter(e.target.value)}
                >
                  <option>Show Pending Checklist</option>
                  <option>Show Completed</option>
                  <option>Show All</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={contactTypeFilter}
                  onChange={(e) => setContactTypeFilter(e.target.value)}
                >
                  <option>All Contact Types</option>
                  <option>Phone Call</option>
                  <option>Email</option>
                  <option>Meeting</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Checklist Tasks ({filteredEnquiries.length})</h3>
            
            {filteredEnquiries.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
                <div className="mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-400">All tasks completed in this query.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map((enq) => (
                  <div key={enq._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(enq.studentFullName || 'U')}&background=f1f5f9&color=64748b`} alt={enq.studentFullName} className="h-full w-full" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{enq.studentFullName}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{enq.targetCourse || 'N/A'} • {enq.primaryPhoneMobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                        enq.priorityLevel === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        enq.priorityLevel === 'Low' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {enq.priorityLevel || 'Medium'}
                      </span>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded px-2 py-1">
                        {enq.status || 'New'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
