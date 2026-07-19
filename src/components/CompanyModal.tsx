"use client";

import React, { useState, useEffect } from "react";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: any; // null for add mode, company object for edit mode
  onSuccess: () => void;
}

export default function CompanyModal({
  isOpen,
  onClose,
  company,
  onSuccess,
}: CompanyModalProps) {
  const isEditMode = Boolean(company);

  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    gst: "",
    pan: "",
    bank: "Bank Of India",
    annualCapacityCap: 1949999,
    address: "No listed street, No City, No State, PIN",
    brands: [] as string[],
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.brands) {
          setAvailableBrands(d.brands.map((b: any) => ({ id: b._id, name: b.name })));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        legalName: company.legalName || company.name || "",
        gst: company.gst || "Not Provided",
        pan: company.pan || "Not Provided",
        bank: company.bank || "Bank Of India",
        annualCapacityCap: company.capNum ?? 1949999,
        address: company.address || "No listed street, No City, No State, PIN",
        brands: company.brands || (company.brand ? [company.brand] : []),
      });
    } else {
      setFormData({
        name: "",
        legalName: "",
        gst: "Not Provided",
        pan: "Not Provided",
        bank: "Bank Of India",
        annualCapacityCap: 1949999,
        address: "No listed street, No City, No State, PIN",
        brands: [],
      });
    }
  }, [company, isOpen]);

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
      const url = isEditMode ? `/api/companies/${company.mongoId || company.id}` : "/api/companies";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save company entity.");
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
        
        {/* Header */}
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
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18"
                />
              </svg>
              {isEditMode ? "Edit Legal Entity" : "Register New Legal Entity"}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isEditMode
                ? `Update compliance parameters, bank settlement, and cap limits for ${company?.name}.`
                : "Configure legal company entity, GST/PAN credentials, and annual cap allocation."}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Company Display Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Institue of Creative Studies"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Legal Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Official Legal Name
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. Institue of Creative Studies Pvt Ltd"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* GST & PAN Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                GST Registration No.
              </label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                placeholder="Not Provided"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                PAN Card No.
              </label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="Not Provided"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Settlement Bank & Annual Capacity Cap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Settlement Bank
              </label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                placeholder="e.g. Bank Of India"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Annual Capacity Cap (₹)
              </label>
              <input
                type="number"
                name="annualCapacityCap"
                value={formData.annualCapacityCap}
                onChange={handleChange}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Registered Address */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Registered Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="No listed street, No City, No State, PIN"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Associated Brands */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Associated Brand Catalog
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableBrands.map((b) => {
                const isSelected = formData.brands.includes(b.name);
                return (
                  <label
                    key={b.id}
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
                          const newBrands = checked
                            ? [...prev.brands, b.name]
                            : prev.brands.filter((name) => name !== b.name);
                          return { ...prev, brands: newBrands };
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
                    {b.name}
                  </label>
                );
              })}
              {availableBrands.length === 0 && (
                <div className="text-xs text-slate-400 italic">No brands available to associate.</div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
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
              {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Register Entity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
