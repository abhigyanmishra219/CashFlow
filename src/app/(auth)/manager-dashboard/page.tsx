"use client";

import React, { useState, useEffect } from "react";
import ManagerSidebar from "@/components/ManagerSidebar";
import { useUser } from "../../component/context/user-context";
import ProfileDisplay from "@/components/ProfileDisplay";
import CommandPalette from "@/components/CommandPalette";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

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
    } fontally: {
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
  const userBrandScope = user?.brandScope || "All Brands";
  const initialLetter = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 font-sans overflow-hidden">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Header Area */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Brand Manager Command Center</h2>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
              Brand: {userBrandScope}
            </span>
          </div>

          <div className="flex items-center gap-4">
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

            {/* Profile Avatar Button */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-500 shadow-sm overflow-hidden">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[11px] font-semibold text-indigo-600 leading-tight mt-0.5 capitalize">{displayRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Brand Manager Quick Actions Toolbar */}
        <div className="px-8 pt-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-2 select-none">Quick Actions:</span>
              <button
                onClick={() => router.push("/manager-dashboard/counsellors")}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>👥 View Team</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>🎯 Assign Lead</span>
              </button>
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>✅ Approve Requests</span>
              </button>
            </div>

            {/* Brand Filter Selector */}
            {stats?.availableBrands && stats.availableBrands.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Brand Scope:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Assigned Brands</option>
                  {stats.availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Cards Content */}
        <div className="p-8 space-y-8">
          
          {/* Brand Manager Specified Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">Today's Leads</span>
              <span className="text-2xl font-black text-slate-800">{stats?.kpis?.newLeads || 0}</span>
              <span className="text-xs text-slate-400 font-medium block mt-1">Total: {stats?.kpis?.totalLeads || 0}</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Brand Admissions</span>
              <span className="text-2xl font-black text-slate-800">{stats?.kpis?.admissions || 0}</span>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">Confirmed Conversions</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1">Brand Collection</span>
              <span className="text-2xl font-black text-slate-800">{stats?.kpis?.collection || "₹0 L"}</span>
              <span className="text-xs text-purple-600 font-semibold block mt-1">Revenue: {stats?.kpis?.revenue || "₹0 L"}</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">EMI Recovery Status</span>
              <span className="text-2xl font-black text-rose-600">{stats?.kpis?.pendingFees || "₹0 L"}</span>
              <span className="text-xs text-rose-500 font-semibold block mt-1">Pending Installment Balance</span>
            </div>
          </div>

          {/* Secondary Brand Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Company Allocation Status */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>🏛️ Company Allocation Status</span>
                <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">ACTIVE</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Automated Ledger Cap Engine allocates non-cash payments to compliant brand entities.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Current Ledger Mode:</span>
                  <span className="text-indigo-600">Smart Round Robin</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Cap Threshold:</span>
                  <span>₹19.50 L / Company</span>
                </div>
              </div>
            </div>

            {/* Pending Approvals & Discounts */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>✅ Pending Approvals & Discounts</span>
                <span className="text-amber-600 font-extrabold text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">ACTION REQ</span>
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">Fee Discount Requests</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Special fee concession approvals</span>
                  </div>
                  <button
                    onClick={() => setIsApprovalModalOpen(true)}
                    className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>

            {/* Team Performance Leaderboard */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>🏆 Team Performance</span>
                <button
                  onClick={() => router.push("/manager-dashboard/counsellors")}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  View All
                </button>
              </h3>

              <div className="space-y-2">
                {(stats?.topCounsellors || []).slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {c.initials}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{c.adm} Admissions</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600">{c.rev}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modals */}
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        <ImportLeadsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => fetchStats(selectedBrand)} />
        <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />

        {/* Pending Approvals Modal */}
        {isApprovalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Brand Manager Approvals</h3>
                <button onClick={() => setIsApprovalModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                No critical pending fee concession approvals require your authorization at this moment.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
