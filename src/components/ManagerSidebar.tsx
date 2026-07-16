"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarGroup {
  category: string;
  items: SidebarItem[];
}

export default function ManagerSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const groups: SidebarGroup[] = [
    {
      category: "MAIN",
      items: [
        {
          name: "Dashboard",
          href: "/manager-dashboard",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          ),
        },
        {
          name: "Enquiries",
          href: "/manager-dashboard/enquiries",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          ),
        },
        {
          name: "Admissions",
          href: "/manager-dashboard/admissions",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0A2.25 2.25 0 004.5 15h15a2.25 2.25 0 002.25-2.25m-19.5 0v.243a2.25 2.25 0 001.07 1.916l7.5 4.615a2.25 2.25 0 002.36 0l7.5-4.615a2.25 2.25 0 001.07-1.916V12.75" />
            </svg>
          ),
        },
        {
          name: "Students",
          href: "/manager-dashboard/students",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "FINANCE",
      items: [
        {
          name: "Fee Collection",
          href: "/manager-dashboard/fee-collection",
          icon: (
            <span className="font-semibold text-lg flex items-center justify-center h-5 w-5 leading-none">
              ₹
            </span>
          ),
        },
        {
          name: "Reports",
          href: "/manager-dashboard/reports",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "MANAGEMENT",
      items: [
        {
          name: "Courses",
          href: "/manager-dashboard/courses",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          ),
        },
        {
          name: "Counsellors",
          href: "/manager-dashboard/counsellors",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          name: "Follow-ups",
          href: "/manager-dashboard/follow-ups",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "SETTINGS",
      items: [
        {
          name: "Settings",
          href: "/manager-dashboard/settings",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="w-20 shrink-0 relative h-screen z-50">
      <div
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className={`h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] absolute top-0 left-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand / Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 w-full">
          <div className="h-10 w-10 shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            <span className="text-white font-extrabold text-sm tracking-wider">CF</span>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-200 truncate">
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight">CoachFlow</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-0.5">
                ERP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            {!isCollapsed && (
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 px-2">
                  {group.category}
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item, itemIdx) => {
                // In a real app we'd check if pathname strictly matches or starts with item.href
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
                  >
                    <div
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <span className={`text-sm font-semibold truncate ${isActive ? "text-white font-bold" : ""}`}>
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
