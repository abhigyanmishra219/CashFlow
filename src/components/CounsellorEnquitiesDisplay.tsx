"use client";

import React, { useState, useEffect } from "react";
import AddEnquiryModal from "./AddEnquiryModal";
import LeadProfile from "./LeadProfile";
import { useUser } from "@/app/component/context/user-context";

export default function CounsellorEnquiriesDisplay() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);

    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [dateOffset, setDateOffset] = useState(0);

    // Filter states
    const [sourceFilter, setSourceFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.length >= 3 || searchQuery.length === 0) {
                setDebouncedSearchQuery(searchQuery);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - dateOffset);
    const targetDateString = targetDate.toDateString();

    // Apply UI filters to all enquiries
    const filteredEnquiries = enquiries.filter((lead) => {
        // 1. Restrict to leads assigned to the logged-in counsellor
        if (!user) return false;
        const advisor = (lead.assignedCrmAdvisor || "").toLowerCase().trim();
        const currentUser = (user.name || "").toLowerCase().trim();
        if (advisor !== currentUser) return false;

        // 2. Dropdown Filters
        if (sourceFilter && lead.leadSource !== sourceFilter) return false;
        if (priorityFilter && lead.priorityLevel !== priorityFilter) return false;
        if (statusFilter && lead.status !== statusFilter) return false;

        // Date Filtering
        if (startDateFilter || endDateFilter) {
            if (lead.createdAt) {
                const leadDate = new Date(lead.createdAt);
                leadDate.setHours(0, 0, 0, 0);

                if (startDateFilter) {
                    const start = new Date(startDateFilter);
                    start.setHours(0, 0, 0, 0);
                    if (leadDate < start) return false;
                }
                if (endDateFilter) {
                    const end = new Date(endDateFilter);
                    end.setHours(23, 59, 59, 999);
                    if (leadDate > end) return false;
                }
            } else {
                return false;
            }
        } else {
            if (lead.createdAt) {
                const leadDate = new Date(lead.createdAt);
                if (leadDate.toDateString() !== targetDateString) return false;
            } else {
                if (dateOffset !== 0) return false;
            }
        }

        // Text filtering
        if (!debouncedSearchQuery) return true;
        const query = debouncedSearchQuery.toLowerCase();
        return (
            (lead.studentFullName && lead.studentFullName.toLowerCase().includes(query)) ||
            (lead.emailAddress && lead.emailAddress.toLowerCase().includes(query)) ||
            (lead.primaryPhoneMobile && String(lead.primaryPhoneMobile).toLowerCase().includes(query)) ||
            (lead.enquiryId && lead.enquiryId.toLowerCase().includes(query))
        );
    });

    const fetchEnquiries = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/enquiries");
            const result = await response.json();
            if (result.success) {
                setEnquiries(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch enquiries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    // Compute unique values for dropdowns based on all database entries
    const uniqueSources = Array.from(new Set(enquiries.map(e => e.leadSource).filter(Boolean)));
    const uniquePriorities = Array.from(new Set(enquiries.map(e => e.priorityLevel).filter(Boolean)));
    const uniqueStatuses = Array.from(new Set(enquiries.map(e => e.status).filter(Boolean)));

    // Calculate counsellor-specific metrics for the cards at the top
    const counsellorLeads = enquiries.filter((lead) => {
        if (!user) return false;
        const advisor = (lead.assignedCrmAdvisor || "").toLowerCase().trim();
        const currentUser = (user.name || "").toLowerCase().trim();
        return advisor === currentUser;
    });

    const todayStr = new Date().toDateString();
    const todaysCount = counsellorLeads.filter(
        (e) => e.createdAt && new Date(e.createdAt).toDateString() === todayStr
    ).length;

    const pendingFollowupsCount = counsellorLeads.reduce((acc, lead) => {
        const pendingTasks = lead.followUps?.filter((t: any) => !t.isCompleted).length || 0;
        return acc + pendingTasks;
    }, 0);

    const admissionsConvertedCount = counsellorLeads.filter(
        (e) => e.status === "Admission" || e.status === "Admitted"
    ).length;

    const lostLeadsCount = counsellorLeads.filter(
        (e) => e.status === "Lost"
    ).length;

    const totalLeadsCount = counsellorLeads.length;
    const conversionRate = totalLeadsCount > 0 ? Math.round((admissionsConvertedCount / totalLeadsCount) * 100) : 0;

    const stats = [
        {
            title: "Today's Enquiries",
            value: String(todaysCount),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
            ),
            bg: "bg-blue-50/50 border-blue-100"
        },
        {
            title: "Pending Follow-ups",
            value: String(pendingFollowupsCount),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
            bg: "bg-amber-50/50 border-amber-100"
        },
        {
            title: "Admissions Converted",
            value: String(admissionsConvertedCount),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
            bg: "bg-emerald-50/50 border-emerald-100"
        },
        {
            title: "Lost Leads",
            value: String(lostLeadsCount),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-rose-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            ),
            bg: "bg-rose-50/50 border-rose-100"
        },
        {
            title: "Conversion Rate",
            value: `${conversionRate}%`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-purple-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
            ),
            bg: "bg-purple-50/50 border-purple-100"
        }
    ];

    const isCustomDateRangeActive = startDateFilter !== "" || endDateFilter !== "";

    return (
        <div className="space-y-6 flex-1 flex flex-col justify-between">

            {/* Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">My Enquiries</h1>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                        View, plan follow-ups, and convert student inquiries assigned to you.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Import
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 py-2 shadow-md shadow-emerald-500/10 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Register Enquiry
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                                {stat.title}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                        <div className={`p-2 rounded-xl border ${stat.bg} shrink-0`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle row: Filtering & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Filtering Column */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2">
                    <div className="flex items-center gap-1.5 mb-4 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.59v3.499a.75.75 0 0 1-.316.615l-3 2.13a.75.75 0 0 1-1.184-.615v-5.629a2.25 2.25 0 0 0-.659-1.59L4.084 7.409A2.25 2.25 0 0 1 3.425 5.82V4.774c0-.54.384-1.006.917-1.096A48.254 48.254 0 0 1 12 3z" />
                        </svg>
                        <h2 className="text-xs font-bold uppercase tracking-wider select-none">CRM Target Segments Filtering</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Search */}
                        <div className="relative sm:col-span-3">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Name, Email, Phone, ID..."
                                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>

                        {/* Dropdowns (Source, Priority, Status) */}
                        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
                            <option value="">All Sources</option>
                            {uniqueSources.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                        </select>
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
                            <option value="">All Priorities</option>
                            {uniquePriorities.map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
                            <option value="">All Pipeline Statuses</option>
                            {uniqueStatuses.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                        </select>

                        {/* Date Picker Row */}
                        <div className="sm:col-span-3 flex items-center gap-2 mt-1">
                            <input
                                type="date"
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 focus:outline-none"
                            />
                            <span className="text-xs font-bold text-slate-400 select-none">to</span>
                            <input
                                type="date"
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 focus:outline-none"
                            />
                        </div>

                    </div>
                </div>

                {/* Lead Source Channels */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">Lead Source Channels</h2>
                        <p className="text-[10px] text-slate-400/90 mt-0.5 select-none">Marketing acquisition mix distribution.</p>
                    </div>

                    {(() => {
                        const sourceStats = filteredEnquiries.reduce((acc, curr) => {
                            const source = curr.leadSource || "Other";
                            acc[source] = (acc[source] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);

                        const totalSources = filteredEnquiries.length || 1;

                        const sourceColors: Record<string, string> = {
                            "Google Ads": "#6366f1",
                            "Google Search": "#06b6d4",
                            "Website": "#f43f5e",
                            "Other": "#94a3b8"
                        };

                        const tailwindColors: Record<string, string> = {
                            "Google Ads": "bg-indigo-500",
                            "Google Search": "bg-cyan-500",
                            "Website": "bg-rose-500",
                            "Other": "bg-slate-400"
                        };

                        let currentAngle = 0;
                        const gradientStops = Object.entries(sourceStats).map(([source, count]) => {
                            const percentage = (count as number / totalSources) * 100;
                            const color = sourceColors[source] || sourceColors["Other"];
                            const start = currentAngle;
                            const end = currentAngle + percentage;
                            currentAngle = end;
                            return `${color} ${start}% ${end}%`;
                        }).join(", ");

                        return (
                            <>
                                <div className="flex-1 flex items-center justify-center my-4">
                                    {filteredEnquiries.length > 0 ? (
                                        <div
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-sm flex items-center justify-center"
                                            style={{
                                                background: `conic-gradient(${gradientStops})`,
                                            }}
                                        >
                                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full shadow-inner" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-slate-100 flex items-center justify-center">
                                            <span className="text-[10px] text-slate-400 font-bold">No Data</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 mt-auto">
                                    {Object.entries(sourceStats).map(([source, count]) => (
                                        <div key={source} className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${tailwindColors[source] || tailwindColors["Other"]}`}></span>
                                            <span className="text-xs font-semibold text-slate-500 flex-1">{source}</span>
                                            <span className="text-xs font-bold text-slate-800">{String(count)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </div>

            </div>

            {/* Leads Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col justify-between">

                {/* Table Title bar */}
                <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0 select-none">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Directory Leads ({filteredEnquiries.length})</h2>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>

                {/* Real Table (Removed targetBrand column header and targetBrand cell) */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                <th className="py-3 px-6">Enquiry No</th>
                                <th className="py-3 px-6">Basic Details</th>
                                <th className="py-3 px-6">Course Requested</th>
                                <th className="py-3 px-6">Advisor</th>
                                <th className="py-3 px-6">Source</th>
                                <th className="py-3 px-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-slate-500">Loading enquiries...</td>
                                </tr>
                            ) : filteredEnquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-slate-500">No enquiries found.</td>
                                </tr>
                            ) : (
                                filteredEnquiries.map((lead, idx) => (
                                    <tr
                                        key={lead._id || idx}
                                        onClick={() => setSelectedLead(lead)}
                                        className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                                    >
                                        {/* Enquiry No */}
                                        <td className="py-4 px-6 text-slate-800 font-bold font-mono group-hover:text-emerald-600 transition-colors">
                                            {lead.enquiryId}
                                        </td>

                                        {/* Basic Details */}
                                        <td className="py-4 px-6">
                                            <span className="text-slate-800 font-bold block">{lead.studentFullName}</span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">{lead.primaryPhoneMobile} • {lead.emailAddress}</span>
                                        </td>

                                        {/* Course requested */}
                                        <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                                            {lead.targetCourse}
                                        </td>

                                        {/* Advisor dropdown */}
                                        <td className="py-4 px-6">
                                            <select
                                                defaultValue={lead.assignedCrmAdvisor}
                                                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none"
                                            >
                                                <option value={lead.assignedCrmAdvisor}>{lead.assignedCrmAdvisor}</option>
                                            </select>
                                        </td>

                                        {/* Source */}
                                        <td className="py-4 px-6 text-slate-500">
                                            {lead.leadSource}
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center text-[9px] font-bold bg-blue-50 text-blue-600 rounded-md px-2 py-0.5 border border-blue-100 uppercase group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
                                                {lead.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Date Pagination */}
                <div className={`flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 ${isCustomDateRangeActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button
                        onClick={() => setDateOffset(prev => prev + 1)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                        Previous Day
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-700">
                            {isCustomDateRangeActive ? "Custom Range Active" : dateOffset === 0 ? "Today's Leads" : dateOffset === 1 ? "Yesterday's Leads" : targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                            {isCustomDateRangeActive ? "Clear dates to use pagination" : `Page ${dateOffset + 1}`}
                        </span>
                    </div>

                    <button
                        onClick={() => setDateOffset(prev => Math.max(0, prev - 1))}
                        disabled={dateOffset === 0}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Day
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

            </div>

            {/* Floating button */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all select-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>

            <AddEnquiryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchEnquiries();
                }}
            />

            <LeadProfile
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onSuccess={() => fetchEnquiries()}
            />
        </div>
    );
}