"use client";

import React, { useState } from "react";

interface RegisterCounsellorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegisterCounsellorModal({ isOpen, onClose, onSuccess }: RegisterCounsellorModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 99880 11223",
    photoUrl: "",
    brandScope: "Cadd Mantra",
    joiningDate: "2026-07-14",
    annualTarget: 500000,
    currentRevenue: 0,
    admissionsRecorded: 0,
    password: "CoachFlowTemp123!",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/counsellors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register counsellor.");
      } else {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
      >

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 font-sans">
            <span className="text-indigo-600 text-lg font-bold">+</span> Register Sales Counsellor
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs font-semibold font-sans">
            {error}
          </div>
        )}

        {/* Modal Form Fields */}
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 font-sans">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              placeholder="Enter your name"
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Email *</label>
            <input
              type="email"
              name="email"
              placeholder="rahul.s@brand.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Photo URL</label>
            <input
              type="text"
              name="photoUrl"
              placeholder="https://images.unsplash.com/... (optional)"
              value={formData.photoUrl}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Brand Scope *</label>
            <select
              name="brandScope"
              value={formData.brandScope}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none disabled:opacity-50"
            >
              <option value="Cadd Mantra">Cadd Mantra</option>
              <option value="Design Gateway">Design Gateway</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Target (INR) *</label>
            <input
              type="number"
              name="annualTarget"
              value={formData.annualTarget}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Revenue (INR)</label>
            <input
              type="number"
              name="currentRevenue"
              value={formData.currentRevenue}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temporary Password *</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
            />
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 transition-all font-sans disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              "Register Counsellor"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
