"use client";

import React, { useState, useRef } from "react";

interface ImportCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportCourseModal({ isOpen, onClose, onSuccess }: ImportCourseModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Resilient CSV parser with quoted field support (handling commas inside quotes)
  const parseCSV = (csvText: string): any[] => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = "";
      } else if (char === '\r' && !insideQuotes) {
        // skip carriage return
      } else {
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    if (lines.length < 2) return [];

    const parseLine = (line: string) => {
      const result: string[] = [];
      let currentVal = "";
      let inside = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inside = !inside;
        } else if (char === ',' && !inside) {
          result.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      result.push(currentVal.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
    
    // Key normalization map
    const normalizeKey = (k: string) => {
      const norm = k.replace(/[^a-z0-9_]/gi, "").toLowerCase();
      if (norm.includes("name") || norm === "course") return "name";
      if (norm.includes("code")) return "code";
      if (norm.includes("brand")) return "brand";
      if (norm.includes("category")) return "category";
      if (norm.includes("duration")) return "duration";
      if (norm.includes("fee") || norm === "price") return "fee";
      if (norm.includes("status")) return "status";
      return k;
    };

    const normalizedHeaders = headers.map(normalizeKey);

    return lines.slice(1).map((line) => {
      const values = parseLine(line);
      const row: any = {};
      normalizedHeaders.forEach((header, index) => {
        let val = values[index] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        row[header] = val;
      });
      // Set default ACTIVE status if none provided
      if (!row.status) {
        row.status = "ACTIVE";
      }
      return row;
    });
  };

  const handleParseText = () => {
    setErrorsList([]);
    setErrorMessage("");
    setSuccessMessage("");
    const trimmed = pastedText.trim();
    
    if (!trimmed) {
      setErrorMessage("Please paste some data to parse.");
      return;
    }

    try {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        // Parse as JSON
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          setPreviewData(parsed);
        } else {
          setErrorMessage("Pasted text is JSON but not a JSON array.");
        }
      } else {
        // Parse as CSV
        const parsed = parseCSV(trimmed);
        if (parsed.length > 0) {
          setPreviewData(parsed);
        } else {
          setErrorMessage("Failed to parse CSV. Make sure you include a headers row.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Parse failed: " + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorsList([]);
    setErrorMessage("");
    setSuccessMessage("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text.trim());
          if (Array.isArray(parsed)) {
            setPreviewData(parsed);
          } else {
            setErrorMessage("File is JSON but does not contain a JSON array.");
          }
        } else {
          // Assume CSV
          const parsed = parseCSV(text.trim());
          if (parsed.length > 0) {
            setPreviewData(parsed);
          } else {
            setErrorMessage("Failed to parse file as CSV. Check headers.");
          }
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage("File parsing failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (previewData.length === 0) {
      setErrorMessage("No parsed data available for import.");
      return;
    }

    setIsSubmitting(true);
    setErrorsList([]);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/courses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSuccessMessage(resData.message);
        setPreviewData([]);
        setPastedText("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Wait briefly for success display then trigger reload
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setErrorMessage(resData.message || "Bulk import failed.");
        if (resData.errors && Array.isArray(resData.errors)) {
          setErrorsList(resData.errors);
        }
      }
    } catch (err) {
      console.error("Error submitting bulk import:", err);
      setErrorMessage("Server communication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearImport = () => {
    setPreviewData([]);
    setPastedText("");
    setErrorsList([]);
    setSuccessMessage("");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            Bulk Import Course Catalog
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs Selection */}
        {previewData.length === 0 && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 shrink-0">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "file" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Upload File (.csv, .json)
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "paste" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Paste Raw Data Text
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Notifications */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {errorMessage}
            </div>
          )}

          {errorsList.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-4 rounded-xl space-y-1.5 max-h-[150px] overflow-y-auto">
              <p className="font-bold text-xs text-amber-900">Import Log & Warnings:</p>
              <ul className="list-disc pl-4 space-y-1 font-mono">
                {errorsList.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Import Setup Stage */}
          {previewData.length === 0 && (
            <div className="space-y-4">
              {activeTab === "file" ? (
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors bg-slate-50/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">Choose a CSV or JSON file to upload</p>
                    <p className="text-[10px] text-slate-400 mt-1">Headers should include: name, code, brand, category, duration, fee</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Paste CSV rows (with headers) or a JSON Array
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPastedText(
                          `name,code,brand,category,duration,fee,status\nRevit Architecture,CM-CAD-09,Cadd Mantra,Design,40 Hours,"₹ 15,000.00",ACTIVE\nSolidWorks,CM-CAD-10,Cadd Mantra,Technology,80 Hours,"₹ 22,000.00",ACTIVE`
                        )
                      }
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wider"
                    >
                      Insert CSV Example Template
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder='Pasted format example:\nname,code,brand,category,duration,fee,status\nRevit,CM-CAD-09,Cadd Mantra,Design,40 Hours,"₹ 15,000.00",ACTIVE'
                    className="w-full text-xs font-semibold font-mono text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"
                  ></textarea>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParseText}
                      className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition-colors"
                    >
                      Parse and Preview Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Preview Stage */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  Parsed Preview Catalog
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    {previewData.length} records parsed
                  </span>
                </span>
                <button
                  onClick={clearImport}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-all"
                >
                  Clear Data / Reset
                </button>
              </div>

              {/* Preview Table Container */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Row</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">Brand</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">Fee</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {previewData.map((row, index) => {
                      const hasMissingFields = !row.name || !row.code || !row.brand || !row.category || !row.duration || !row.fee;
                      return (
                        <tr
                          key={index}
                          className={`hover:bg-slate-50/40 transition-colors ${
                            hasMissingFields ? "bg-rose-50/50 hover:bg-rose-50" : ""
                          }`}
                        >
                          <td className="py-2 px-4 text-slate-400 font-bold">{index + 1}</td>
                          <td className="py-2 px-4 text-slate-800 font-bold">
                            {row.name || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Name</span>}
                          </td>
                          <td className="py-2 px-4 font-mono text-[10px]">
                            {row.code || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Code</span>}
                          </td>
                          <td className="py-2 px-4">
                            {row.brand || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Brand</span>}
                          </td>
                          <td className="py-2 px-4">
                            {row.category || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Category</span>}
                          </td>
                          <td className="py-2 px-4 text-slate-500">
                            {row.duration || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Duration</span>}
                          </td>
                          <td className="py-2 px-4 text-slate-800 font-bold">
                            {row.fee || <span className="text-rose-500 font-bold uppercase text-[9px]">Missing Fee</span>}
                          </td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block text-[9px] font-bold border rounded-md px-1.5 py-0.2 select-none uppercase ${
                                String(row.status).toUpperCase() === "INACTIVE"
                                  ? "bg-slate-50 text-slate-500 border-slate-200"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                              }`}
                            >
                              {row.status || "ACTIVE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {previewData.length > 0 && (
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Importing..." : "Import Courses"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
