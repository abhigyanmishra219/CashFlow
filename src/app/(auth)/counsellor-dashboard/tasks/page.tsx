"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import LeadProfile from "@/components/LeadProfile";
import { motion, AnimatePresence } from "framer-motion";

export default function CounsellorTasksPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "today" | "overdue" | "escalated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // New Manual Task Modal
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Lead Call");
  const [newStudent, setNewStudent] = useState("");
  const [newPriority, setNewPriority] = useState("High");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [newChecklistText, setNewChecklistText] = useState("");

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(user.name || '')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch counsellor tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Toggle checklist item
  const handleToggleChecklist = async (taskId: string, checklistIndex: number, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistIndex,
          isChecklistCompleted: !currentVal
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to toggle checklist:", err);
    }
  };

  // Complete task
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  // Create Manual Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const checklistItems = newChecklistText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          taskType: newType,
          linkedStudentName: newStudent,
          assignedTo: user?.name || "System",
          priority: newPriority,
          dueDate: newDueDate,
          checklist: checklistItems
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsNewTaskModalOpen(false);
        setNewTitle("");
        setNewStudent("");
        setNewChecklistText("");
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed creating task:", err);
    }
  };

  if (!user) return null;

  const todayStr = new Date().toDateString();

  // Filter tasks based on tabs and dropdowns
  const filteredTasks = tasks.filter((t) => {
    // Tab filter
    if (activeTab === "today") {
      const d = new Date(t.dueDate).toDateString();
      if (d !== todayStr || t.status === "Completed") return false;
    } else if (activeTab === "overdue") {
      if (t.status !== "Overdue") return false;
    } else if (activeTab === "escalated") {
      if (!t.isEscalated && t.status !== "Escalated") return false;
    }

    // Priority filter
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    // Type filter
    if (typeFilter !== "All" && t.taskType !== typeFilter) return false;

    // Text Search
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.linkedStudentName && t.linkedStudentName.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.taskType && t.taskType.toLowerCase().includes(q))
    );
  });

  // Metrics
  const pendingCount = tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length;
  const overdueCount = tasks.filter((t) => t.status === "Overdue").length;
  const escalatedCount = tasks.filter((t) => t.isEscalated || t.status === "Escalated").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <CounsellorSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Automated Task Engine & SOP Workflows</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Intelligent operational tasks automatically generated from student leads, admissions, and EMI schedules.
              </p>
            </div>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Create Operational Task</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
                <span className="text-xl font-extrabold text-slate-800">{pendingCount}</span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">⚡</div>
            </div>

            <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Overdue Tasks</span>
                <span className="text-xl font-extrabold text-rose-600">{overdueCount}</span>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">🚨</div>
            </div>

            <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Escalated To Manager</span>
                <span className="text-xl font-extrabold text-purple-700">{escalatedCount}</span>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">🎯</div>
            </div>

            <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Completed Tasks</span>
                <span className="text-xl font-extrabold text-emerald-700">{completedCount}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">✅</div>
            </div>
          </div>

          {/* Filter Bar & Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Tasks ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveTab("today")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "today" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Due Today
                </button>
                <button
                  onClick={() => setActiveTab("overdue")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "overdue" ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Overdue ({overdueCount})
                </button>
                <button
                  onClick={() => setActiveTab("escalated")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "escalated" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Escalated ({escalatedCount})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search task title, student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent / Escalated">Urgent / Escalated</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="All">All Task SOP Types</option>
                <option value="Lead Call">Lead Call</option>
                <option value="Demo">Demo Follow Up</option>
                <option value="Document Collection">Document Collection</option>
                <option value="Fee Collection">Fee Collection</option>
                <option value="Batch Allocation">Batch Allocation</option>
                <option value="Welcome Onboarding">Welcome Onboarding</option>
                <option value="EMI Recovery">EMI Recovery</option>
              </select>
            </div>
          </div>

          {/* Task Queue List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 min-h-[350px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Operational Task Queue ({filteredTasks.length})
            </h3>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400 font-medium">
                <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading operational tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold">
                🎉 No pending tasks match your active filter.
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-5 border rounded-2xl transition-all shadow-2xs ${
                        task.status === "Completed" ? "bg-slate-50 border-slate-200 opacity-65" :
                        task.isEscalated || task.status === "Escalated" ? "bg-purple-50/40 border-purple-200" :
                        task.status === "Overdue" ? "bg-rose-50/40 border-rose-200" :
                        "bg-white border-slate-200/90 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900">{task.title}</h4>
                            
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              task.priority === "Urgent / Escalated" ? "bg-rose-100 text-rose-700 border-rose-200" :
                              task.priority === "High" ? "bg-amber-100 text-amber-800 border-amber-200" :
                              "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {task.priority}
                            </span>

                            {task.autoTriggerSource && (
                              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                                ⚡ {task.autoTriggerSource}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 font-medium">{task.description}</p>

                          {task.linkedStudentName && (
                            <div className="text-xs font-semibold text-indigo-600 pt-0.5">
                              Student: {task.linkedStudentName}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.status !== "Completed" && (
                            <button
                              onClick={() => handleCompleteTask(task._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <span>Complete Task</span>
                              <span>✓</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SOP Checklist */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            SOP Action Checklist:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {task.checklist.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={() => handleToggleChecklist(task._id, idx, item.isCompleted)}
                                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                                  item.isCompleted ? "bg-emerald-50 border-emerald-200 text-emerald-800 line-through" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/40"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={() => {}}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                                />
                                <span>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Manual Operational Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Conduct Mock Interview"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">SOP Task Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="Lead Call">Lead Call</option>
                    <option value="Demo">Demo</option>
                    <option value="Document Collection">Document Collection</option>
                    <option value="Fee Collection">Fee Collection</option>
                    <option value="Batch Allocation">Batch Allocation</option>
                    <option value="Welcome Onboarding">Welcome Onboarding</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student / Candidate Name</label>
                <input
                  type="text"
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Checklist Actions (One per line)</label>
                <textarea
                  rows={3}
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Action item 1&#10;Action item 2"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LeadProfile
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSuccess={() => fetchTasks()}
      />
    </div>
  );
}
