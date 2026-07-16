"use client";

import React, { useState, useEffect } from "react";

interface AddEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddEnquiryModal({ isOpen, onClose, onSuccess }: AddEnquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counsellors, setCounsellors] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/counsellors")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCounsellors(data.counsellors);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to save enquiry:", errorData.message);
        alert("Failed to save enquiry: " + errorData.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Register New Client Lead (Enquiry)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* SECTION 1 */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Section 1: Demographics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Student Full Name *</label>
                <input name="studentFullName" type="text" placeholder="e.g. Rahul Sharma" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Phone Mobile *</label>
                <input name="primaryPhoneMobile" type="tel" placeholder="e.g. +91 9876543210" required pattern="^\+91\s?\d{10}$" maxLength={14} title="Must start with +91 followed by 10 digits" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Parents Full Name</label>
                <input name="parentsFullName" type="text" placeholder="e.g. Ramesh Sharma" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Parents Phone Number</label>
                <input name="parentsPhoneNumber" type="tel" placeholder="e.g. +91 9876500000" pattern="^\+91\s?\d{10}$" maxLength={14} title="Must start with +91 followed by 10 digits" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input name="emailAddress" type="email" placeholder="e.g. rahul@domain.com" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current City</label>
                <input name="currentCity" type="text" placeholder="e.g. New Delhi" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Section 2: Business Routing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Brand *</label>
                <select name="targetBrand" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="Cadd Mantra">Cadd Mantra</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Course *</label>
                <select name="targetCourse" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="">-- Select a Course --</option>
                  <option value="AutoCAD">AutoCAD</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned CRM Advisor *</label>
                <select name="assignedCrmAdvisor" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="">-- Select Advisor --</option>
                  {counsellors.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lead Source</label>
                <select name="leadSource" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="Google Ads">Google Ads</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Website">Website</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Hoarding">Hoarding</option>
                  <option value="Reference">Reference</option>
                  <option value="Paper Ads">Paper Ads</option>
                  <option value="Internet Search">Internet Search</option>
                  <option value="Direct Walkin">Direct Walkin</option>
                  <option value="Call on Database">Call on Database</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expected Course Fee (read-only)</label>
                <input name="expectedCourseFee" type="text" value="₹0" readOnly className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 bg-slate-50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority Level</label>
                <select name="priorityLevel" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="Medium">Medium</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Section 3: Remarks & Strategy Notes</h4>
            <div>
              <textarea name="remarks" placeholder="Provide deep client context here e.g. 'Highly interested in Saturday cohorts, requested installment flexibility...'" rows={3} className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"></textarea>
            </div>
          </div>

          {/* SECTION 4 */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-4">Section 4: Next Follow-Up</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Follow-up Date *</label>
                <input name="followUpDate" type="date" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" defaultValue="2026-07-16" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Follow-up Time *</label>
                <input name="followUpTime" type="time" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" defaultValue="10:00" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Follow-up Type *</label>
                <select name="followUpType" required className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Follow-up Priority</label>
                <select name="followUpPriority" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="Medium">Medium</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reminder</label>
                <select name="reminder" className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="None">None</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Follow-up Notes</label>
                <textarea name="followUpNotes" placeholder="Discuss fee structure, answer doubts, send brochure, schedule demo class" rows={2} className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 rounded-xl transition-all disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Create Client Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
