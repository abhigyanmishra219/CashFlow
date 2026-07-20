"use client";

import React, { useState, useEffect } from "react";
import CompanyModal from "./CompanyModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function CompaniesDisplay() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Modal States
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any | null>(null);

  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/companies");
      const data = await response.json();
      if (data.success && data.companies && data.companies.length > 0) {
        const list = data.companies.map((c: any) => {
          const cap = c.annualCapacityCap || 1949999;
          const revenue = c.collectedRevenue || 0;
          return {
            id: c.companyId || `COMP-${c._id}`,
            mongoId: c._id,
            name: c.name || "Unknown Company",
            legalName: c.legalName || c.name || "",
            gst: c.gst || "Not Provided",
            pan: c.pan || "Not Provided",
            collected: `₹${revenue.toLocaleString("en-IN")}`,
            capacity: `${((revenue / Math.max(cap, 1)) * 100).toFixed(1)}% Capacity`,
            status: c.status || "ACTIVE",
            bank: c.bank || "Bank Of India",
            cap: `₹${cap.toLocaleString("en-IN")}`,
            capNum: cap,
            revenueNum: revenue,
            address: c.address || "No listed street, No City, No State, PIN",
            brands: c.brands && c.brands.length > 0 ? c.brands : (c.brand ? [c.brand] : []),
          };
        });
        setCompaniesList(list);
        if (list.length > 0) {
          setSelectedCompId((prev) => (prev && list.some((item: any) => item.id === prev) ? prev : list[0].id));
        } else {
          setSelectedCompId(null);
        }
      } else {
        setCompaniesList([]);
        setSelectedCompId(null);
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Search & Filtered list
  const filteredCompanies = companiesList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.gst.toLowerCase().includes(q) ||
      c.pan.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q);

    const matchesStatus =
      selectedStatus === "All Status" || c.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const selectedCompany = selectedCompId
    ? companiesList.find((c) => c.id === selectedCompId) || filteredCompanies[0]
    : filteredCompanies[0];

  // Handlers
  const handleOpenAddModal = () => {
    setCompanyToEdit(null);
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditModal = (comp: any) => {
    setCompanyToEdit(comp);
    setIsCompanyModalOpen(true);
  };

  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/companies/${companyToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompanyToDelete(null);
        loadCompanies();
      } else {
        alert(data.error || "Failed to delete company entity");
      }
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Error deleting company entity.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (companiesList.length === 0) return;
    const headers = ["Company ID", "Company Name", "GST No", "PAN No", "Bank", "Annual Cap", "Collected Revenue", "Brand"];
    const rows = companiesList.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.gst}"`,
      `"${c.pan}"`,
      `"${c.bank}"`,
      `"${c.capNum}"`,
      `"${c.revenueNum}"`,
      `"${c.brands.join(", ")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Legal_Entities_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Legal Entities Registry</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl font-sans">
            Configure legal companies, GST/PAN compliance parameters, and monitor annual revenue limits.
          </p>
        </div>

        {/* Header buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
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
          <button
            onClick={handleOpenAddModal}
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
            Register Company
          </button>
        </div>
      </div>

      {/* Main split content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* Left Column: List */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto">
          {/* Search bar & Tabs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code, GST, PAN, name..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-sans"
                />
              </div>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none cursor-pointer font-sans"
              >
                <option value="All Status">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              {/* Icon actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExportCSV}
                  title="Export CSV"
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
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
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => window.print()}
                  title="Print Report"
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-bold select-none">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`pb-2 px-4 border-b-2 transition-all ${
                  activeTab === "ledger"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Standard Ledger List
              </button>

            </div>
          </div>

          {/* Cards List */}
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
                <span className="text-xs font-semibold">Loading legal entity records...</span>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl gap-3 text-center">
                <p className="text-xs font-bold text-slate-700">No Legal Entities Found</p>
                <p className="text-[10px] text-slate-400">
                  Click "+ Register Company" to add a new legal entity to the database.
                </p>
              </div>
            ) : (
              filteredCompanies.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-500 ring-1 ring-indigo-500/20"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
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
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M14 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            {comp.name}
                            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-400 rounded-md px-1 py-0.5 font-mono select-all">
                              {comp.id}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1 font-sans">
                            GST: {comp.gst} | PAN: {comp.pan}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 uppercase select-none">
                        {comp.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 my-3"></div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
                      <span>
                        Collected: <span className="text-slate-600">{comp.collected}</span>
                      </span>
                      <span className="text-emerald-600">{comp.capacity}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Details View */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between overflow-y-auto font-sans">
          {selectedCompany ? (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
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
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M14 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">{selectedCompany.name}</h2>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      Corporate ID:{" "}
                      <span className="font-mono text-slate-500 select-all">
                        {selectedCompany.id.toLowerCase()}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 select-none">
                  <button
                    onClick={() => handleOpenEditModal(selectedCompany)}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit Legal Entity"
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
                    onClick={() =>
                      setCompanyToDelete({
                        id: selectedCompany.mongoId || selectedCompany.id,
                        name: selectedCompany.name,
                      })
                    }
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Legal Entity"
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

              {/* Registry Info details */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gst Registration
                    </label>
                    <span className="text-xs font-bold text-slate-600 block mt-1">{selectedCompany.gst}</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pan Card No.
                    </label>
                    <span className="text-xs font-bold text-slate-600 block mt-1">{selectedCompany.pan}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Legal Name
                  </label>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {selectedCompany.legalName || selectedCompany.name}
                  </span>
                </div>
              </div>

              {/* Bank Credentials */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                  Settlement Bank Credentials
                </label>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
                  <span className="text-xs font-bold text-slate-700 block">{selectedCompany.bank}</span>
                </div>
              </div>

              {/* Capacity Indicators */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                  Capacity Indicators
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block select-none">
                      Annual Capacity Cap
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">
                      {selectedCompany.cap}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block select-none">
                      Collected Revenue
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1">
                      {selectedCompany.collected}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block select-none">
                    Remaining Allocation Space
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 block mt-1">
                    {selectedCompany.cap}
                  </span>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                  Registered Address
                </label>
                <div className="flex items-start gap-2 text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4.5 w-4.5 mt-0.5 shrink-0 text-slate-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25gC4.5 6.255 7.858 3 12 3s7.5 3.255 7.5 7.5z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed">
                    {selectedCompany.address}
                  </span>
                </div>
              </div>

              {/* Brands Catalog */}
              <div className="space-y-2 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                  Associated Brands Catalog
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.brands.map((b: string) => (
                    <span key={b} className="inline-flex items-center text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded-md px-2.5 py-1 border border-indigo-100 select-none">
                      {b}
                    </span>
                  ))}
                  {selectedCompany.brands.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No associated brands</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 h-full gap-3 text-center">
              <p className="text-xs font-bold text-slate-700">No Entity Selected</p>
              <p className="text-[10px] text-slate-400">Select a legal company entity to view details.</p>
            </div>
          )}
        </div>
      </div>



      {/* Modal: Add/Edit Company */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={companyToEdit}
        onSuccess={() => {
          setIsCompanyModalOpen(false);
          loadCompanies();
        }}
      />

      {/* Modal: Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(companyToDelete)}
        title="Delete Legal Entity"
        itemName={companyToDelete?.name || "this company"}
        isLoading={isDeleting}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={handleConfirmDeleteCompany}
      />
    </div>
  );
}
