"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ManagerTaskCenter() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState<"all" | "escalated" | "overdue">("all");
  const [selectedCounsellor, setSelectedCounsellor] = useState<string>("All");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, counsellorsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/counsellors")
      ]);

      const tasksData = await tasksRes.json();
      const counsellorsData = await counsellorsRes.json();

      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        setTasks(tasksData.tasks);
      }
      if (counsellorsData.success && Array.isArray(counsellorsData.counsellors)) {
        setCounsellors(counsellorsData.counsellors);
      }
    } catch (err) {
      console.error("Failed fetching manager task supervision data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveEscalation = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEscalated: false, status: "Pending" })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed resolving escalation:", err);
    }
  };

  const handleReassignTask = async (taskId: string, newAssignee: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: newAssignee })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed reassigning task:", err);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;
  const escalatedTasks = tasks.filter((t) => t.isEscalated || t.status === "Escalated").length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "escalated" && !t.isEscalated && t.status !== "Escalated") return false;
    if (activeFilter === "overdue" && t.status !== "Overdue") return false;

    if (selectedCounsellor !== "All" && (t.assignedTo || "").toLowerCase() !== selectedCounsellor.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Manager Operational Task Supervision</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor team productivity, SOP bottlenecks, resolution rates, and manager escalations in real time.
          </p>
        </div>
      </div>

      {/* METRIC ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total SOP Tasks</span>
          <span className="text-2xl font-extrabold text-slate-800">{totalTasks}</span>
        </div>

        <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Escalations Pending</span>
          <span className="text-2xl font-extrabold text-purple-700">{escalatedTasks}</span>
        </div>

        <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Overdue Bottlenecks</span>
          <span className="text-2xl font-extrabold text-rose-600">{overdueTasks}</span>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">SOP Completion Rate</span>
          <span className="text-2xl font-extrabold text-emerald-700">{completionRate}%</span>
        </div>
      </div>

      {/* FILTER & SUPERVISION TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveFilter("escalated")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "escalated" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Manager Escalations ({escalatedTasks})
            </button>
            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "overdue" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Overdue ({overdueTasks})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedCounsellor}
              onChange={(e) => setSelectedCounsellor(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            >
              <option value="All">All Team Counsellors</option>
              {counsellors.map((c) => {
                const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                return <option key={c._id} value={name}>{name}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Task Control List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-medium">Loading supervision dashboard...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold">No operational tasks found for this filter.</div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t._id}
                className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  t.isEscalated || t.status === "Escalated" ? "bg-purple-50/50 border-purple-200" :
                  t.status === "Overdue" ? "bg-rose-50/50 border-rose-200" : "bg-slate-50/50 border-slate-200/80"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{t.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {t.taskType}
                    </span>
                    {t.isEscalated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                        Manager Escalated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{t.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
                    <span>Assigned: <strong className="text-indigo-600">{t.assignedTo}</strong></span>
                    <span>Due Date: {new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.isEscalated && (
                    <button
                      onClick={() => handleResolveEscalation(t._id)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Resolve Escalation
                    </button>
                  )}

                  <select
                    onChange={(e) => {
                      if (e.target.value) handleReassignTask(t._id, e.target.value);
                    }}
                    defaultValue=""
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="" disabled>Reassign To...</option>
                    {counsellors.map((c) => {
                      const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                      return <option key={c._id} value={name}>{name}</option>;
                    })}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
