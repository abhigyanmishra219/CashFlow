"use client";

import React, { useState } from "react";
import { useUser } from "../../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";

export default function CounsellorCalendarPage() {
  const { user, logout } = useUser();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  if (!user) return null;

  // Generate days for the real calendar
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // padding for start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  // padding to fill 35 or 42 cells (complete the last row)
  const totalCells = days.length <= 35 ? 35 : 42;
  while (days.length < totalCells) {
    days.push(null);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = `${monthNames[month]} ${year}`;

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const isToday = (d: number) => {
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  const isSelected = (d: number) => {
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      <CounsellorSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
          </div>

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

            <div className="flex items-center gap-3 border-l border-slate-200 pl-5 cursor-pointer" onClick={logout}>
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
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-[28px] font-black text-[#1e293b] tracking-tight">My Schedule Calendar</h2>
            <p className="text-[#64748b] text-sm font-bold mt-1">Interactive timeline agenda showing client follow-up dates and task schedules.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Calendar Section */}
            <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">{currentMonthName}</h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) return <div key={index} className="h-24 rounded-xl"></div>;
                  
                  const current = isToday(day);
                  const selected = isSelected(day);
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`h-24 rounded-xl p-3 cursor-pointer transition-all border ${
                        selected 
                          ? 'border-indigo-500 shadow-sm shadow-indigo-100 bg-indigo-50/30' 
                          : current
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-xs font-bold ${
                        selected 
                          ? 'text-indigo-600'
                          : current
                            ? 'text-emerald-500'
                            : 'text-slate-700'
                      }`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agenda Tasks Section */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-bold text-slate-800">Agenda Tasks</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {monthNames[selectedDate.getMonth()].substring(0,3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center -mt-10">
                <p className="text-sm font-semibold text-slate-400 max-w-[200px]">
                  No follow-ups or reminders scheduled for this date.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
