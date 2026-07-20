"use client";

import React, { useState, useEffect } from "react";
import EditEnquiryModal from "./EditEnquiryModal";
import AdmissionModal from "./AdmissionModal";

interface LeadProfileProps {
  lead: any;
  onClose: () => void;
  onSuccess?: () => void;
  defaultOpenTaskModal?: boolean;
}

export default function LeadProfile({ lead, onClose, onSuccess, defaultOpenTaskModal = false }: LeadProfileProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(defaultOpenTaskModal);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [localLead, setLocalLead] = useState<any>(lead);

  // Form states
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskType, setTaskType] = useState("Phone Call");
  const [taskRemarks, setTaskRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Complete Task Modal states
  const [isCompleteTaskModalOpen, setIsCompleteTaskModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<any | null>(null);
  const [completeRemarks, setCompleteRemarks] = useState("");
  const [conversionChance, setConversionChance] = useState("High");
  const [updateLeadStatus, setUpdateLeadStatus] = useState("Contacted");
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  // Schedule Demo Modal states
  const [isScheduleDemoModalOpen, setIsScheduleDemoModalOpen] = useState(false);
  const [demoDate, setDemoDate] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [demoMode, setDemoMode] = useState("Online (Zoom/Google Meet)");
  const [demoNotes, setDemoNotes] = useState("");
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  // Mark Demo Attended Modal states
  const [isMarkDemoAttendedModalOpen, setIsMarkDemoAttendedModalOpen] = useState(false);
  const [demoToMarkAttendedIdx, setDemoToMarkAttendedIdx] = useState<number | null>(null);
  const [demoAttendanceRemarks, setDemoAttendanceRemarks] = useState("");
  const [demoConversionChance, setDemoConversionChance] = useState("High");
  const [demoLeadStatus, setDemoLeadStatus] = useState("Demo Attended");
  const [isSubmittingDemoAttendance, setIsSubmittingDemoAttendance] = useState(false);

  useEffect(() => {
    setLocalLead(lead);
    if (defaultOpenTaskModal) {
      setIsAddTaskModalOpen(true);
      setActiveTab("Follow-ups Tasker");
    }
  }, [lead, defaultOpenTaskModal]);

  const handleAddSubmit = async () => {
    if (!taskDate || !taskTime || !taskRemarks) {
      return alert("Please fill all required fields.");
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/enquiries/${localLead._id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: taskDate,
          time: taskTime,
          priority: taskPriority,
          typeOfContact: taskType,
          remarks: taskRemarks
        })
      });
      const data = await response.json();
      if (data.success) {
        setLocalLead(data.data);
        setIsAddTaskModalOpen(false);
        setTaskDate("");
        setTaskTime("");
        setTaskRemarks("");
        onSuccess?.();
      } else {
        alert("Failed to add task: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error adding task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/enquiries/${localLead._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        alert("Failed to delete lead: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting lead.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to cancel and remove this follow-up task?")) {
      return;
    }
    try {
      const response = await fetch(`/api/enquiries/${localLead._id}/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setLocalLead(data.data);
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to remove task: " + (data.message || data.error));
      }
    } catch (e) {
      console.error(e);
      alert("Error removing task.");
    }
  };

  const handleOpenCompleteTaskModal = (task: any) => {
    setTaskToComplete(task);
    setCompleteRemarks(task.remarks || "");
    setConversionChance(localLead.priorityLevel || "High");
    if (task.typeOfContact === "Demo Class" || (task.remarks || "").toLowerCase().includes("demo")) {
      setUpdateLeadStatus("Demo Attended");
    } else {
      setUpdateLeadStatus(localLead.status || "Contacted");
    }
    setIsCompleteTaskModalOpen(true);
  };

  const handleOpenMarkDemoAttendedModal = (demoIdx: number, demo: any) => {
    setDemoToMarkAttendedIdx(demoIdx);
    setDemoAttendanceRemarks(demo.notes ? `Demo Attended (${demo.mode}): ${demo.notes}` : `Student attended ${demo.mode || "Demo Class"} successfully.`);
    setDemoConversionChance(localLead.priorityLevel || "High");
    setDemoLeadStatus("Demo Attended");
    setIsMarkDemoAttendedModalOpen(true);
  };

  const handleMarkDemoAttendedSubmit = async () => {
    if (demoToMarkAttendedIdx === null) return;
    setIsSubmittingDemoAttendance(true);
    try {
      const updatedDemos = activeDemoList.map((d: any, i: number) => {
        if (i === demoToMarkAttendedIdx) {
          return {
            ...d,
            status: "Attended",
            notes: demoAttendanceRemarks,
            attendedAt: new Date().toISOString()
          };
        }
        return d;
      });

      const res = await fetch(`/api/enquiries/${localLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demos: updatedDemos,
          status: demoLeadStatus,
          priorityLevel: demoConversionChance,
          remarks: demoAttendanceRemarks,
          followUpNotes: demoAttendanceRemarks
        })
      });

      const data = await res.json();
      if (data.success || data.enquiry) {
        setLocalLead(data.enquiry || {
          ...localLead,
          demos: updatedDemos,
          status: demoLeadStatus,
          priorityLevel: demoConversionChance
        });
        setIsMarkDemoAttendedModalOpen(false);
        setDemoToMarkAttendedIdx(null);
        if (onSuccess) onSuccess();
        alert("Demo marked as Attended!");
      } else {
        alert("Failed to update demo attendance: " + (data.message || data.error));
      }
    } catch (e) {
      console.error(e);
      alert("Error marking demo attended.");
    } finally {
      setIsSubmittingDemoAttendance(false);
    }
  };

  const handleCompleteTaskSubmit = async () => {
    if (!taskToComplete) return;
    setIsCompletingTask(true);
    try {
      const response = await fetch(`/api/enquiries/${localLead._id}/tasks/${taskToComplete._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: true,
          status: "Completed",
          remarks: completeRemarks,
          conversionChance: conversionChance,
          leadStatus: updateLeadStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        setLocalLead(data.data);
        setIsCompleteTaskModalOpen(false);
        setTaskToComplete(null);
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to update task: " + (data.message || data.error));
      }
    } catch (e) {
      console.error(e);
      alert("Error completing task.");
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleScheduleDemoSubmit = async () => {
    if (!demoDate || !demoTime) {
      return alert("Please select Demo Date and Time.");
    }
    setIsSubmittingDemo(true);
    try {
      const demoItem = {
        date: demoDate,
        time: demoTime,
        mode: demoMode,
        notes: demoNotes,
        status: "Scheduled",
        createdAt: new Date().toISOString()
      };

      const res = await fetch(`/api/enquiries/${localLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          $set: {
            isDemoScheduled: true,
            demoDate,
            demoTime,
            demoNotes: `${demoMode} - ${demoNotes}`,
            status: "Demo Scheduled",
          },
          $push: {
            demos: demoItem
          }
        }),
      });

      await fetch(`/api/enquiries/${localLead._id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: demoDate,
          time: demoTime,
          priority: "High",
          typeOfContact: "Demo Class",
          remarks: `Demo Scheduled (${demoMode}): ${demoNotes || "Live demo session"}`
        })
      });

      const data = await res.json();
      if (data.success || data.enquiry) {
        const updated = data.enquiry || data.data || {
          ...localLead,
          isDemoScheduled: true,
          demoDate,
          demoTime,
          demoNotes: `${demoMode} - ${demoNotes}`,
          status: "Demo Scheduled",
          demos: [...(localLead.demos || []), demoItem]
        };
        setLocalLead(updated);
        setIsScheduleDemoModalOpen(false);
        if (onSuccess) onSuccess();
        alert("Demo Scheduled successfully!");
      } else {
        alert("Failed to schedule demo: " + (data.message || data.error));
      }
    } catch (e) {
      console.error(e);
      alert("Error scheduling demo.");
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  const handleOpenScheduleDemoModal = () => {
    if (!demoDate) {
      setDemoDate(new Date().toISOString().split('T')[0]);
    }
    if (!demoTime) {
      setDemoTime("11:00");
    }
    setIsScheduleDemoModalOpen(true);
  };

  // Aggregate all demo records (demos array, followUp tasks, legacy demo fields)
  const getDemoList = () => {
    const list: any[] = [];
    if (localLead?.demos && localLead.demos.length > 0) {
      list.push(...localLead.demos);
    }
    if (localLead?.followUps && localLead.followUps.length > 0) {
      localLead.followUps.forEach((f: any) => {
        if (f.typeOfContact === "Demo Class" || (f.remarks || "").toLowerCase().includes("demo")) {
          const exists = list.some(d => d.date === f.date && d.time === f.time);
          if (!exists) {
            list.push({
              _id: f._id,
              date: f.date,
              time: f.time,
              mode: "Demo Session",
              notes: f.remarks,
              status: f.isCompleted ? "Completed" : (f.status || "Scheduled"),
              createdAt: f.createdAt
            });
          }
        }
      });
    }
    if (list.length === 0 && localLead?.isDemoScheduled && localLead?.demoDate) {
      list.push({
        date: localLead.demoDate,
        time: localLead.demoTime || "12:00",
        mode: "Demo Class",
        notes: localLead.demoNotes || "Scheduled Demo Class",
        status: "Scheduled"
      });
    }
    return list;
  };

  const activeDemoList = getDemoList();

  const handleUpdateDemoStatus = async (demoIdx: number, newStatus: string) => {
    try {
      const updatedDemos = activeDemoList.map((d: any, i: number) => {
        if (i === demoIdx) {
          return { ...d, status: newStatus };
        }
        return d;
      });

      const res = await fetch(`/api/enquiries/${localLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demos: updatedDemos,
          ...(newStatus === "Attended" ? { status: "Demo Attended" } : {})
        })
      });

      const data = await res.json();
      if (data.success || data.enquiry) {
        setLocalLead(data.enquiry || { ...localLead, demos: updatedDemos, ...(newStatus === "Attended" ? { status: "Demo Attended" } : {}) });
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to update demo status: " + (data.message || data.error));
      }
    } catch (e) {
      console.error(e);
      alert("Error updating demo status.");
    }
  };

  if (!localLead) return null;

  // Helpers for CRM advice
  const priority = localLead.priorityLevel || "Medium";
  const fee = localLead.expectedCourseFee || "₹0";
  const advice = `Based on marketing tags and a priority level of ${priority}, we recommend engaging within 4 hours. Present customized fee brackets of around ${fee} to maintain strong pipeline conversion velocities.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full h-full max-w-7xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* TOP HEADER */}
        <div className="bg-white px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-start justify-between gap-4 shrink-0 relative">

          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="pl-10 flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{localLead.studentFullName || "Unknown Lead"}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                {localLead.status || "New"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                {priority} Priority
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
              <span>ID: <span className="font-mono text-slate-600">{localLead.enquiryId}</span></span>
              <span className="text-slate-300">•</span>
              <span>Course: <span className="font-mono text-slate-600">{localLead.targetCourse || "N/A"}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditProfileModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit Profile
            </button>
            <button onClick={() => setActiveTab("Follow-ups Tasker")} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Log Follow-up
            </button>
            <button onClick={() => setIsScheduleDemoModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Schedule Demo
            </button>
            <button onClick={() => setIsAdmissionModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-500 border border-emerald-600 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Convert to Admission
            </button>
            <button onClick={handleDeleteLead} className="flex items-center justify-center p-2 text-rose-500 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-8 shrink-0 overflow-x-auto">
          {["Overview", "Timeline History", "Follow-ups Tasker", "Demo History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors shrink-0 ${activeTab === tab
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
            >
              <div className="flex items-center gap-2">
                {tab === "Overview" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
                {tab === "Timeline History" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                )}
                {tab === "Follow-ups Tasker" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab === "Demo History" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
                <span>{tab}</span>
              </div>
            </button>
          ))}
        </div>

        {/* TAB CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {/* LEFT & CENTER COLUMN (combined in a card, dynamic based on tab) */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-xs overflow-y-auto">
              
              {activeTab === "Overview" ? (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Demographic */}
                    <div className="space-y-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demographic Profile</h3>
                      
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Mobile Phone</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.primaryPhoneMobile}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Alternate Phone</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.parentsPhoneNumber || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Email Address</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.emailAddress || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Current City</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.currentCity || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Routing Details */}
                    <div className="space-y-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Routing Details</h3>
                      
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Brand</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.targetBrand}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Assigned CRM Advisor</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.assignedCrmAdvisor}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Marketing Lead Source</p>
                          <p className="text-sm font-bold text-slate-800">{localLead.leadSource || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-emerald-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Expected Conversion Fee</p>
                          <p className="text-sm font-extrabold text-emerald-600">{fee}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Remarks & Strategy Notes</h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-600">
                      {localLead.remarks || "No supplementary notes logged for this profile."}
                    </div>
                  </div>
                </div>
              ) : activeTab === "Timeline History" ? (
                <div className="flex flex-col">
                  <h2 className="text-sm font-extrabold text-slate-800 tracking-tight mb-8">CRM Interaction History</h2>
                  
                  <div className="relative border-l border-slate-100 ml-2.5 space-y-8 pb-4">
                    
                    {/* Event 1 */}
                    <div className="relative pl-6 group">
                      <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border border-indigo-200 rounded-full flex items-center justify-center text-indigo-500 shadow-[0_0_0_4px_white]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 -mt-1">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Enquiry Created</h4>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">Enquiry registered with initial status: {localLead.status}</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono mt-2">Logged by: System</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono tracking-tighter">
                          {localLead.createdAt ? new Date(localLead.createdAt).toLocaleDateString() : "7/13/2026"} • {localLead.createdAt ? new Date(localLead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "04:04 PM"}
                        </span>
                      </div>
                    </div>

                    {/* Event 2 */}
                    <div className="relative pl-6 group">
                      <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border border-indigo-200 rounded-full flex items-center justify-center text-indigo-500 shadow-[0_0_0_4px_white]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 -mt-1">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Assigned</h4>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">Lead assigned directly to counselor</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono mt-2">Logged by: {localLead.assignedCrmAdvisor || "System"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono tracking-tighter">
                          {localLead.createdAt ? new Date(localLead.createdAt).toLocaleDateString() : "7/13/2026"} • {localLead.createdAt ? new Date(localLead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "04:04 PM"}
                        </span>
                      </div>
                    </div>

                    {/* Event 3 (Conditional Mock) */}
                    {localLead.followUpDate && (
                      <div className="relative pl-6 group">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 bg-white border border-indigo-200 rounded-full flex items-center justify-center text-indigo-500 shadow-[0_0_0_4px_white]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 -mt-1">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Follow-up</h4>
                            <p className="text-xs text-slate-500 mt-1 font-semibold">Follow-up planned: [{localLead.followUpType || "WhatsApp"}] scheduled on {new Date(localLead.followUpDate).toISOString().split('T')[0]} at {localLead.followUpTime || "12:00"}</p>
                            <p className="text-[10px] text-slate-400 font-medium font-mono mt-2">Logged by: {localLead.assignedCrmAdvisor || "System"}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono tracking-tighter">
                            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : activeTab === "Follow-ups Tasker" ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">Scheduled Follow-up Tasks</h2>
                    <button onClick={() => setIsAddTaskModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Task
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {localLead.followUps && localLead.followUps.length > 0 ? (
                      localLead.followUps.slice().reverse().map((task: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-indigo-600 font-bold text-xs">[{task.typeOfContact}]</span>
                              <span className="text-slate-400 font-medium text-xs font-mono">Scheduled: {task.date} at {task.time}</span>
                            </div>
                            <p className="text-slate-700 font-semibold text-sm mb-2">{task.remarks}</p>
                            <p className="text-slate-400 font-medium font-mono text-[10px]">Planned by: {task.plannedBy}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${task.isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                              {task.status || (task.isCompleted ? "Completed" : "Pending")}
                            </span>
                            <button
                              title="Complete Task & Log Remarks"
                              onClick={() => handleOpenCompleteTaskModal(task)}
                              className={`transition-colors p-1.5 rounded-full cursor-pointer ${task.isCompleted ? 'text-white bg-emerald-500' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </button>
                            <button
                              title="Cancel & Delete Task"
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-colors cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-slate-400 text-sm font-semibold">No follow-up tasks scheduled yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === "Demo History" ? (
                <div className="flex flex-col h-full space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        Scheduled & Past Demo Sessions
                        <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {activeDemoList.length}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Complete record of all demo classes, online links, and attendance logs for {localLead.studentFullName}.</p>
                    </div>
                    <button
                      onClick={handleOpenScheduleDemoModal}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-purple-500/20 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Schedule Demo Class
                    </button>
                  </div>

                  {/* Demo List */}
                  <div className="space-y-4">
                    {activeDemoList.length > 0 ? (
                      activeDemoList.slice().reverse().map((demo: any, dIdx: number) => (
                        <div key={dIdx} className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                  {demo.mode || "Demo Session"}
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    demo.status === "Attended" || demo.status === "Completed"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : demo.status === "Cancelled"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}>
                                    {demo.status || "Scheduled"}
                                  </span>
                                </h4>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5 font-mono">
                                  Scheduled: {demo.date} at {demo.time}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {demo.status !== "Attended" && demo.status !== "Completed" && (
                                <button
                                  onClick={() => handleOpenMarkDemoAttendedModal(dIdx, demo)}
                                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Mark Attended
                                </button>
                              )}
                              <button
                                onClick={handleOpenScheduleDemoModal}
                                className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Reschedule
                              </button>
                            </div>
                          </div>

                          {demo.notes && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 mb-3">
                              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Notes / Instructions:</span>
                              {demo.notes}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                            <span>Course: <strong className="text-slate-700">{localLead.targetCourse}</strong></span>
                            <span>Logged on: {demo.createdAt ? new Date(demo.createdAt).toLocaleDateString() : "Recently"}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                        <div className="h-12 w-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 mb-1">No Demo History Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mb-4">No demo classes have been scheduled or completed for {localLead.studentFullName} yet.</p>
                        <button
                          onClick={handleOpenScheduleDemoModal}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Schedule First Demo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[400px]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-500 mb-1">{activeTab} tab is under construction</h3>
                  <p className="text-xs">More features coming soon.</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (Persistent across tabs) */}
            <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
              
              {/* INTERACTIVE COMMUNICATION SUMMARY */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Interactive Communication Summary</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400">Scheduled followup</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{localLead.followUpDate ? new Date(localLead.followUpDate).toISOString().split('T')[0] : "None"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400">Last contact date</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{localLead.createdAt ? new Date(localLead.createdAt).toISOString().split('T')[0] : "N/A"}</p>
                  </div>
                </div>

                {localLead.isDemoScheduled && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Scheduled Demo</p>
                      <p className="text-xs font-bold text-purple-950 mt-0.5">{localLead.demoDate} at {localLead.demoTime}</p>
                      {localLead.demoNotes && <p className="text-[11px] font-medium text-purple-700/80 truncate max-w-[200px]">{localLead.demoNotes}</p>}
                    </div>
                    <button
                      onClick={() => setIsScheduleDemoModalOpen(true)}
                      className="text-[10px] font-bold bg-white text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg hover:bg-purple-100 transition-colors shadow-xs"
                    >
                      Reschedule
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Call Phone
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 transition-colors shadow-sm text-emerald-600 border-emerald-100 hover:border-emerald-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    WhatsApp Chat
                  </button>
                </div>
              </div>

              {/* COACHFLOW CRM ADVICE */}
              <div className="bg-indigo-50/80 rounded-2xl border border-indigo-100 p-6 shadow-xs relative overflow-hidden flex-1">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-indigo-600">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.758a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
                
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <h3 className="text-sm font-bold text-indigo-900 tracking-tight">CoachFlow CRM Advice</h3>
                </div>
                <p className="text-xs font-semibold text-indigo-800/80 leading-relaxed relative z-10">
                  {advice}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ADD TASK MODAL OVERLAY */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Plan Follow-up Interaction</h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pb-6 overflow-y-auto max-h-[75vh] flex flex-col gap-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Follow-up Date *</label>
                <input value={taskDate} onChange={e => setTaskDate(e.target.value)} type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Follow-up Time *</label>
                <input value={taskTime} onChange={e => setTaskTime(e.target.value)} type="time" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Priority *</label>
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1em" }}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Type of Contact *</label>
                <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1em" }}>
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp Message">WhatsApp Message</option>
                  <option value="Face-to-Face Meeting">Face-to-Face Meeting</option>
                  <option value="Zoom/Google Meet Video Call">Zoom/Google Meet Video Call</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Interaction Remarks *</label>
                <textarea value={taskRemarks} onChange={e => setTaskRemarks(e.target.value)} rows={3} placeholder="e.g. Schedule weekend consultation, send fee structures..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none bg-white"></textarea>
              </div>

            </div>
            
            <div className="px-6 py-5 flex items-center justify-center gap-3">
              <button disabled={isSubmitting} onClick={() => setIsAddTaskModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors border border-slate-200 bg-white shadow-sm flex-1 disabled:opacity-50">Cancel</button>
              <button disabled={isSubmitting} onClick={handleAddSubmit} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex-1 disabled:opacity-50">{isSubmitting ? "Scheduling..." : "Schedule interaction"}</button>
            </div>
          </div>
        </div>
      )}
      
      <EditEnquiryModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
        lead={localLead}
        onSuccess={(updatedLead) => {
          setLocalLead(updatedLead);
          setIsEditProfileModalOpen(false);
          if (onSuccess) onSuccess();
        }}
      />

      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        lead={localLead}
      />

      {/* COMPLETE TASK & LOG REMARKS MODAL OVERLAY */}
      {isCompleteTaskModalOpen && taskToComplete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Complete Follow-up Task</h3>
                  <p className="text-xs font-semibold text-slate-500">[{taskToComplete.typeOfContact}] scheduled for {taskToComplete.date} at {taskToComplete.time}</p>
                </div>
              </div>
              <button onClick={() => setIsCompleteTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[75vh] flex flex-col gap-5">
              {/* Interaction Remarks / Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Interaction Remarks / Outcome *
                </label>
                <textarea
                  value={completeRemarks}
                  onChange={(e) => setCompleteRemarks(e.target.value)}
                  rows={3}
                  placeholder="Log what happened during this call/meeting (e.g. Student requested fee discount, demo scheduled for Friday)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none bg-white"
                />
              </div>

              {/* Conversion Chances / Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Conversion Chance / Interest Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "High (Hot)", value: "High", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                    { label: "Medium (Warm)", value: "Medium", color: "border-amber-300 bg-amber-50 text-amber-700" },
                    { label: "Low (Cold)", value: "Low", color: "border-slate-300 bg-slate-50 text-slate-700" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setConversionChance(option.value)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        conversionChance === option.value
                          ? `${option.color} shadow-sm ring-2 ring-emerald-500/20`
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Status Update */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Lead Pipeline Status
                </label>
                <select
                  value={updateLeadStatus}
                  onChange={(e) => setUpdateLeadStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Demo Scheduled">Demo Scheduled</option>
                  <option value="Demo Attended">Demo Attended</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isCompletingTask}
                onClick={() => setIsCompleteTaskModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCompletingTask}
                onClick={handleCompleteTaskSubmit}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isCompletingTask ? "Saving..." : "Mark Completed & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE DEMO MODAL OVERLAY */}
      {isScheduleDemoModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Schedule Demo Class</h3>
                  <p className="text-xs font-semibold text-purple-600">For {localLead.studentFullName}</p>
                </div>
              </div>
              <button onClick={() => setIsScheduleDemoModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-6 overflow-y-auto max-h-[75vh] flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Demo Date *</label>
                <input
                  type="date"
                  value={demoDate}
                  onChange={(e) => setDemoDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Demo Time *</label>
                <input
                  type="time"
                  value={demoTime}
                  onChange={(e) => setDemoTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Demo Mode *</label>
                <select
                  value={demoMode}
                  onChange={(e) => setDemoMode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                >
                  <option value="Online (Zoom/Google Meet)">Online (Zoom / Google Meet)</option>
                  <option value="In-Person Classroom">In-Person Classroom</option>
                  <option value="Recorded Demo Session">Recorded Demo Session</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Demo Topic / Notes</label>
                <textarea
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Intro lecture on Data Analytics, Room 204 or Meeting Link..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none bg-white"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmittingDemo}
                onClick={() => setIsScheduleDemoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDemo}
                onClick={handleScheduleDemoSubmit}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingDemo ? "Scheduling..." : "Save & Schedule Demo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK DEMO ATTENDED MODAL OVERLAY */}
      {isMarkDemoAttendedModalOpen && demoToMarkAttendedIdx !== null && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Log Demo Attendance & Outcome</h3>
                  <p className="text-xs font-semibold text-emerald-700">For {localLead.studentFullName}</p>
                </div>
              </div>
              <button onClick={() => setIsMarkDemoAttendedModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[75vh] flex flex-col gap-5">
              {/* Interaction Remarks / Demo Outcome */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Demo Class Outcome & Remarks *
                </label>
                <textarea
                  value={demoAttendanceRemarks}
                  onChange={(e) => setDemoAttendanceRemarks(e.target.value)}
                  rows={3}
                  placeholder="Log how the demo class went (e.g., Student attended Zoom class, requested fee discount, ready for admission)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none bg-white"
                />
              </div>

              {/* Conversion Chances / Interest Level */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Post-Demo Conversion Chance / Interest *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "High (Hot)", value: "High", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                    { label: "Medium (Warm)", value: "Medium", color: "border-amber-300 bg-amber-50 text-amber-700" },
                    { label: "Low (Cold)", value: "Low", color: "border-slate-300 bg-slate-50 text-slate-700" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDemoConversionChance(option.value)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        demoConversionChance === option.value
                          ? `${option.color} shadow-sm ring-2 ring-emerald-500/20`
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Pipeline Status Update */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Lead Pipeline Status
                </label>
                <select
                  value={demoLeadStatus}
                  onChange={(e) => setDemoLeadStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                >
                  <option value="Demo Attended">Demo Attended</option>
                  <option value="Interested">Interested</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmittingDemoAttendance}
                onClick={() => setIsMarkDemoAttendedModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDemoAttendance}
                onClick={handleMarkDemoAttendedSubmit}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingDemoAttendance ? "Saving..." : "Mark Attended & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
