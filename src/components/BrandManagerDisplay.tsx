"use client";

import React, { useState } from "react";
import RegisterBrandModal from "./RegisterBrandModal";

export default function BrandManagerDisplay() {
  const [selectedBrandId, setSelectedBrandId] = useState("BRD001");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const brandsList = [
    {
      id: "BRD001",
      identity: "brand-1783592741516",
      name: "Cadd Mantra",
      initial: "C",
      color: "bg-indigo-600 text-white",
      description: "No academic description listed.",
      revenue: "₹0",
      counsellors: "1 Agents",
      entities: "4 Linked",
      status: "ACTIVE",
    },
    {
      id: "BRD002",
      identity: "brand-1783592741517",
      name: "Design Gateway",
      initial: "D",
      color: "bg-indigo-100 text-indigo-600",
      description: "No academic description listed.",
      revenue: "₹0",
      counsellors: "1 Agents",
      entities: "5 Linked",
      status: "ACTIVE",
    },
    {
      id: "ENT-TST",
      identity: "brand-1783592741518",
      name: "Enterprise Test Brand Updated",
      initial: "E",
      color: "bg-indigo-100 text-indigo-600",
      description: "No academic description listed.",
      revenue: "₹0",
      counsellors: "0 Agents",
      entities: "0 Linked",
      status: "ACTIVE",
    },
    {
      id: "ENT-E9A7B5",
      identity: "brand-1783592741519",
      name: "Enterprise Test Brand Updated",
      initial: "E",
      color: "bg-indigo-100 text-indigo-600",
      description: "No academic description listed.",
      revenue: "₹69,998",
      counsellors: "0 Agents",
      entities: "1 Linked",
      status: "ACTIVE",
    },
    {
      id: "ENT-3C31F2",
      identity: "brand-1783592741520",
      name: "Enterprise Test Brand Updated",
      initial: "E",
      color: "bg-indigo-100 text-indigo-600",
      description: "No academic description listed.",
      revenue: "₹0",
      counsellors: "0 Agents",
      entities: "1 Linked",
      status: "ACTIVE",
    },
  ];

  const selectedBrand = brandsList.find(b => b.id === selectedBrandId) || brandsList[0];

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Brands Registry</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-medium">
            Build and monitor your academic & coaching brands, legal channels, and counsellors.
          </p>
        </div>

        {/* Header buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Import Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Brand
          </button>
        </div>
      </div>

      {/* Main split content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Left Column: List */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* Search bar & Filters */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search brands by name, code..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            
            <select className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none">
              <option>All Status</option>
            </select>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3 overflow-y-auto pr-1 pb-4">
            {brandsList.map((brand) => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <div
                  key={brand.id}
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-200 ${
                    isSelected ? "border-indigo-400 ring-1 ring-indigo-400/20" : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-lg font-bold text-sm shrink-0 ${brand.color}`}>
                        {brand.initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-800">{brand.name}</h3>
                          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {brand.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{brand.description}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-500 border border-emerald-100 rounded px-1.5 py-0.5 uppercase tracking-wide">
                      {brand.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 my-3"></div>

                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Revenue</span>
                      <span className="text-[11px] font-bold text-slate-700 block mt-0.5">{brand.revenue}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Counsellors</span>
                      <span className="text-[11px] font-bold text-slate-700 block mt-0.5">{brand.counsellors}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Entities</span>
                      <span className="text-[11px] font-bold text-slate-700 block mt-0.5">{brand.entities}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Details Pane */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between overflow-y-auto relative h-[calc(100vh-12rem)] min-h-[500px]">
          
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 flex items-center justify-center rounded-xl font-bold text-lg shadow-sm ${selectedBrand.color}`}>
                  {selectedBrand.initial}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{selectedBrand.name}</h2>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                    Brand Identity: <span className="font-mono text-slate-500 select-all">{selectedBrand.identity}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1 border border-slate-100 rounded-lg p-0.5 bg-slate-50 shrink-0">
                <button className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-400 hover:text-indigo-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-400 hover:text-rose-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Corporate Mission */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Corporate Mission</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                No academic overview is listed for this coaching program. Provide registered descriptions via Brand Settings.
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span className="text-[11px] font-medium text-slate-500">No listed phone</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-[11px] font-medium text-slate-500">No support email</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span className="text-[11px] font-medium text-slate-500">No listed website</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-[11px] font-medium text-slate-500">Corporate Head Office</span>
              </div>
            </div>

            {/* Brand Performance Dashboard */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Brand Performance Dashboard</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="border border-slate-200 rounded-xl p-3 shadow-sm bg-white">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    Connected Entities
                  </span>
                  <span className="text-lg font-extrabold text-slate-800 tracking-tight">4 Legal</span>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 shadow-sm bg-white">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Total Revenue
                  </span>
                  <span className="text-lg font-extrabold text-indigo-600 tracking-tight">₹0</span>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 shadow-sm bg-white">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    Active Staff
                  </span>
                  <span className="text-lg font-extrabold text-slate-800 tracking-tight">1 Counsel</span>
                </div>
                <div className="border border-slate-200 rounded-xl p-3 shadow-sm bg-white">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.588l1.234 5.265c.15.64-.533 1.141-1.077.782l-4.72-3.13a.563.563 0 00-.616 0l-4.72 3.13c-.544.36-1.228-.142-1.077-.782l1.234-5.265a.563.563 0 00-.181-.588L2.345 10.386c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    Brand Managers
                  </span>
                  <span className="text-lg font-extrabold text-slate-800 tracking-tight">1 Execs</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                <span>Combined Entity Target Utilization</span>
                <span className="text-indigo-600">0.0%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[0%]"></div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Connected Legal Entities</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    <span className="text-[11px] font-bold text-slate-700">Designers Choice</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">₹19,50,000 Target</span>
                </div>
                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    <span className="text-[11px] font-bold text-slate-700">Sling Shot Technologies</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">₹19,50,000 Target</span>
                </div>
                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    <span className="text-[11px] font-bold text-slate-700">CT ENTERPRISES</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">₹19,50,000 Target</span>
                </div>
                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5 bg-white">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    <span className="text-[11px] font-bold text-slate-700">SICCES PVT LTD</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">₹19,50,00,000 Target</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Floating Action Button (Right pane) */}
          <button className="absolute bottom-6 right-6 h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all z-10 hover:shadow-indigo-500/25 shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal for new brand */}
      <RegisterBrandModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
