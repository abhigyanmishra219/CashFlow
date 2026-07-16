"use client";

<<<<<<< HEAD
import React, { useState } from "react";
import { useUser } from "../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import Link from "next/link";
import ProfileDisplay from "@/components/ProfileDisplay";

export default function CounsellorDashboardPage() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
=======
import React from "react";
import { useUser } from "../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import Link from "next/link";

export default function CounsellorDashboardPage() {
  const { user, logout } = useUser();
>>>>>>> Chaitanya-local

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <CounsellorSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg> */}
            </button>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
          </div>

          {/* Center Badge (Optional, matching mockup style) */}
          {/* <div className="hidden md:flex absolute left-1/2 top-0 -translate-x-1/2 bg-purple-700 text-white px-6 py-2 rounded-b-xl shadow-md items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-widest">Counsellor Dashboard (Counsellor)</span>
          </div> */}

          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-9 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-200 bg-white rounded px-1.5 py-0.5">
                Ctrl + K
              </span>
            </div>

            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
                3
              </span>
            </button>

<<<<<<< HEAD
            <div className="flex items-center gap-3 border-l border-slate-200 pl-5 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
=======
            <div className="flex items-center gap-3 border-l border-slate-200 pl-5 cursor-pointer" onClick={logout}>
>>>>>>> Chaitanya-local
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Priya+Singh&background=10b981&color=fff" alt="User" className="h-full w-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user.name || ""}</p>
                <p className="text-[11px] font-semibold text-emerald-600 leading-tight mt-0.5 capitalize">{user.role}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">

          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <MetricCard title="My Leads" value="64" trend="+ 16.3% vs last period" trendUp={true} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><UserIcon /></div>
            } />
            <MetricCard title="New Today" value="8" trend="+ 33.3% vs yesterday" trendUp={true} icon={
              <div className="bg-blue-50 text-blue-500 p-2 rounded-lg"><UserAddIcon /></div>
            } />
            <MetricCard title="Follow-ups Today" value="12" trend="+ 9.1% vs yesterday" trendUp={true} icon={
              <div className="bg-orange-50 text-orange-500 p-2 rounded-lg"><CalendarIcon /></div>
            } />
            <MetricCard title="Admissions" value="9" trend="+ 28.6% vs last period" trendUp={true} icon={
              <div className="bg-purple-50 text-purple-500 p-2 rounded-lg"><AcademicIcon /></div>
            } />
            <MetricCard title="Conversion Rate" value="21.4%" trend="+ 6.2% vs last period" trendUp={true} icon={
              <div className="bg-blue-50 text-blue-500 p-2 rounded-lg"><ChartUpIcon /></div>
            } />
            <MetricCard title="Revenue (INR)" value="₹4.10 L" trend="+ 18.7% vs last period" trendUp={true} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><ChartUpIcon /></div>
            } />
            <MetricCard title="Collection (INR)" value="₹1.45 L" trend="+ 12.4% vs last period" trendUp={true} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><WalletIcon /></div>
            } />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Lead Pipeline */}
            <DashboardCard title="My Lead Pipeline">
              <div className="flex items-center gap-6 mt-4">
                {/* Visual Funnel */}
                <div className="flex flex-col items-center gap-1 w-32">
                  <div className="w-full h-8 bg-blue-500 rounded-sm"></div>
                  <div className="w-5/6 h-8 bg-emerald-400 rounded-sm"></div>
                  <div className="w-4/6 h-8 bg-teal-400 rounded-sm"></div>
                  <div className="w-1/2 h-8 bg-amber-400 rounded-sm"></div>
                  <div className="w-1/3 h-8 bg-purple-500 rounded-sm"></div>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-2">
                  <PipelineStat label="New Lead" value="8" percent="12.5%" color="bg-blue-500" />
                  <PipelineStat label="Contacted" value="16" percent="25.0%" color="bg-emerald-400" />
                  <PipelineStat label="Interested" value="18" percent="20.1%" color="bg-teal-400" />
                  <PipelineStat label="Demo Attended" value="12" percent="18.8%" color="bg-amber-400" />
                  <PipelineStat label="Admission" value="9" percent="14.1%" color="bg-purple-500" />
                </div>
              </div>
            </DashboardCard>

            {/* Today's Follow-ups */}
            <DashboardCard title="Today's Follow-ups" actionText="View All">
              <div className="space-y-4 mt-4">
                <FollowUpItem name="Rohan Mehta" time="10:00 AM" action="Call" actionColor="text-emerald-600 bg-emerald-50 border-emerald-100" />
                <FollowUpItem name="Sneha Gupta" time="11:30 AM" action="Demo" actionColor="text-blue-600 bg-blue-50 border-blue-100" />
                <FollowUpItem name="Vikram Singh" time="02:00 PM" action="Follow-up" actionColor="text-amber-600 bg-amber-50 border-amber-100" />
                <FollowUpItem name="Anjali Verma" time="04:30 PM" action="Call" actionColor="text-emerald-600 bg-emerald-50 border-emerald-100" />
              </div>
            </DashboardCard>

            {/* My Tasks */}
            <DashboardCard title="My Tasks" actionText="View All">
              <div className="space-y-4 mt-4">
                <TaskItem text="Call Rohan Mehta" time="10:00 AM" completed={false} />
                <TaskItem text="Send course details to Sneha" time="11:30 AM" completed={true} />
                <TaskItem text="Demo for Vikram Singh" time="02:00 PM" completed={false} />
                <TaskItem text="Follow-up with Anjali" time="04:30 PM" completed={false} />
              </div>
            </DashboardCard>

            {/* Recent Enquiries */}
            <DashboardCard title="Recent Enquiries" actionText="View All">
              <div className="space-y-4 mt-4">
                <EnquiryItem name="Rohan Mehta" source="Website" time="09:15 AM" />
                <EnquiryItem name="Anjali Verma" source="Referral" time="10:20 AM" />
                <EnquiryItem name="Vikram Singh" source="Walk-in" time="11:05 AM" />
                <EnquiryItem name="Sneha Gupta" source="Instagram" time="12:30 PM" />
              </div>
            </DashboardCard>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* My Performance */}
            <DashboardCard title="My Performance (This Month)">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 mt-4 grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Leads</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">64</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Admissions</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">9</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Conversion</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">21.4%</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Revenue</span>
                  <p className="text-lg font-extrabold text-emerald-600 mt-1">₹4.10 L</p>
                </div>
              </div>
            </DashboardCard>

            {/* Follow-up Reminders */}
            <DashboardCard title="Follow-up Reminders" actionText="View All">
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                  <span className="text-xs font-semibold text-slate-600">7 leads are pending follow-up</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  <span className="text-xs font-semibold text-slate-600">3 demos scheduled this week</span>
                </div>
              </div>
            </DashboardCard>

            {/* Upcoming Birthdays */}
            <DashboardCard title="Upcoming Birthdays" actionText="View All">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-700">Rahul Sharma</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">17 Jul</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-700">Neha Patel</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">19 Jul</span>
                </div>
              </div>
            </DashboardCard>

            {/* Motivational Quote */}
            <DashboardCard title="Motivational Quote">
              <div className="mt-4 flex flex-col items-center justify-center h-full text-center px-4 relative">
                <span className="text-4xl text-emerald-200 absolute top-0 left-2">"</span>
                <p className="text-sm font-semibold text-slate-600 italic relative z-10 px-4">
                  Every conversation is a step closer to changing a life.
                </p>
                <span className="text-4xl text-emerald-200 absolute bottom-0 right-2 leading-none">"</span>
              </div>
            </DashboardCard>

          </div>

        </div>
      </div>
