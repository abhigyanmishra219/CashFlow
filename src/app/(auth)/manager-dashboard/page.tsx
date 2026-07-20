"use client";

import React, { useState, useEffect } from "react";
import ManagerSidebar from "@/components/ManagerSidebar";
import { useUser } from "../../component/context/user-context";
import ProfileDisplay from "@/components/ProfileDisplay";
import CommandPalette from "@/components/CommandPalette";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import StudentSearchCenter from "@/components/StudentSearchCenter";

interface DashboardStats {
  selectedBrand: string;
  availableBrands: string[];
  kpis: {
    totalLeads: number;
    newLeads: number;
    followUpsToday: number;
    admissions: number;
    revenue: string;
    collection: string;
    pendingFees: string;
  };
  pipeline: { label: string; count: number; pct: string; color: string }[];
  trendDays: { dateLabel: string; newLeads: number; admissions: number; lostLeads: number }[];
  topCounsellors: {
    rank: number;
    id: string;
    name: string;
    initials: string;
    adm: number;
    rev: string;
    conv: string;
  }[];
  enquiriesBySource: {
    label: string;
    count: number;
    pct: string;
    pctNum: number;
    color: string;
    hex: string;
  }[];
  todayFollowups: {
    id: string;
    name: string;
    initials: string;
    time: string;
    action: string;
    phone: string;
  }[];
  recentActivity: {
    text: string;
    time: string;
    color: string;
  }[];
}

