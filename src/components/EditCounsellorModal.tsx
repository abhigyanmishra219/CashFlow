"use client";

import React, { useState, useEffect } from "react";

interface EditCounsellorModalProps {
  isOpen: boolean;
  onClose: () => void;
  counsellor: any;
  onSuccess: () => void;
}

export default function EditCounsellorModal({
  isOpen,
  onClose,
  counsellor,
  onSuccess,
}: EditCounsellorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brandScope: "",
    joiningDate: "",
    annualTarget: 500000,
    currentRevenue: 0,
    admissionsRecorded: 0,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const cleanPhoneDigits = (phone: string) => {
    if (!phone) return "";
    return String(phone).replace(/^\+?91\s?/, "").replace(/\D/g, "").slice(0, 10);
  };

  useEffect(() => {
    if (counsellor) {
      const cleaned = cleanPhoneDigits(counsellor.phone || "");
      setFormData({
        name: counsellor.name || "",
        email: counsellor.email || "",
        phone: "+91 " + cleaned,
        brandScope: counsellor.scope || counsellor.brandScope || "Cadd Mantra",
        joiningDate: counsellor.joiningDate && counsellor.joiningDate !== "—"
          ? new Date(counsellor.joiningDate).toISOString().split("T")[0]
          : "",
        annualTarget: counsellor.targetNum ?? 500000,
        currentRevenue: counsellor.revenueNum ?? 0,
        admissionsRecorded: counsellor.admissionsNum ?? 0,
      });
    }
  }, [counsellor]);

  if (!isOpen || !counsellor) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/^\+?91\s?/, "").replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      phone: "+91 " + digits,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const cleanPhone = cleanPhoneDigits(formData.phone);

    try {
      const response = await fetch(`/api/counsellors/${counsellor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: cleanPhone ? `+91 ${cleanPhone}` : "",
          brandScope: formData.brandScope,
          joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : undefined,
          annualTarget: Number(formData.annualTarget),
          currentRevenue: Number(formData.currentRevenue),
          admissionsRecorded: Number(formData.admissionsRecorded),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update counsellor profile.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
              Edit Counsellor Profile
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Modify credentials, annual goals, and channel assignments for {counsellor.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Phone Mobile
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="e.g. +91 9988011223"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Brand Scope & Joining Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Brand Channel Scope *
              </label>
              <input
                type="text"
                name="brandScope"
                required
                value={formData.brandScope}
                onChange={handleChange}
                placeholder="e.g. Cadd Mantra"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Performance Targets */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">Performance & Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Annual Target (₹)
                </label>
                <input
                  type="number"
                  name="annualTarget"
                  value={formData.annualTarget}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Revenue Collected (₹)
                </label>
                <input
                  type="number"
                  name="currentRevenue"
                  value={formData.currentRevenue}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Seats Admitted
                </label>
                <input
                  type="number"
                  name="admissionsRecorded"
                  value={formData.admissionsRecorded}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
