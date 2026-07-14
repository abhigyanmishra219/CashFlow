"use client";

import React, { useState } from "react";

export default function EnquiriesDisplay() {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    {
      title: "Today's Enquiries",
      value: "0",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
      bg: "bg-blue-50/50 border-blue-100"
    },
    {
      title: "Pending Follow-ups",
      value: "4",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-amber-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      bg: "bg-amber-50/50 border-amber-100"
    },
    {
      title: "Admissions Converted",
      value: "0",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      bg: "bg-emerald-50/50 border-emerald-100"
    },
    {
      title: "Lost Leads",
      value: "0",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-rose-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      ),
      bg: "bg-rose-50/50 border-rose-100"
    },
    {
      title: "Conversion Rate",
      value: "0%",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-purple-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
      bg: "bg-purple-50/50 border-purple-100"
    }
  ];

  const leads = [
    {
      id: "ENQ000004",
      name: "Tanmay Singhal",
      phone: "9140681602",
      email: "tanmaysinghal@gmail.com",
      course: "crs-1783594054601-kaiv",
      brand: "Cadd Mantra",
      advisor: "Rahul Sharma",
      source: "Google Ads",
      status: "New"
    },
    {
      id: "ENQ000003",
      name: "Abhigyan Mishra",
      phone: "+919555536312",
      email: "abhigyanmishra026@gmail.com",
      course: "crs-1783594054601-kaiv",
      brand: "Cadd Mantra",
      advisor: "Riya Sharma",
      source: "Google Ads",
      status: "New"
    },
    {
      id: "ENQ000002",
      name: "John Doe CRM Test",
      phone: "9922458520",
      email: "lead-1783930145848@domain.test",
      course: "crs-1783594054333-i8ve",
      brand: "Cadd Mantra",
      advisor: "Rahul Sharma",
      source: "Google Ads",
      status: "New"
    }
  ];

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Enquiry Management Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            Supervise, route, and convert student inquiries across legal CRM pathways.
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
          <button className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all">
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
                placeholder="Search by Name, Email, Phone, ID..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>

            {/* Dropdowns */}
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
              <option>All Brands</option>
            </select>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
              <option>All Advisors</option>
            </select>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
              <option>All Sources</option>
            </select>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
              <option>All Priorities</option>
            </select>
            <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none sm:col-span-2">
              <option>All Pipeline Statuses</option>
            </select>

            {/* Date Picker Row */}
            <div className="sm:col-span-3 flex items-center gap-2 mt-1">
              <input
                type="date"
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-400 select-none">to</span>
              <input
                type="date"
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

          <div className="flex-1 flex flex-col justify-end gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-semibold text-slate-500 flex-1">Google Ads</span>
              <span className="text-xs font-bold text-slate-800">3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
              <span className="text-xs font-semibold text-slate-500 flex-1">Google Search</span>
              <span className="text-xs font-bold text-slate-800">2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span className="text-xs font-semibold text-slate-500 flex-1">Website</span>
              <span className="text-xs font-bold text-slate-800">1</span>
            </div>
          </div>
        </div>

      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col justify-between">
        
        {/* Table Title bar */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0 select-none">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Client Directory Leads (6)</h2>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Real Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-3 px-6">Enquiry No</th>
                <th className="py-3 px-6">Basic Details</th>
                <th className="py-3 px-6">Course Requested</th>
                <th className="py-3 px-6">Registered Brand</th>
                <th className="py-3 px-6">Advisor</th>
                <th className="py-3 px-6">Source</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
              {leads.map((lead, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  {/* Enquiry No */}
                  <td className="py-4 px-6 text-slate-800 font-bold font-mono">
                    {lead.id}
                  </td>

                  {/* Basic Details */}
                  <td className="py-4 px-6">
                    <span className="text-slate-800 font-bold block">{lead.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{lead.phone} • {lead.email}</span>
                  </td>

                  {/* Course requested */}
                  <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                    {lead.course}
                  </td>

                  {/* Brand */}
                  <td className="py-4 px-6 text-slate-700">
                    {lead.brand}
                  </td>

                  {/* Advisor dropdown */}
                  <td className="py-4 px-6">
                    <select
                      defaultValue={lead.advisor}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none"
                    >
                      <option>Rahul Sharma</option>
                      <option>Riya Sharma</option>
                    </select>
                  </td>

                  {/* Source */}
                  <td className="py-4 px-6 text-slate-500">
                    {lead.source}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center text-[9px] font-bold bg-blue-50 text-blue-600 rounded-md px-2 py-0.5 border border-blue-100 uppercase">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6">
        <button className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all select-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

    </div>
  );
}
