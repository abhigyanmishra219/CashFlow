"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../component/context/user-context";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import ProfileDisplay from "@/components/ProfileDisplay";

export default function AdminDashboard() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.role === "counsellor") {
      router.replace("/counsellor-dashboard");
    }
  }, [user, router]);

  if (!user || user.role === "counsellor") return null;

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "A";

  // Data for Metric Cards
  const metrics = [
    { name: "Today's Leads", value: "128", trend: "+ 18.4% vs yesterday", isGreen: true, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { name: "New Today", value: "42", trend: "↑ 12.6%", isGreen: true, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { name: "Follow-ups Today", value: "26", trend: "↑ 8.1%", isGreen: true, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { name: "Walk-ins", value: "14", trend: "↑ 7.3%", isGreen: true, color: "text-violet-600 bg-violet-50 border-violet-100" },
    { name: "Admissions", value: "18", trend: "↑ 20.0%", isGreen: true, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { name: "Lost Leads", value: "7", trend: "↓ 12.5%", isGreen: false, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { name: "Conversion Rate", value: "31.8%", trend: "↑ 10.2%", isGreen: true, color: "text-sky-600 bg-sky-50 border-sky-100" },
    { name: "Revenue (INR)", value: "₹4.85 L", trend: "↑ 15.6%", isGreen: true, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { name: "Pending Calls", value: "52", trend: "Needs attention", isGreen: false, color: "text-orange-600 bg-orange-50 border-orange-100", simpleText: true },
    { name: "Hot Leads", value: "21", trend: "High priority", isGreen: true, color: "text-red-600 bg-red-50 border-red-100", simpleText: true }
  ];

  // Pipeline Data
  const pipeline = [
    { stage: "New Lead", count: 85, pct: "20.5%", color: "bg-blue-500" },
    { stage: "Contacted", count: 62, pct: "15.0%", color: "bg-sky-500" },
    { stage: "Counselling Scheduled", count: 41, pct: "10.0%", color: "bg-orange-400" },
    { stage: "Visited", count: 30, pct: "7.3%", color: "bg-purple-500" },
    { stage: "Demo Attended", count: 24, pct: "5.8%", color: "bg-teal-500" },
    { stage: "Negotiation", count: 19, pct: "4.6%", color: "bg-amber-500" },
    { stage: "Admission", count: 18, pct: "4.4%", color: "bg-emerald-500" },
    { stage: "Lost", count: 7, pct: "1.7%", color: "bg-rose-500" }
  ];

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6">
        
        {/* Top bar header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-6 shrink-0 transition-colors duration-200">
          <div>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 select-none">
              <span>CoachFlow</span>
              <span>/</span>
              <span className="text-slate-600 font-bold">Enquiries Command Center</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-14 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors duration-200"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[9px] font-bold text-slate-400/80 uppercase">
                CTRL+K
              </span>
            </div>

            {/* Dark Mode Icon */}
            <button className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="relative p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white select-none">
                4
              </span>
            </button>
            {/* Profile badge & logout toggle */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-700">{user.name}</div>
                <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">{user.role}</div>
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-500 shadow-md hover:bg-indigo-500 transition-colors"
                title="View Profile Details"
              >
                {initialLetter}
              </button>
            </div>

            <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <div className="space-y-6">
          
          {/* Row 1: Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3">
            {metrics.map((card, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-semibold text-slate-400/90 truncate uppercase select-none">{card.name}</span>
                <div className="my-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800 tracking-tight">{card.value}</span>
                </div>
                <span className={`text-[9px] font-bold truncate rounded-md px-1 py-0.5 w-fit ${
                  card.simpleText ? "text-slate-500 bg-slate-100" :
                  card.isGreen ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                }`}>
                  {card.trend}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2: Pipeline Overview */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Enquiry Pipeline Overview</h2>
              <select className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 relative">
              {pipeline.map((item, index) => (
                <div key={index} className="relative flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[10px] font-semibold text-slate-400 truncate block uppercase select-none">{item.stage}</span>
                    <span className="text-lg font-bold text-slate-800 block mt-1">{item.count}</span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                      <div className={`${item.color} h-full`} style={{ width: item.pct }}></div>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1">{item.pct}</span>
                  </div>
                  {index < pipeline.length - 1 && (
                    <span className="hidden xl:flex text-slate-300 font-bold select-none shrink-0">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Graphs & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lead Trend Line Chart (Inline SVG) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Lead Trend (Last 30 Days)</h2>
                <div className="flex gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span> Total Leads
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Admissions
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Lost Leads
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> Follow-ups
                  </span>
                </div>
              </div>

              {/* Render an inline SVG representing a line chart */}
              <div className="w-full h-48">
                <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Lines Paths */}
                  {/* Total Leads - Blue */}
                  <path d="M 10 90 Q 100 80 190 92 T 370 85 T 550 78 T 590 82" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  {/* Admissions - Green */}
                  <path d="M 10 110 Q 100 112 190 105 T 370 112 T 550 90 T 590 95" fill="none" stroke="#10b981" strokeWidth="2" />
                  {/* Lost Leads - Red */}
                  <path d="M 10 145 Q 100 148 190 138 T 370 145 T 550 120 T 590 122" fill="none" stroke="#ef4444" strokeWidth="2" />
                  {/* Follow-ups - Yellow */}
                  <path d="M 10 130 Q 100 125 190 120 T 370 132 T 550 110 T 590 108" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 px-2 select-none">
                <span>6 Jun</span>
                <span>11 Jun</span>
                <span>16 Jun</span>
                <span>21 Jun</span>
                <span>26 Jun</span>
                <span>1 Jul</span>
                <span>6 Jul</span>
              </div>
            </div>

            {/* Donut Chart and AI Insights */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-3">Lead Source Distribution</h2>
              
              <div className="flex items-center gap-4">
                {/* Donut SVG */}
                <div className="h-28 w-28 shrink-0 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    {/* Sections */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="32 68" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#06b6d4" strokeWidth="3" strokeDasharray="24 76" strokeDashoffset="-32" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="16 84" strokeDashoffset="-56" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="-72" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#a855f7" strokeWidth="3" strokeDasharray="16 84" strokeDashoffset="-84" />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-slate-500 select-none">Sources</span>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-1 text-[10px] font-semibold text-slate-500">
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span>Instagram</span><span>32%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500"></span>Google Ads</span><span>24%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Website</span><span>16%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Walk-in</span><span>12%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500"></span>Facebook</span><span>7%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Performance Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Counsellor Performance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Counsellor Performance</h2>
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 select-none">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Counsellor</th>
                      <th className="pb-2 text-right">Assigned</th>
                      <th className="pb-2 text-right">Follow-ups</th>
                      <th className="pb-2 text-right">Admissions</th>
                      <th className="pb-2 text-right">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    <tr><td className="py-2.5 text-slate-800">Rahul Sharma</td><td className="text-right">58</td><td className="text-right">43</td><td className="text-right text-emerald-600">18</td><td className="text-right">31.0%</td></tr>
                    <tr><td className="py-2.5 text-slate-800">Amit Verma</td><td className="text-right">72</td><td className="text-right">60</td><td className="text-right text-emerald-600">22</td><td className="text-right">30.6%</td></tr>
                    <tr><td className="py-2.5 text-slate-800">Priya Singh</td><td className="text-right">44</td><td className="text-right">41</td><td className="text-right text-emerald-600">16</td><td className="text-right">36.4%</td></tr>
                    <tr><td className="py-2.5 text-slate-800">Neha Patel</td><td className="text-right">36</td><td className="text-right">28</td><td className="text-right text-emerald-600">9</td><td className="text-right">25.0%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Brand Performance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Brand Performance</h2>
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 select-none">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Brand</th>
                      <th className="pb-2 text-right">Leads</th>
                      <th className="pb-2 text-right">Admissions</th>
                      <th className="pb-2 text-right">Revenue</th>
                      <th className="pb-2 text-right">Achieve %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    <tr><td className="py-2.5 text-slate-800">Design Gateway</td><td className="text-right">124</td><td className="text-right">28</td><td className="text-right text-indigo-600">₹18.20 L</td><td className="text-right text-emerald-600">82.7%</td></tr>
                    <tr><td className="py-2.5 text-slate-800">CADD Mantra</td><td className="text-right">88</td><td className="text-right">17</td><td className="text-right text-indigo-600">₹11.10 L</td><td className="text-right text-amber-500">61.7%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Company Performance */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Company Limit & Utilization</h2>
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 select-none">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Company</th>
                      <th className="pb-2 text-right">Collection</th>
                      <th className="pb-2 text-right">Used %</th>
                      <th className="pb-2 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    <tr><td className="py-2.5 text-slate-800">DG Edu Pvt. Ltd.</td><td className="text-right">₹14.25 L</td><td className="text-right text-emerald-600">73.1%</td><td className="text-right">₹5.25 L</td></tr>
                    <tr><td className="py-2.5 text-slate-800">DG Skills Academy</td><td className="text-right">₹9.80 L</td><td className="text-right text-emerald-600">50.2%</td><td className="text-right">₹9.70 L</td></tr>
                    <tr><td className="py-2.5 text-slate-800">CADD Mantra Tech</td><td className="text-right">₹7.40 L</td><td className="text-right text-amber-500">37.9%</td><td className="text-right">₹12.10 L</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Row 5: Work Queue, Timeline, Enquiries list */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Work Queue */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-4">Today's Work Queue</h2>
              <div className="space-y-3 font-semibold text-xs">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Follow-ups Due</span><span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">26</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Missed Calls</span><span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">9</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Counselling Scheduled</span><span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">11</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Admissions Waiting</span><span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">5</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Fee Pending</span><span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">8</span></div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-4">Recent Activity</h2>
              <div className="space-y-4 relative pl-4 border-l border-slate-100">
                <div className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-emerald-500"></span><span className="text-[10px] text-slate-400 font-bold">09:45</span><p className="text-xs text-slate-600 font-semibold mt-0.5">Rahul Sharma admitted Aman Verma to AutoCAD Course</p></div>
                <div className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500"></span><span className="text-[10px] text-slate-400 font-bold">09:30</span><p className="text-xs text-slate-600 font-semibold mt-0.5">Priya Singh completed follow-up with Neha Gupta</p></div>
                <div className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-purple-500"></span><span className="text-[10px] text-slate-400 font-bold">09:15</span><p className="text-xs text-slate-600 font-semibold mt-0.5">Payment received ₹25,000 from Rohan Mehta</p></div>
                <div className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-amber-500"></span><span className="text-[10px] text-slate-400 font-bold">09:02</span><p className="text-xs text-slate-600 font-semibold mt-0.5">New lead assigned to Amit Verma</p></div>
              </div>
            </div>

            {/* Enquiries Grid (Colspan 2) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">All Enquiries</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="text-[10px] font-bold border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1 text-slate-500 select-none">Filters</button>
                  <button className="text-[10px] font-bold border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1 text-slate-500 select-none">Columns</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Enquiry No</th>
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Course</th>
                      <th className="pb-2">Counsellor</th>
                      <th className="pb-2">Stage</th>
                      <th className="pb-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    <tr>
                      <td className="py-2.5 text-indigo-600 font-bold">ENQ080801</td>
                      <td className="text-slate-800">Aman Verma</td>
                      <td>AutoCAD</td>
                      <td>Rahul Sharma</td>
                      <td><span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold uppercase">Counselling</span></td>
                      <td><span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-bold uppercase">High</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-indigo-600 font-bold">ENQ080802</td>
                      <td className="text-slate-800">Neha Gupta</td>
                      <td>Revit</td>
                      <td>Priya Singh</td>
                      <td><span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold uppercase">Contacted</span></td>
                      <td><span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold uppercase">Medium</span></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-indigo-600 font-bold">ENQ080803</td>
                      <td className="text-slate-800">Rohan Mehta</td>
                      <td>3ds Max</td>
                      <td>Amit Verma</td>
                      <td><span className="text-[9px] bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-md font-bold uppercase">New Lead</span></td>
                      <td><span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-bold uppercase">High</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Floating Action Plus Button */}
        <div className="fixed bottom-6 right-6">
          <button className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