export default function ManagerDashboard() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch Dashboard Stats from Backend API
  const fetchStats = async (brandParam?: string) => {
    try {
      setLoading(true);
      const b = brandParam !== undefined ? brandParam : selectedBrand;
      const url = b && b !== "all" ? `/api/manager-dashboard/stats?brand=${encodeURIComponent(b)}` : "/api/manager-dashboard/stats";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedBrand);
  }, [selectedBrand]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const displayName = user?.name || "Loading...";
  const displayRole = user?.role || "Brand Manager";
  const initialLetter = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  // Calculate SVG Trend paths if trendDays available
  const getTrendPaths = () => {
    if (!stats || !stats.trendDays || stats.trendDays.length === 0) return { newLeadsPath: "", admissionsPath: "", lostLeadsPath: "" };
    
    const days = stats.trendDays;
    const width = 400;
    const height = 120;
    const maxVal = Math.max(
      ...days.map(d => Math.max(d.newLeads, d.admissions, d.lostLeads)),
      10
    );

    const pointsNew = days.map((d, i) => {
      const x = (i / (days.length - 1)) * width;
      const y = height - (d.newLeads / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");

    const pointsAdm = days.map((d, i) => {
      const x = (i / (days.length - 1)) * width;
      const y = height - (d.admissions / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");

    const pointsLost = days.map((d, i) => {
      const x = (i / (days.length - 1)) * width;
      const y = height - (d.lostLeads / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");

    return { newLeadsPath: pointsNew, admissionsPath: pointsAdm, lostLeadsPath: pointsLost, maxVal };
  };

  const trendData = getTrendPaths();

  // Compute SVG Donut Chart Stroke Array Offsets
  const getDonutSegments = () => {
    if (!stats || !stats.enquiriesBySource) return [];
    let cumulativeOffset = 0;
    const totalCircumference = 100; // r = 15.9155 gives circ approx 100

    return stats.enquiriesBySource.map((src) => {
      const dash = src.pctNum;
      const gap = totalCircumference - dash;
      const offset = cumulativeOffset;
      cumulativeOffset += dash;
      return {
        ...src,
        dashArray: `${dash.toFixed(1)} ${gap.toFixed(1)}`,
        dashOffset: `-${offset.toFixed(1)}`
      };
    });
  };

  const donutSegments = getDonutSegments();

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 font-sans overflow-hidden">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header Area */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4 py-2 shadow-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Leads
            </button>

            {/* Search Input Button */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center justify-between px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors w-56 text-slate-400 group"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:text-indigo-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Search...
                </div>
                <span className="text-[10px] font-bold text-slate-400/80 uppercase">
                  CTRL+K
                </span>
              </button>
            </div>

            {/* Profile Avatar */}
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm group-hover:shadow transition-shadow overflow-hidden shrink-0">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : null}
                <span className={user?.photoUrl ? "hidden" : "block"}>{initialLetter}</span>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-extrabold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{displayRole}</p>
              </div>
            </div>
          </div>
        </header>

        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

        {/* Dashboard Content */}
        <main className="p-8 pb-32 space-y-6">
          {/* Student Search & Action Center */}
          <StudentSearchCenter />
          
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Total Leads</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.totalLeads ?? 0)}</p>
                </div>
                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600">Active Pipeline</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">New Leads</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.newLeads ?? 0)}</p>
                </div>
                <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600">Fresh Prospects</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Follow-ups Today</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.followUpsToday ?? 0)}</p>
                </div>
                <div className="h-8 w-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-amber-600">Scheduled</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Admissions</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.admissions ?? 0)}</p>
                </div>
                <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-purple-600">Total Enrolled</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Revenue</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.revenue ?? "â‚¹0 L")}</p>
                </div>
                <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600">Booked Course Fees</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Collection</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.collection ?? "â‚¹0 L")}</p>
                </div>
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-blue-600">Payments Received</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-1">Pending Fees</h3>
                  <p className="text-xl font-extrabold text-slate-800">{loading ? "..." : (stats?.kpis?.pendingFees ?? "â‚¹0 L")}</p>
                </div>
                <div className="h-8 w-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-[10px] font-bold text-rose-600">Outstanding Balance</p>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lead Pipeline */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Lead Pipeline</h3>
              <div className="flex-1 flex items-center gap-6">
                <div className="flex-1 flex flex-col gap-1 items-center justify-center">
                  {stats?.pipeline?.map((item, idx) => {
                    const widthPct = Math.max(25, 100 - idx * 12);
                    return (
                      <div
                        key={idx}
                        style={{ width: `${widthPct}%` }}
                        className={`h-7 ${item.color} rounded-md transition-all duration-300 shadow-sm`}
                        title={`${item.label}: ${item.count}`}
                      />
                    );
                  })}
                </div>
                <div className="flex-1 space-y-3">
                  {loading ? (
                    <p className="text-xs text-slate-400">Loading pipeline...</p>
                  ) : (
                    stats?.pipeline?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 ${item.color} rounded-sm`}></span>
                          <span className="font-semibold text-slate-600">{item.label}</span>
                        </div>
                        <div className="font-bold text-slate-800">
                          {item.count} <span className="text-[10px] text-slate-400 font-semibold">({item.pct})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Leads Trend Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Leads Trend <span className="text-[10px] text-slate-400 font-normal">(Last 15 Days)</span></h3>
              </div>
              <div className="flex gap-4 justify-center mb-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#2563eb] rounded-sm"></span>New Leads</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#22c55e] rounded-sm"></span>Admissions</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#ef4444] rounded-sm"></span>Lost Leads</span>
              </div>
              <div className="flex-1 relative mt-2 min-h-[140px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">Loading trend chart...</div>
                ) : (
                  <svg viewBox="0 0 400 140" className="w-full h-full overflow-visible">
                    {/* Horizontal Grid lines */}
                    {[0, 35, 70, 105].map(y => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    
                    {/* Trend Lines */}
                    {trendData.newLeadsPath && (
                      <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={trendData.newLeadsPath} />
                    )}
                    {trendData.admissionsPath && (
                      <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" points={trendData.admissionsPath} />
                    )}
                    {trendData.lostLeadsPath && (
                      <polyline fill="none" stroke="#ef4444" strokeWidth="2.5" points={trendData.lostLeadsPath} />
                    )}

                    {/* Date X-Axis Labels */}
                    {stats?.trendDays?.map((d, i) => {
                      if (i % 3 === 0 || i === (stats.trendDays.length - 1)) {
                        const x = (i / (stats.trendDays.length - 1)) * 400;
                        return (
                          <text key={i} x={x} y="138" className="text-[9px] fill-slate-400 font-semibold" textAnchor="middle">
                            {d.dateLabel}
                          </text>
                        );
                      }
                      return null;
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Top Counsellors */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Top Counsellors <span className="text-[10px] text-slate-400 font-semibold">(By Admissions)</span></h3>
              </div>
              <div className="grid grid-cols-12 pb-2 mb-2 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Counsellor</div>
                <div className="col-span-2 text-center">Admissions</div>
                <div className="col-span-2 text-center">Revenue</div>
                <div className="col-span-2 text-right">Conv. %</div>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[220px]">
                {loading ? (
                  <p className="text-xs text-slate-400">Loading counsellors...</p>
                ) : stats?.topCounsellors && stats.topCounsellors.length > 0 ? (
                  stats.topCounsellors.map(c => (
                    <div key={c.rank} className="grid grid-cols-12 items-center text-xs">
                      <div className="col-span-6 flex items-center gap-2">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          c.rank === 1 ? 'bg-amber-400 text-white' : 
                          c.rank === 2 ? 'bg-slate-300 text-white' : 
                          c.rank === 3 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {c.rank}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">{c.initials}</div>
                          <span className="font-semibold text-slate-700 truncate">{c.name}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-bold text-slate-800">{c.adm}</div>
                      <div className="col-span-2 text-center font-semibold text-slate-600">{c.rev}</div>
                      <div className="col-span-2 text-right font-semibold text-slate-800">{c.conv}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No counsellor data recorded yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Enquiries by Source */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-800 self-start mb-6">Enquiries by Source</h3>
              <div className="flex items-center gap-6 w-full">
                <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {donutSegments.map((s, idx) => (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={s.hex}
                        strokeWidth="7"
                        strokeDasharray={s.dashArray}
                        strokeDashoffset={s.dashOffset}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white m-4 shadow-inner"></div>
                </div>
                <div className="flex-1 space-y-2">
                  {loading ? (
                    <p className="text-xs text-slate-400">Loading sources...</p>
                  ) : (
                    stats?.enquiriesBySource?.map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 ${s.color} rounded-sm`}></span>
                          <span className="font-semibold text-slate-600">{s.label}</span>
                        </div>
                        <span className="font-bold text-slate-800">{s.pct} <span className="text-slate-400">({s.count})</span></span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Today's Follow-ups */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Today's Scheduled Follow-ups</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-xs text-slate-400">Loading followups...</p>
                ) : stats?.todayFollowups && stats.todayFollowups.length > 0 ? (
                  stats.todayFollowups.map((f, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px]">{f.initials}</div>
                        <div>
                          <span className="text-xs font-semibold text-slate-700 block leading-tight">{f.name}</span>
                          <span className="text-[9px] text-slate-400">{f.phone}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{f.time}</span>
                      <button className="text-[9px] font-bold px-2 py-0.5 rounded border text-emerald-600 bg-emerald-50 border-emerald-100">
                        {f.action}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No follow-ups scheduled for today.</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">Recent System Activity</h3>
              </div>
              <div className="space-y-4 relative">
                <div className="absolute top-2 bottom-2 left-3 w-px bg-slate-100"></div>
                {loading ? (
                  <p className="text-xs text-slate-400">Loading activities...</p>
                ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((a, i) => (
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
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {user && <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />}
      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchStats(selectedBrand)}
      />
    </div>
  );
}
