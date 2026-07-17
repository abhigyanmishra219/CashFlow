"use client";

import React from "react";

import CourseDisplay from "@/components/CourseDisplay";
import ManagerSidebar from "@/components/ManagerSidebar";

export default function CoursesPage() {
    return (
        <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
            {/* Sidebar navigation */}
            <ManagerSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-6 py-6">
                <CourseDisplay />
            </div>
        </div>
    );
}
