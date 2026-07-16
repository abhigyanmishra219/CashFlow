"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import CompaniesDisplay from "@/components/CompaniesDisplay";

export default function CompaniesPage() {
  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6">
        <CompaniesDisplay />
      </div>
    </div>
  );
}
