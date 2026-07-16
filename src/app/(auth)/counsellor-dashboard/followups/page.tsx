"use client";

import CounsellorEnquiriesDisplay from "@/components/CounsellorEnquitiesDisplay";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import React from "react";


export default function CounsellorEnquiriesPage() {
    return (
        <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
            {/* Sidebar navigation */}
            <CounsellorSidebar
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6">
                <CounsellorEnquiriesDisplay />
            </div>
        </div>
    );
}