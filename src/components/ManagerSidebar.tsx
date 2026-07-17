"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/component/context/user-context";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isLogout?: boolean;
  onClick?: () => void;
}

interface SidebarGroup {
  category: string;
  items: SidebarItem[];
}

export default function ManagerSidebar() {
  const pathname = usePathname();
  const { logout } = useUser();
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
      ],
    },
    {
      category: "SYSTEM",
      items: [
        {
          name: "Logout",
          href: "#",
          isLogout: true,
          onClick: logout,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
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
        className={`h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] absolute top-0 left-0 ${isCollapsed ? "w-20" : "w-64"
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
                  const isActive = pathname === item.href;

                  if (item.isLogout) {
                    return (
                      <button
                        key={itemIdx}
                        onClick={item.onClick || logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <div className="shrink-0 text-rose-500 group-hover:text-rose-700 transition-colors">
                          {item.icon}
                        </div>
                        {!isCollapsed && (
                          <span className="text-sm font-semibold truncate text-rose-600 group-hover:text-rose-700 font-bold">
                            {item.name}
                          </span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                    >
                      <div
                        className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
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