<<<<<<< HEAD
      {user && <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />}
=======
>>>>>>> Chaitanya-local
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, trend, trendUp, icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-1">{title}</h3>
          <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
        {icon}
      </div>
      <div className="mt-3 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
          )}
        </svg>
        <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function DashboardCard({ title, actionText, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {actionText && (
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            {actionText}
          </button>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function PipelineStat({ label, value, percent, color }: any) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-sm ${color}`}></div>
        <span className="text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-800 font-bold">{value}</span>
        <span className="text-slate-400 w-10 text-right">({percent})</span>
      </div>
    </div>
  );
}

function FollowUpItem({ name, time, action, actionColor }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b`} alt={name} className="h-full w-full" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-semibold text-slate-400">{time}</span>
        <button className={`text-[10px] font-bold border rounded-md px-2 py-1 ${actionColor} hover:opacity-80 transition-opacity w-16 text-center`}>
          {action}
        </button>
      </div>
    </div>
  );
}

function TaskItem({ text, time, completed }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}>
          {completed && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className={`text-xs font-bold ${completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          {text}
        </p>
      </div>
      <span className="text-[10px] font-semibold text-slate-400">{time}</span>
    </div>
  );
}

function EnquiryItem({ name, source, time }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <p className="text-xs font-bold text-slate-800">{name}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-semibold text-slate-500 w-16">{source}</span>
        <span className="text-[10px] font-semibold text-slate-400 w-12 text-right">{time}</span>
        <span className="text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100 rounded px-1.5 py-0.5">
          New
        </span>
      </div>
    </div>
  );
}


// Icons (Simple SVG wrappers for cleaner code above)
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function UserAddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.5-.413 8.084-1.205a60.43 60.43 0 00-.49-6.347m-15.344 0C4.3 7.299 8 7 12 7s7.7 2.999 7.75 3.147m-15.344 0C3.46 11.584 3 13.088 3 14.7c0 1.71.533 3.32 1.455 4.654M19.75 10.147c.79 1.437 1.25 3.1 1.25 4.853 0 1.612-.46 3.116-1.205 4.454M12 2.25V5.25m0 0a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  );
}

function ChartUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}
