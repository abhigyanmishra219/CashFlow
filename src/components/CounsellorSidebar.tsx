"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/component/context/user-context";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  hasNotification?: boolean;
  onClick?: () => void;
}

interface SidebarGroup {
  category: string;
  items: SidebarItem[];
}

export default function CounsellorSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useUser();

  const groups: SidebarGroup[] = [
    {
      category: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/counsellor-dashboard",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "Tools",
      items: [
        {
          name: "My Tasks",
          href: "/counsellor-dashboard/tasks",
          hasNotification: true,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-12A2.25 2.25 0 003.75 6.75v10.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V18.75z" />
            </svg>
          ),
        },
        {
          name: "Calendar",
          href: "/counsellor-dashboard/calendar",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "System",
      items: [
        {
          name: "Logout",
          href: "#",
          onClick: logout,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200/80 h-screen flex flex-col py-6 font-sans transition-all duration-300 shrink-0 ${isCollapsed ? "w-20 px-3" : "w-64 px-4"
        }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} mb-8 px-1`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/20 shrink-0 select-none">
          <span className="text-white font-extrabold text-base tracking-tight font-sans">CF</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col select-none">
            <span className="text-sm font-extrabold tracking-tight text-slate-800 font-sans leading-none">
              CoachFlow
            </span>
            <span className="text-[10px] font-bold text-emerald-500 tracking-widest font-sans uppercase mt-1">
              ERP
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.category} className="space-y-2">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-bold tracking-widest text-slate-400/90 uppercase select-none">
                {group.category}
              </h3>
            ) : (
              <div className="border-t border-slate-200/50 my-1 mx-2"></div>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li 
                    key={item.name}
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick!(); } : undefined}
                      className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 text-xs font-bold rounded-xl transition-all duration-200 relative ${isActive
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 transition-colors"} relative`}>
                        {item.icon}
                        {item.hasNotification && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
                        )}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            {!isCollapsed && group.category !== "Tools" && (
              <div className="pt-2 border-b border-slate-200/50 mx-3"></div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
