"use client";

import React from "react";
import { useUser } from "../../component/context/user-context";

export default function DashboardPage() {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-violet-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"></div>

      <div className="mx-auto max-w-7xl">
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
              Coach Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, <span className="font-semibold text-indigo-300">{user.name}</span>
            </p>
          </div>
          <div>
            <button
              onClick={() => logout()}
              className="text-sm font-semibold rounded-xl bg-rose-600/90 hover:bg-rose-500 px-4 py-2 text-white transition-all shadow-md shadow-rose-600/10 active:scale-[0.98]"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: User Profile Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Profile Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Name</label>
                <span className="text-sm text-slate-200 font-medium block mt-1">{user.name}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Role</label>
                <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-sm font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20 capitalize mt-1">
                  {user.role}
                </span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email</label>
                <span className="text-sm text-slate-200 font-medium block mt-1">{user.email}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">User ID</label>
                <span className="text-sm text-slate-400 font-mono block mt-1 break-all">
                  {user.id || user._id}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Workspace Actions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl md:col-span-2">
            <h2 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Available Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 hover:border-indigo-500/30 transition-colors">
                <h3 className="font-semibold text-indigo-400">Coaching Hub</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Access your structured development plans and view scheduled coaching sessions.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 hover:border-indigo-500/30 transition-colors">
                <h3 className="font-semibold text-indigo-400">Analytics & History</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Check your monthly improvement metrics, journal history, and progress records.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 text-xs flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.986l-.587.587A1.5 1.5 0 0012 13h-.75m0-3.5h.008v.008H11.25V9.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Roles authorized: {user.role === "super admin" ? "Full system access enabled." : "Standard team permissions enabled."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
