"use client";

import React, { useState } from "react";
import ManagerSidebar from "@/components/ManagerSidebar";
import { useUser } from "../../component/context/user-context";
import ProfileDisplay from "@/components/ProfileDisplay";

export default function ManagerDashboard() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // If user context hasn't loaded yet, show some fallback (or loading state)
  const displayName = user?.name || "Loading...";
  const displayRole = user?.role || "Brand Manager";
  const initialLetter = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 font-sans overflow-hidden">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header Area */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Dashboard</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              Design Gateway
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            <div className="relative hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search anything..." className="pl-10 pr-12 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 w-64 transition-all" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">Ctrl+K</span>
              </div>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-2 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white">
                6
              </span>
            </button>

            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm group-hover:shadow transition-shadow">
                {initialLetter}
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-extrabold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{displayRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 pb-32 space-y-6">
          
          {/* KPI Row */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Total Leads</h3>
                  <p className="text-2xl font-extrabold text-slate-800">842</p>
                </div>
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                18.4% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">New Leads</h3>
                  <p className="text-2xl font-extrabold text-slate-800">128</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                12.8% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Follow-ups Today</h3>
                  <p className="text-2xl font-extrabold text-slate-800">26</p>
                </div>
                <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                8.1% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Admissions</h3>
                  <p className="text-2xl font-extrabold text-slate-800">42</p>
                </div>
                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                20.0% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Revenue (INR)</h3>
                  <p className="text-2xl font-extrabold text-slate-800">₹24.85 L</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                15.6% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Collection (INR)</h3>
                  <p className="text-2xl font-extrabold text-slate-800">₹8.65 L</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" /></svg>
                10.2% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Pending Fees</h3>
                  <p className="text-2xl font-extrabold text-slate-800">₹5.42 L</p>
                </div>
                <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" /></svg>
                4.3% <span className="text-slate-400 font-semibold">vs last period</span>
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lead Pipeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Lead Pipeline</h3>
              <div className="flex-1 flex items-center gap-6">
                <div className="flex-1 flex flex-col gap-1 items-center">
                  <div className="w-full h-12 bg-[#2563eb] rounded-t-lg mx-auto transform perspective-1000"></div>
                  <div className="w-[85%] h-12 bg-[#22c55e] mx-auto transform perspective-1000 -skew-x-[15deg]"></div>
                  <div className="w-[70%] h-12 bg-[#eab308] mx-auto transform perspective-1000 -skew-x-[15deg]"></div>
                  <div className="w-[55%] h-12 bg-[#a855f7] mx-auto transform perspective-1000 -skew-x-[15deg]"></div>
                  <div className="w-[40%] h-12 bg-[#06b6d4] mx-auto transform perspective-1000 -skew-x-[15deg]"></div>
                  <div className="w-[25%] h-12 bg-[#ef4444] rounded-b-lg mx-auto"></div>
                </div>
                <div className="flex-1 space-y-4">
                  {[
                    { label: "New Lead", count: 128, pct: "15.2%", color: "bg-[#2563eb]" },
                    { label: "Contacted", count: 198, pct: "23.5%", color: "bg-[#22c55e]" },
                    { label: "Counselling Scheduled", count: 156, pct: "18.5%", color: "bg-[#eab308]" },
                    { label: "Interested", count: 142, pct: "16.9%", color: "bg-[#a855f7]" },
                    { label: "Demo Attended", count: 96, pct: "11.4%", color: "bg-[#06b6d4]" },
                    { label: "Lost", count: 52, pct: "6.2%", color: "bg-[#ef4444]" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 ${item.color} rounded-sm`}></span>
                        <span className="font-semibold text-slate-600">{item.label}</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {item.count} <span className="text-[10px] text-slate-400 font-semibold">({item.pct})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leads Trend */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Leads Trend</h3>
                <select className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
              <div className="flex gap-4 justify-center mb-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#2563eb] rounded-sm"></span>New Leads</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#22c55e] rounded-sm"></span>Admissions</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#ef4444] rounded-sm"></span>Lost Leads</span>
              </div>
              <div className="flex-1 relative mt-4">
                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  {[0, 30, 60, 90, 120].map(y => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}
                  {/* Y Axis Labels */}
                  <text x="-5" y="125" className="text-[8px] fill-slate-400" textAnchor="end">0</text>
                  <text x="-5" y="95" className="text-[8px] fill-slate-400" textAnchor="end">20</text>
                  <text x="-5" y="65" className="text-[8px] fill-slate-400" textAnchor="end">40</text>
                  <text x="-5" y="35" className="text-[8px] fill-slate-400" textAnchor="end">60</text>
                  <text x="-5" y="5" className="text-[8px] fill-slate-400" textAnchor="end">80</text>
                  
                  {/* X Axis Labels */}
                  <text x="0" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">1 Jul</text>
                  <text x="80" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">4 Jul</text>
                  <text x="160" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">7 Jul</text>
                  <text x="240" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">10 Jul</text>
                  <text x="320" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">13 Jul</text>
                  <text x="400" y="140" className="text-[8px] fill-slate-400" textAnchor="middle">15 Jul</text>

                  {/* Lines - mocked data */}
                  <polyline fill="none" stroke="#2563eb" strokeWidth="2" points="0,75 40,50 80,48 120,60 160,45 200,55 240,65 280,45 320,60 360,40 400,20" />
                  <polyline fill="none" stroke="#22c55e" strokeWidth="2" points="0,110 40,100 80,105 120,95 160,100 200,105 240,95 280,105 320,100 360,85 400,80" />
                  <polyline fill="none" stroke="#ef4444" strokeWidth="2" points="0,135 40,130 80,128 120,135 160,130 200,132 240,135 280,133 320,130 360,125 400,125" />
                  
                  {/* Dots */}
                  <circle cx="0" cy="75" r="3" fill="#2563eb" />
                  <circle cx="80" cy="48" r="3" fill="#2563eb" />
                  <circle cx="160" cy="45" r="3" fill="#2563eb" />
                  <circle cx="240" cy="65" r="3" fill="#2563eb" />
                  <circle cx="320" cy="60" r="3" fill="#2563eb" />
                  <circle cx="400" cy="20" r="3" fill="#2563eb" />
                </svg>
              </div>
            </div>

            {/* Top Counsellors */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Top Counsellors <span className="text-[10px] text-slate-400 font-semibold">(By Admissions)</span></h3>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="grid grid-cols-12 pb-2 mb-2 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Counsellor</div>
                <div className="col-span-2 text-center">Admissions</div>
                <div className="col-span-2 text-center">Revenue (INR)</div>
                <div className="col-span-2 text-right">Conversion %</div>
              </div>
              <div className="space-y-4 overflow-y-auto">
                {[
                  { rank: 1, name: "Rahul Sharma", initials: "RS", color: "bg-amber-100 text-amber-600", adm: 12, rev: "₹6.20 L", conv: "28.6%" },
                  { rank: 2, name: "Priya Singh", initials: "PS", color: "bg-slate-100 text-slate-600", adm: 9, rev: "₹4.10 L", conv: "24.3%" },
                  { rank: 3, name: "Neha Patel", initials: "NP", color: "bg-orange-100 text-orange-600", adm: 8, rev: "₹3.45 L", conv: "22.2%" },
                  { rank: 4, name: "Aman Verma", initials: "AV", color: "bg-indigo-50 text-indigo-600", adm: 7, rev: "₹2.85 L", conv: "21.1%" },
                  { rank: 5, name: "Suresh Kumar", initials: "SK", color: "bg-emerald-50 text-emerald-600", adm: 6, rev: "₹2.05 L", conv: "18.7%" }
                ].map(c => (
                  <div key={c.rank} className="grid grid-cols-12 items-center text-xs">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        c.rank === 1 ? 'bg-amber-400 text-white' : 
                        c.rank === 2 ? 'bg-slate-300 text-white' : 
                        c.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {c.rank}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${c.color}`}>{c.initials}</div>
                        <span className="font-semibold text-slate-700">{c.name}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-bold text-slate-800">{c.adm}</div>
                    <div className="col-span-2 text-center font-semibold text-slate-600">{c.rev}</div>
                    <div className="col-span-2 text-right font-semibold text-slate-800">{c.conv}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Enquiries by Source */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-800 self-start mb-6">Enquiries by Source</h3>
              <div className="flex items-center gap-6 w-full">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#2563eb" strokeWidth="8" strokeDasharray="36.5 63.5" />
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#06b6d4" strokeWidth="8" strokeDasharray="28.3 71.7" strokeDashoffset="-36.5" />
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#22c55e" strokeWidth="8" strokeDasharray="15.4 84.6" strokeDashoffset="-64.8" />
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="10.6 89.4" strokeDashoffset="-80.2" />
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#a855f7" strokeWidth="8" strokeDasharray="9.2 90.8" strokeDashoffset="-90.8" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white m-3 shadow-inner"></div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Website", pct: "36.5%", color: "bg-[#2563eb]" },
                    { label: "Referral", pct: "28.3%", color: "bg-[#06b6d4]" },
                    { label: "Social Media", pct: "15.4%", color: "bg-[#22c55e]" },
                    { label: "Walk-in", pct: "10.6%", color: "bg-[#f59e0b]" },
                    { label: "Advertisement", pct: "6.2%", color: "bg-[#a855f7]" },
                    { label: "Others", pct: "3.0%", color: "bg-slate-300" }
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 ${s.color} rounded-sm`}></span>
                        <span className="font-semibold text-slate-600">{s.label}</span>
                      </div>
                      <span className="font-bold text-slate-800">{s.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Follow-ups */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Today's Follow-ups</h3>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Rohan Mehta", initials: "RM", time: "10:00 AM", action: "Call", btnClass: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "Sneha Gupta", initials: "SG", time: "11:30 AM", action: "Demo", btnClass: "text-blue-600 bg-blue-50 border-blue-100" },
                  { name: "Vikram Singh", initials: "VS", time: "02:00 PM", action: "Follow-up", btnClass: "text-amber-600 bg-amber-50 border-amber-100" },
                  { name: "Anjali Verma", initials: "AV", time: "04:30 PM", action: "Call", btnClass: "text-emerald-600 bg-emerald-50 border-emerald-100" }
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500">{f.initials}</div>
                      <span className="text-xs font-semibold text-slate-700">{f.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{f.time}</span>
                    <button className={`text-[9px] font-bold px-2 py-0.5 rounded border ${f.btnClass}`}>{f.action}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Upcoming Tasks</h3>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4">
                {[
                  { time: "09:00 AM", task: "Team Meeting", checked: false },
                  { time: "11:00 AM", task: "Review Pending Enquiries", checked: true },
                  { time: "03:00 PM", task: "Counsellor 1:1", checked: false },
                  { time: "05:00 PM", task: "Follow-up Report Review", checked: false }
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="checkbox" checked={t.checked} readOnly className="h-3 w-3 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className={`text-[10px] font-semibold w-12 ${t.checked ? 'text-slate-300 line-through' : 'text-slate-400'}`}>{t.time}</span>
                    <span className={`text-xs font-semibold flex-1 ${t.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="space-y-4 relative">
                <div className="absolute top-2 bottom-2 left-3 w-px bg-slate-100"></div>
                {[
                  { text: "New enquiry from website", time: "09:15 AM", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12", color: "text-emerald-500 bg-emerald-50" },
                  { text: "Rahul Sharma added a follow-up", time: "09:45 AM", icon: "M15 19.128a9.38 9.38 0 002.625.372", color: "text-blue-500 bg-blue-50" },
                  { text: "Payment of ₹25,000 received", time: "10:20 AM", icon: "M12 6v12m-3-2.818l.879.659", color: "text-emerald-500 bg-emerald-50" },
                  { text: "New admission: Aman Verma", time: "11:30 AM", icon: "M4.26 10.147a60.436", color: "text-indigo-500 bg-indigo-50" }
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 relative z-10">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.color}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700">{a.text}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

      {user && <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />}
    </div>
  );
}
