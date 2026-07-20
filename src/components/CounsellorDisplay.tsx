"use client";

import React, { useState, useEffect, useRef } from "react";
import RegisterCounsellorModal from "./RegisterCounsellorModal";
import EditCounsellorModal from "./EditCounsellorModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useUser } from "@/app/component/context/user-context";

export default function CounsellorDisplay() {
  const { user } = useUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [counsellorToEdit, setCounsellorToEdit] = useState<any | null>(null);
  const [counsellorToDelete, setCounsellorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [counsellorList, setCounsellorList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadCounsellors = async () => {
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
            name: c.name || "Unknown",
            email: c.email || "",
            phone: c.phone || "",
            scope: c.brandScope || "Cadd Mantra",
            targetNum: target,
            revenueNum: revenue,
            admissionsNum: c.admissionsRecorded || 0,
            targetCollected: `₹${revenue.toLocaleString("en-IN")} / ₹${target.toLocaleString("en-IN")}`,
            percentage: `${((revenue / Math.max(target, 1)) * 100).toFixed(1)}%`,
            status: "ACTIVE",
            annualTarget: `₹${target.toLocaleString("en-IN")}`,
            revenueCollected: `₹${revenue.toLocaleString("en-IN")}`,
            joiningDate: c.joiningDate ? new Date(c.joiningDate).toISOString().split("T")[0] : "—",
            admissions: `${c.admissionsRecorded || 0} Admissions`,
            initials: `${firstInitial}${lastInitial}`.toUpperCase() || "CU",
            scopeBadge: "Sales Counsellor Scope",
          };
        });

        // Filter for Brand Manager scope if applicable
        let finalDisplayList = list;
        if (user?.role === "brand manager" && user?.brandScope) {
          const allowedBrands = user.brandScope.split(",").map((b) => b.trim().toLowerCase());
          finalDisplayList = list.filter((c: any) =>
            allowedBrands.includes(c.scope.toLowerCase())
          );
        }

        setCounsellorList(finalDisplayList);
        if (finalDisplayList.length > 0) {
          setSelectedId((prev) => (prev && finalDisplayList.some((c: any) => c.id === prev) ? prev : finalDisplayList[0].id));
        } else {
          setSelectedId(null);
        }
      } else {
        setCounsellorList([]);
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Failed to load counsellors from API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCounsellors();
  }, [user]);

  // Unique brands list
  const uniqueBrands = Array.from(
    new Set(counsellorList.map((c) => c.scope).filter(Boolean))
  );

  // Filtered list based on search and dropdowns
  const filteredCounsellors = counsellorList.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.scope.toLowerCase().includes(query) ||
      c.registryId.toLowerCase().includes(query);

    const matchesBrand =
      selectedBrand === "All Brands" || c.scope.toLowerCase() === selectedBrand.toLowerCase();

    const matchesStatus =
      selectedStatus === "All Status" || c.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const selectedCounsellor = selectedId
    ? counsellorList.find((c) => c.id === selectedId)
    : null;

  // Aggregate Metrics Widget values
  const totalProfiles = filteredCounsellors.length;
  const combinedTargets = filteredCounsellors.reduce((acc, curr) => acc + curr.targetNum, 0);
  const achievedRevenue = filteredCounsellors.reduce((acc, curr) => acc + curr.revenueNum, 0);
  const totalAdmissions = filteredCounsellors.reduce((acc, curr) => acc + curr.admissionsNum, 0);
  const combinedAchievementPct =
    combinedTargets > 0 ? ((achievedRevenue / combinedTargets) * 100).toFixed(1) : "0.0";

  const stats = [
    { title: "Active Agents", value: `${totalProfiles} Profiles`, color: "text-slate-800" },
    {
      title: "Combined Targets",
      value: `₹${combinedTargets.toLocaleString("en-IN")}`,
      color: "text-slate-800",
    },
    {
      title: "Achieved Revenue",
      value: `₹${achievedRevenue.toLocaleString("en-IN")}`,
      color: "text-indigo-600",
    },
    {
      title: "Admissions Collected",
      value: `${totalAdmissions} seats`,
      color: "text-emerald-600",
    },
    {
      title: "Combined Achievement",
      value: `${combinedAchievementPct}%`,
      color: "text-blue-600",
    },
  ];

  const confirmDeleteCounsellor = async () => {
    if (!counsellorToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/counsellors/${counsellorToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCounsellorToDelete(null);
        loadCounsellors();
      } else {
        alert(data.error || "Failed to delete counsellor");
      }
    } catch (err) {
      console.error("Error deleting counsellor:", err);
      alert("Error deleting counsellor.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCounsellor = (counsellor: any) => {
    setCounsellorToEdit(counsellor);
    setIsEditModalOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredCounsellors.length === 0) {
      alert("No counsellor data available to export.");
      return;
    }
    const headers = ["Registry ID", "Name", "Email", "Brand Scope", "Annual Target", "Revenue Collected", "Admissions", "Status"];
    const rows = filteredCounsellors.map((c) => [
      `"${c.registryId}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.scope}"`,
      `"${c.targetNum}"`,
      `"${c.revenueNum}"`,
      `"${c.admissionsNum}"`,
      `"${c.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Counsellors_Registry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintRegistry = () => {
    window.print();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Selected file: "${file.name}". Processing import data...`);
      loadCounsellors();
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">
            Counsellors & Agents Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl font-sans">
            Track counselor pipelines, sales goals, actual yearly collection values, and active registrations.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* {user?.role !== "brand manager" && (
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all font-sans"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              Import Excel
            </button>
          )} */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all font-sans"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Counsellor
          </button>
        </div>
      </div>

      {/* Metrics Row Widget */}
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
          {/* Cards list */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl gap-2 font-sans select-none text-slate-400">
                <svg
                  className="animate-spin h-6 w-6 text-indigo-500"
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
                <span className="text-xs font-semibold">Loading agent registry database...</span>
              </div>
            ) : filteredCounsellors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl gap-3 font-sans select-none text-center">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-700">No Counsellors Found</h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                    There are no counsellors matching your search criteria. Click "+ New Counsellor" to create a new profile.
                  </p>
                </div>
              </div>
            ) : (
              filteredCounsellors.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 ${isSelected
                        ? "border-indigo-500 ring-1 ring-indigo-500/20"
                        : "border-slate-200/80 hover:border-slate-300"
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
                      <span>
                        Target Collected: <span className="text-slate-600">{c.targetCollected}</span>
                      </span>
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
                      Registry ID:{" "}
                      <span className="font-mono text-slate-500 select-all">
                        {selectedCounsellor.registryId}
                      </span>
                    </span>
                    <span className="inline-block text-[9px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 rounded-md px-1.5 py-0.5 mt-1.5 font-sans">
                      {selectedCounsellor.scopeBadge}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 select-none">
                  <button
                    onClick={() => handleEditCounsellor(selectedCounsellor)}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit Counsellor Target"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCounsellorToDelete({ id: selectedCounsellor.id, name: selectedCounsellor.name })}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Counsellor Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4.5 w-4.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Performance Ledger Goals */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none font-sans">
                  Performance Ledger Goals
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">
                      Assigned Annual Target
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1 font-sans">
                      {selectedCounsellor.annualTarget}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">
                      Revenue Collected
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 block mt-1 font-sans">
                      {selectedCounsellor.revenueCollected}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">
                      Joining Date
                    </span>
                    <span className="text-xs font-bold text-slate-700 block mt-1.5 font-sans">
                      {selectedCounsellor.joiningDate}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">
                      Seats Admission
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 block mt-1.5 font-sans">
                      {selectedCounsellor.admissions}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 font-sans">
                    <span>Actual Goal Completion Ratio</span>
                    <span className="text-indigo-600">{selectedCounsellor.percentage}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: selectedCounsellor.percentage }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Registry Credentials */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none font-sans">
                  Registry Credentials
                </label>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-sans text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Employee ID</span>
                    <span className="font-bold text-indigo-600 block mt-1">{selectedCounsellor.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">
                      Brand Channel Assignment
                    </span>
                    <span className="font-bold text-slate-700 block mt-1">{selectedCounsellor.scope}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Official Email</span>
                    <span className="font-bold text-slate-700 block mt-1 select-all">{selectedCounsellor.email}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Phone Mobile</span>
                    <span className="font-bold text-slate-700 block mt-1 select-all">{selectedCounsellor.phone || "—"}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Workspace Status</span>
                    <span className="font-bold text-emerald-600 block mt-1 uppercase">
                      {selectedCounsellor.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 h-full gap-3 font-sans select-none text-center">
              <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM11.25 14.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM15.75 14.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM15.75 11.25l.041-.02a.75.75 0 11.708 1.302l-.041.02a.75.75 0 01-.708-1.302zM9.75 17.25h8.25a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-8.25A2.25 2.25 0 007.5 9v6a2.25 2.25 0 002.25 2.25z"
                  />
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



      {/* Modal: Register Sales Counsellor */}
      <RegisterCounsellorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadCounsellors();
        }}
      />

      {/* Modal: Edit Sales Counsellor Profile */}
      {isEditModalOpen && (
        <EditCounsellorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCounsellorToEdit(null);
          }}
          counsellor={counsellorToEdit}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setCounsellorToEdit(null);
            loadCounsellors();
          }}
        />
      )}

      {/* Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(counsellorToDelete)}
        title="Delete Counsellor Profile"
        itemName={counsellorToDelete?.name || "this counsellor"}
        isLoading={isDeleting}
        onClose={() => setCounsellorToDelete(null)}
        onConfirm={confirmDeleteCounsellor}
      />
    </div>
  );
}
