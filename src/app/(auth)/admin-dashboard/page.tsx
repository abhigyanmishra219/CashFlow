"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../component/context/user-context";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import ProfileDisplay from "@/components/ProfileDisplay";
import CommandPalette from "@/components/CommandPalette";
import DashboardFilter from "@/components/DashboardFilter";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import StudentSearchCenter from "@/components/StudentSearchCenter";

export default function AdminDashboard() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const defaultStart = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0];
  const defaultEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString().split("T")[0];
  const defaultLabel = `${MONTHS[currentMonth]} ${currentYear}`;

  const [startDate, setStartDate] = useState<string | null>(defaultStart);
  const [endDate, setEndDate] = useState<string | null>(defaultEnd);
  const [filterLabel, setFilterLabel] = useState<string>(defaultLabel);

  const [trendMode, setTrendMode] = useState<"daily" | "cumulative">("daily");
  const [hoveredTrendDay, setHoveredTrendDay] = useState<any>(null);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === "counsellor") {
      router.replace("/counsellor-dashboard");
    }
  }, [user, router]);

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

  useEffect(() => {
    if (user?.role !== "counsellor") {
      setIsLoading(true);
      let url = "/api/admin-dashboard/stats";
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      fetch(url)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) {
            setData(resData.data);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dashboard data:", err);
          setIsLoading(false);
        });
    }
  }, [user, startDate, endDate]);

  if (!user || user.role === "counsellor") return null;

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "A";



  // Data for Metric Cards
  const metrics = [
    { name: "Total Leads", value: data?.kpis?.totalLeads || 0, trend: filterLabel === "Overall" ? "Overall" : `Filtered: ${filterLabel}`, isGreen: true, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { name: "Today's Admissions", value: data?.kpis?.admissionsToday || 0, trend: "Today", isGreen: true, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { name: "Today's Collection", value: data?.kpis?.todayCollection || "₹0", trend: "Today", isGreen: true, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { name: "Monthly Collection", value: data?.kpis?.monthlyCollection || "₹0 L", trend: "Current Month", isGreen: true, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { name: "Pending Approvals", value: data?.kpis?.pendingApprovals || 0, trend: "Needs Action", isGreen: false, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { name: "EMI Overdue Summary", value: data?.kpis?.emiOverdueAmount || "₹0 L", trend: `${data?.kpis?.emiOverdueCount || 0} Overdue Students`, isGreen: false, color: "text-rose-600 bg-rose-50 border-rose-100" },
    { name: "Conversion Rate", value: data?.kpis?.conversionRate || "0%", trend: filterLabel === "Overall" ? "Overall" : filterLabel, isGreen: true, color: "text-sky-600 bg-sky-50 border-sky-100" },
    { name: "Total Revenue", value: data?.kpis?.revenue || "₹0 L", trend: "Total Collections", isGreen: true, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { name: "Pending Calls", value: data?.kpis?.pendingCalls || 0, trend: "Follow-up due", isGreen: false, color: "text-orange-600 bg-orange-50 border-orange-100", simpleText: true },
    { name: "Hot Negotiation Leads", value: data?.kpis?.hotLeads || 0, trend: "High Priority", isGreen: true, color: "text-red-600 bg-red-50 border-red-100", simpleText: true }
  ];

  const pipeline = data?.pipeline || [];

  const processedTrendDays = React.useMemo(() => {
    if (!data?.trendDays) return [];
    if (trendMode === "daily") return data.trendDays;

    let runningLeads = 0;
    let runningAdmissions = 0;
    let runningLost = 0;
    let runningFollowups = 0;

    return data.trendDays.map((d: any) => {
      runningLeads += d.newLeads || 0;
      runningAdmissions += d.admissions || 0;
      runningLost += d.lostLeads || 0;
      runningFollowups += d.followUps || 0;

      return {
        ...d,
        newLeads: runningLeads,
        admissions: runningAdmissions,
        lostLeads: runningLost,
        followUps: runningFollowups,
      };
    });
  }, [data?.trendDays, trendMode]);

  // Trend line chart generation
  const maxVal = Math.max(
    ...(processedTrendDays.map((d: any) => Math.max(d.newLeads, d.admissions, d.lostLeads, d.followUps)) || [0]),
    10
  );

  const generatePath = (key: string) => {
    if (!processedTrendDays || processedTrendDays.length === 0) return "";
    const totalPoints = processedTrendDays.length;
    const step = 600 / Math.max(1, totalPoints - 1);
    return processedTrendDays.map((d: any, i: number) => {
      const x = i * step;
      const y = 160 - ((d[key] || 0) / maxVal) * 140;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(" ");
  };

  // Donut chart generation
  let currentOffset = 0;
  const donutCircles = (data?.enquiriesBySource || []).map((source: any, i: number) => {
    const strokeDasharray = `${source.pctNum} ${100 - source.pctNum}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += source.pctNum;
    return (
      <circle key={i} cx="18" cy="18" r="15.915" fill="transparent" stroke={source.hex} strokeWidth="3" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
    );
  });

  const handleMarkLost = async () => {
    if (!enquiryToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiryToDelete.dbId}?lostLead=true`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        let url = "/api/admin-dashboard/stats";
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        const refetchRes = await fetch(url);
        const refetchData = await refetchRes.json();
        if (refetchData.success) {
          setData(refetchData.data);
        }
        setIsDeleteModalOpen(false);
        setEnquiryToDelete(null);
      } else {
        alert("Failed to mark as lost: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while marking as lost");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6">

        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-6 shrink-0 transition-colors duration-200">
          <div>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 select-none">
              <span>CoachFlow</span>
              <span>/</span>
              <span className="text-slate-600 font-bold">Enquiries Command Center (Live)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="relative w-full sm:w-64 flex items-center justify-between pl-3 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 group"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 mr-2 group-hover:text-indigo-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                Search anything...
              </div>
              <span className="flex items-center pointer-events-none text-[9px] font-bold text-slate-400/80 uppercase">
                CTRL+K
              </span>
            </button>
            <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />


            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-700">{user.name}</div>
                <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">{user.role}</div>
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-500 shadow-md hover:bg-indigo-500 transition-colors overflow-hidden shrink-0"
                title="View Profile Details"
              >
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : null}
                <span className={user.photoUrl ? "hidden" : "block"}>{initialLetter}</span>
              </button>
            </div>

          </div>
        </header>

        {/* Super Admin Quick Actions Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 mb-6 shadow-xs flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-2 select-none">Quick Actions:</span>
            <button
              onClick={() => router.push("/admin-dashboard/brands")}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>🏢 Add Brand</span>
            </button>
            <button
              onClick={() => router.push("/companies")}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>🏛️ Add Company</span>
            </button>
            <button
              onClick={() => router.push("/counsellors")}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>👤 Add User</span>
            </button>
            <button
              onClick={() => router.push("/admin-dashboard/reports")}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>📊 View Reports</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (!data?.enquiriesList) return;
              const csvContent = "data:text/csv;charset=utf-8," + ["ID,Student,Course,Counsellor,Stage"].concat(data.enquiriesList.map((e: any) => `${e.id},${e.student},${e.course},${e.counsellor},${e.stage}`)).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `CoachFlow_Export_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>📥 Export Data (CSV)</span>
          </button>
        </div>

        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

        <div className="space-y-6">
          {/* Student Search & Action Center */}
          <StudentSearchCenter />

          <DashboardFilter
            currentLabel={filterLabel}
            onFilterChange={(start, end, label) => {
              setStartDate(start);
              setEndDate(end);
              setFilterLabel(label);
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-3">
            {isLoading && !data ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between h-24 animate-pulse">
                  <div className="h-2.5 w-16 bg-slate-200 rounded-md"></div>
                  <div className="h-6 w-12 bg-slate-200 rounded-lg my-1"></div>
                  <div className="h-3.5 w-14 bg-slate-100 rounded-md"></div>
                </div>
              ))
            ) : (
              metrics.map((card, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-slate-400/90 truncate uppercase select-none">{card.name}</span>
                  <div className="my-2 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-800 tracking-tight">{card.value}</span>
                  </div>
                  <span className={`text-[9px] font-bold truncate rounded-md px-1 py-0.5 w-fit ${card.simpleText ? "text-slate-500 bg-slate-100" :
                      card.isGreen ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                    }`}>
                    {card.trend}
                  </span>
                </div>
              ))
            )}
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                    Lead Trend ({filterLabel === "Overall" ? "Last 30 Days" : filterLabel})
                  </h2>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTrendMode("daily")}
                      className={`px-2 py-0.5 rounded-md transition-all ${trendMode === "daily" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMode("cumulative")}
                      className={`px-2 py-0.5 rounded-md transition-all ${trendMode === "cumulative" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Cumulative
                    </button>
                  </div>
                </div>
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

              <div className="relative w-full h-48 group">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2="600" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                  <path d={generatePath('newLeads')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={generatePath('admissions')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={generatePath('lostLeads')} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={generatePath('followUps')} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Vertical Guide Line on Hover */}
                  {hoveredTrendIndex !== null && processedTrendDays && (
                    <line
                      x1={hoveredTrendIndex * (600 / Math.max(1, processedTrendDays.length - 1))}
                      y1="10"
                      x2={hoveredTrendIndex * (600 / Math.max(1, processedTrendDays.length - 1))}
                      y2="160"
                      stroke="#64748b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Invisible Hover Rectangles for each date point */}
                  {processedTrendDays?.map((d: any, i: number) => {
                    const step = 600 / Math.max(1, processedTrendDays.length - 1);
                    const cx = i * step;
                    return (
                      <rect
                        key={i}
                        x={cx - step / 2}
                        y="0"
                        width={step}
                        height="180"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          setHoveredTrendDay(d);
                          setHoveredTrendIndex(i);
                        }}
                        onMouseLeave={() => {
                          setHoveredTrendDay(null);
                          setHoveredTrendIndex(null);
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Interactive Tooltip Popover */}
                {hoveredTrendDay && hoveredTrendIndex !== null && processedTrendDays && (
                  <div
                    className="absolute top-2 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl z-30 border border-slate-700/80 transition-all"
                    style={{
                      left: `${Math.min(82, Math.max(8, (hoveredTrendIndex / Math.max(1, processedTrendDays.length - 1)) * 100))}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-bold text-[11px] text-slate-300 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-4">
                      <span>{hoveredTrendDay.dateLabel}</span>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase">{trendMode === "daily" ? "Daily Count" : "Cumulative Total"}</span>
                    </div>
                    <div className="space-y-1 text-[10px] font-semibold">
                      <div className="flex justify-between items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span> {trendMode === "daily" ? "New Leads Today" : "Total Leads to Date"}:</span>
                        <span className="font-bold text-white">{hoveredTrendDay.newLeads}</span>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Admissions:</span>
                        <span className="font-bold text-emerald-400">{hoveredTrendDay.admissions}</span>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Follow-ups:</span>
                        <span className="font-bold text-amber-400">{hoveredTrendDay.followUps}</span>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Lost Leads:</span>
                        <span className="font-bold text-rose-400">{hoveredTrendDay.lostLeads}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 px-2 select-none">
                {processedTrendDays?.filter((_: any, i: number) => i % Math.max(1, Math.floor((processedTrendDays.length || 30) / 6)) === 0).map((d: any, idx: number) => (
                  <span key={idx}>{d.dateLabel}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-3">Lead Source Distribution</h2>

              <div className="flex items-center gap-4">
                <div className="h-28 w-28 shrink-0 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    {donutCircles}
                  </svg>
                  <span className="absolute text-[10px] font-bold text-slate-500 select-none">Sources</span>
                </div>

                <div className="flex-1 space-y-1 text-[10px] font-semibold text-slate-500">
                  {data?.enquiriesBySource?.map((src: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${src.color}`}></span>{src.label}</span>
                      <span>{src.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Counsellor Performance</h2>
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
                    {data?.counsellorPerformance?.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 text-slate-800">{c.name}</td>
                        <td className="text-right">{c.assigned}</td>
                        <td className="text-right">{c.followups}</td>
                        <td className="text-right text-emerald-600">{c.admissions}</td>
                        <td className="text-right">{c.conversion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Brand Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Brand</th>
                      <th className="pb-2 text-right">Leads</th>
                      <th className="pb-2 text-right">Admissions</th>
                      <th className="pb-2 text-right">Revenue</th>
                      <th className="pb-2 text-right">Conv %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    {data?.brandPerformance?.map((b: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 text-slate-800">{b.name}</td>
                        <td className="text-right">{b.leads}</td>
                        <td className="text-right">{b.admissions}</td>
                        <td className="text-right text-indigo-600">{b.revenue}</td>
                        <td className="text-right text-emerald-600">{b.achievePct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Company Limit & Utilization</h2>
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
                    {data?.companyUtilization?.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 text-slate-800">{c.name}</td>
                        <td className="text-right">{c.collection}</td>
                        <td className="text-right text-emerald-600">{c.usedPct}</td>
                        <td className="text-right">{c.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-4">System Work Queue</h2>
              <div className="space-y-3 font-semibold text-xs">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Follow-ups Due Today</span><span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{data?.workQueue?.followUpsDue || 0}</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Missed / Overdue</span><span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">{data?.workQueue?.missedCalls || 0}</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Counselling Scheduled</span><span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">{data?.workQueue?.counsellingScheduled || 0}</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Negotiation Phase</span><span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-md">{data?.workQueue?.admissionsWaiting || 0}</span></div>
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><span className="text-slate-600">Students w/ Fee Pending</span><span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">{data?.workQueue?.feePending || 0}</span></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-4">Recent Activity</h2>
              <div className="space-y-4 relative pl-4 border-l border-slate-100">
                {data?.recentActivity?.map((act: any, i: number) => (
                  <div key={i} className="relative">
                    <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${act.color}`}></span>
                    <span className="text-[10px] text-slate-400 font-bold">{act.time}</span>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">{act.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Recent Enquiries</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2 w-10 text-center">Lost</th>
                      <th className="pb-2">Enquiry No</th>
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Course</th>
                      <th className="pb-2">Counsellor</th>
                      <th className="pb-2">Stage</th>
                      <th className="pb-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 font-semibold text-slate-600">
                    {data?.enquiriesList?.map((e: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={false}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                            onChange={(ev) => {
                              if (ev.target.checked) {
                                if (!e.dbId || e.dbId === "undefined") {
                                  alert("Please refresh the page to sync the latest data before performing this action.");
                                  return;
                                }
                                setEnquiryToDelete(e);
                                setIsDeleteModalOpen(true);
                              }
                            }}
                            title="Mark as Lost Lead (Deletes Enquiry)"
                          />
                        </td>
                        <td className="py-2.5 text-indigo-600 font-bold">{e.id}</td>
                        <td className="text-slate-800">{e.student}</td>
                        <td>{e.course}</td>
                        <td>{e.counsellor}</td>
                        <td><span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">{e.stage}</span></td>
                        <td><span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">{e.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={handleMarkLost}
        title="Mark Enquiry as Lost"
        itemName={enquiryToDelete?.student ? `enquiry for ${enquiryToDelete.student}` : "this enquiry"}
        description="Are you sure you want to mark this enquiry as lost? It will be permanently deleted and the lost lead count will increment."
        isLoading={isDeleting}
      />
    </div>
  );
}
