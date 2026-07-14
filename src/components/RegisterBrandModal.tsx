"use client";

import React, { useState } from "react";

interface RegisterBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterBrandModal({ isOpen, onClose }: RegisterBrandModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logoUrl: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  });

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally this would be an API call
    console.log("Submitting:", { ...formData, companies: selectedCompanies });
    onClose();
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
            Register New Educational Brand
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

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Associate Legal Companies * (Allocations will pivot automatically across checked systems)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "comp1", name: "Institue of Creative Studies", target: "₹19,49,999" },
                { id: "comp2", name: "Designers Choice", target: "₹19,50,000" },
                { id: "comp3", name: "Sling Shot Technologies", target: "₹19,50,000" },
                { id: "comp4", name: "Enterprise Test Company", target: "₹5,00,000" },
                { id: "comp5", name: "Enterprise Test Company", target: "₹5,00,000" },
                { id: "comp6", name: "Enterprise Test Company", target: "₹5,00,000" },
              ].map((comp) => (
                <div 
                  key={comp.id}
                  onClick={() => handleCompanyToggle(comp.id)}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                    selectedCompanies.includes(comp.id) 
                      ? "border-indigo-400 bg-indigo-50/30" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    selectedCompanies.includes(comp.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                  }`}>
                    {selectedCompanies.includes(comp.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{comp.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Target: {comp.target}</p>
                  </div>
                </div>
              ))}
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
            Register Brand
          </button>
        </div>
      </form>
    </div>
  );
}
