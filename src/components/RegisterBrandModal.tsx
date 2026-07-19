"use client";

import React, { useState } from "react";

import { useEffect } from "react";

interface RegisterBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit?: any | null;
}

export default function RegisterBrandModal({ isOpen, onClose, brandToEdit }: RegisterBrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logoUrl: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    companies: [] as string[],
  });
  const [availableCompanies, setAvailableCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.companies) {
          setAvailableCompanies(d.companies.map((c: any) => ({ id: c._id || c.id, name: c.name })));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (brandToEdit) {
      setFormData({
        name: brandToEdit.name || "",
        code: brandToEdit.code || "",
        logoUrl: brandToEdit.logoUrl || "",
        description: brandToEdit.description || "",
        phone: brandToEdit.phone || "",
        email: brandToEdit.email || "",
        website: brandToEdit.website || "",
        address: brandToEdit.address || "",
        companies: brandToEdit.companies || [],
      });
    } else {
      setFormData({
        name: "",
        code: "",
        logoUrl: "",
        description: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        companies: [],
      });
    }
  }, [brandToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!brandToEdit;
      const url = isEdit ? `/api/brands/${brandToEdit._id || brandToEdit.id}` : "/api/brands";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.error || `Failed to ${isEdit ? "update" : "create"} brand`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error ${brandToEdit ? "updating" : "creating"} brand`);
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {brandToEdit ? "Edit Educational Brand" : "Register New Educational Brand"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apex Elite Coaching"
                required
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand Code (Optional)</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. APEX_PREP (Auto if empty)"
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand Logo URL</label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or blank for custom monogram"
              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brand overview, targets, coaching vertical details..."
              rows={3}
              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 99880 11223"
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="support@brand.com"
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Website Address</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://brand.com"
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="12/A, Corporate Plaza, Connaught Place, New Delhi"
              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Associated Companies</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableCompanies.map((c) => {
                const isSelected = formData.companies.includes(c.name);
                return (
                  <label
                    key={c.id}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => {
                          const newCompanies = checked
                            ? [...prev.companies, c.name]
                            : prev.companies.filter((name) => name !== c.name);
                          return { ...prev, companies: newCompanies };
                        });
                      }}
                    />
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {c.name}
                  </label>
                );
              })}
              {availableCompanies.length === 0 && (
                <div className="text-xs text-slate-400 italic">No companies available to associate.</div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 rounded-xl transition-all"
          >
            {brandToEdit ? "Save Changes" : "Register Brand"}
          </button>
        </div>
      </form>
    </div>
  );
}
