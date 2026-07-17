"use client";

import React, { useState, useEffect } from "react";

interface EditEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedLead: any) => void;
  lead: any;
}

export default function EditEnquiryModal({ isOpen, onClose, onSuccess, lead }: EditEnquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentFullName: "",
    primaryPhoneMobile: "",
    parentsPhoneNumber: "",
    emailAddress: "",
    currentCity: "",
    status: "",
    priorityLevel: "",
    assignedCrmAdvisor: "",
    leadSource: "",
    remarks: "",
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        studentFullName: lead.studentFullName || "",
        primaryPhoneMobile: lead.primaryPhoneMobile || "",
        parentsPhoneNumber: lead.parentsPhoneNumber || "",
        emailAddress: lead.emailAddress || "",
        currentCity: lead.currentCity || "",
        status: lead.status || "New",
        priorityLevel: lead.priorityLevel || "Medium",
        assignedCrmAdvisor: lead.assignedCrmAdvisor || "Rahul Sharma",
        leadSource: lead.leadSource || "Website",
        remarks: lead.remarks || "",
      });
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/enquiries/${lead._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (onSuccess) onSuccess(result.enquiry);
        else onClose();
      } else {
        const errorData = await response.json();
        console.error("Failed to update enquiry:", errorData.message);
        alert("Failed to update enquiry: " + errorData.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in font-sans">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 shrink-0 bg-slate-50/80 rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">
            Modify Client Lead
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-white border border-slate-200 rounded-full hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Student Name</label>
              <input name="studentFullName" value={formData.studentFullName} onChange={handleChange} type="text" className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Phone Mobile</label>
              <input name="primaryPhoneMobile" value={formData.primaryPhoneMobile} onChange={handleChange} type="tel" className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Alternate Mobile</label>
              <input name="parentsPhoneNumber" value={formData.parentsPhoneNumber} onChange={handleChange} type="tel" className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Address</label>
              <input name="emailAddress" value={formData.emailAddress} onChange={handleChange} type="email" className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">City</label>
              <input name="currentCity" value={formData.currentCity} onChange={handleChange} type="text" className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Pipeline Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Priority Level</label>
              <select name="priorityLevel" value={formData.priorityLevel} onChange={handleChange} className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Lead Source</label>
              <select name="leadSource" value={formData.leadSource} onChange={handleChange} className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
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
              <label className="block text-xs font-bold text-slate-500 mb-1.5">CRM Advisor</label>
              <select name="assignedCrmAdvisor" value={formData.assignedCrmAdvisor} onChange={handleChange} className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option value="Rahul Sharma">Rahul Sharma</option>
                <option value="Chaitanya Singhal">Chaitanya Singhal</option>
                <option value="Abhigyan Mishra">Abhigyan Mishra</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Remarks & notes</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={4} className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-white shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
