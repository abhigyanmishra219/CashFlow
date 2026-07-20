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
}

interface SidebarGroup {
  category: string;
  items: SidebarItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useUser();

  const isSuperAdmin = !user?.role || user?.role === "admin" || user?.role === "super admin" || user?.role === "superadmin" || pathname?.includes("admin");

  const [isCollapsed, setIsCollapsed] = useState(!isSuperAdmin);
  const [localLogo, setLocalLogo] = useState<string>("");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isSuperAdmin) {
      setIsCollapsed(false);
    }
  }, [isSuperAdmin, pathname]);

  React.useEffect(() => {
    const saved = localStorage.getItem("app_brand_logo");
    if (saved) {
      setLocalLogo(saved);
    }
  }, []);

  const brandLogo = localLogo || user?.brandLogo || "";

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Brand logo size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLocalLogo(result);
        setImgError(false);
        try {
          localStorage.setItem("app_brand_logo", result);
        } catch (err) { }

        try {
          const res = await fetch("/api/auth/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brandLogo: result }),
          });
          const data = await res.json();
          if (res.ok && data.user) {
            login(data.user);
          }
        } catch (err) {
          console.error("Failed to save brand logo to MongoDB", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalLogo("");
    setImgError(false);
    localStorage.removeItem("app_brand_logo");
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandLogo: "" }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
      }
    } catch (err) {
      console.error("Failed to reset brand logo", err);
    }
  };

  const groups: SidebarGroup[] = [
    {
      category: "Home",
      items: [
        {
          name: "Dashboard",
          href: "/admin-dashboard",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
          ),
        },

      ],
    },
    {
      category: "CRM",
      items: [
        {
          name: "Enquiries",
          href: "/enquiries",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          ),
        },
        {
          name: "Admissions",
          href: "/admin-dashboard/addmission",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.243a2.25 2.25 0 0 0 1.07 1.916l7.5 4.615a2.25 2.25 0 0 0 2.36 0l7.5-4.615a2.25 2.25 0 0 0 1.07-1.916V12.75" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "Academics",
      items: [
        {
          name: "Courses",
          href: "/courses",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "Finance",
      items: [
        {
          name: "Fee Collection",
          href: "/admin-dashboard/fee-collection",
          icon: (
            <span className="font-semibold text-[17px] leading-none h-5 w-5 flex items-center justify-center select-none text-slate-500 group-hover:text-slate-900 transition-colors">
              ₹
            </span>
          ),
        },
        {
          name: "Companies",
          href: "/companies",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M14 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75" />
            </svg>
          ),
        },
        {
          name: "Reports",
          href: "/admin-dashboard/reports",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "People",
      items: [
        {
          name: "Counsellors",
          href: "/counsellors",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.75 3.75 0 0 1 21 12Z" />
            </svg>
          ),
        },
        {
          name: "Brand Managers",
          href: "/admin-dashboard/brand-managers",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM9 14.25a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "Admin",
      items: [
        {
          name: "Brands",
          href: "/admin-dashboard/brands",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          ),
        },


        {
          name: "Logout",
          href: "#",
          isLogout: true,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-50/70 border-r border-slate-200/60 h-screen flex flex-col py-6 font-sans backdrop-blur-md transition-all duration-300 ${isCollapsed ? "w-20 px-3" : "w-64 px-4"
        }`}
    >
      {/* Hidden File Input for Brand Logo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Brand Header */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} mb-8 relative group`}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload custom Brand Logo (PNG/JPEG)"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden group-hover:ring-2 group-hover:ring-indigo-400 group-hover:ring-offset-1 transition-all cursor-pointer"
        >
          {brandLogo && !imgError ? (
            <img
              src={brandLogo}
              alt="Brand Logo"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.9c2.785 0 5.5-.413 8.084-1.205a60.43 60.43 0 0 0-.49-6.347m-15.344 0C4.3 7.299 8 7 12 7s7.7 2.999 7.75 3.147m-15.344 0C3.46 11.584 3 13.088 3 14.7c0 1.71.533 3.32 1.455 4.654M19.75 10.147c.79 1.437 1.25 3.1 1.25 4.853 0 1.612-.46 3.116-1.205 4.454M12 2.25V5.25m0 0a3 3 0 100 6 3 3 0 0 0 0-6Z" />
            </svg>
          )}

          {/* Camera/Upload Overlay Icon on Hover */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-between flex-1">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent select-none">
              Coach
            </span>
            {brandLogo && (
              <button
                type="button"
                onClick={handleResetLogo}
                title="Reset to default logo"
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 px-1 py-0.5 rounded hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            )}
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

                if (item.isLogout) {
                  return (
                    <li key={item.name}>
                      <button
                        onClick={logout}
                        className={`w-full group flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <span className="text-rose-400 group-hover:text-rose-600 transition-colors">
                          {item.icon}
                        </span>
                        {!isCollapsed && <span>{item.name}</span>}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700 transition-colors"}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!isCollapsed && group.category !== "Admin" && (
              <div className="pt-2 border-b border-slate-200/50 mx-3"></div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
