"use client";

import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportLeadsModal({ isOpen, onClose, onSuccess }: ImportLeadsModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Key normalization map for Leads
  const normalizeKey = (k: string) => {
    const norm = k.replace(/[^a-z0-9_]/gi, "").toLowerCase();
    if (norm.includes("parentmobile") || norm.includes("parentscontact") || norm.includes("parentsphone")) return "parentMobile";
    if (norm.includes("parentname") || norm.includes("parentsname")) return "parentName";
    if (norm.includes("parentmobile") || norm.includes("parentscontact") || norm.includes("parentsphone")) return "parentMobile";
    if (norm.includes("parentname") || norm.includes("parentsname")) return "parentName";
    if (norm.includes("mobile") || norm.includes("phone")) return "mobile";
    if (norm.includes("email")) return "email";
    if (norm.includes("city")) return "city";
    if (norm.includes("course")) return "course";
    if (norm.includes("brand")) return "brand";
    if (norm.includes("source")) return "leadSource";
    if (norm.includes("priority")) return "priority";
    if (norm.includes("fee")) return "expectedFee";
    if (norm.includes("remark") || norm.includes("comment")) return "remarks";
    if (norm.includes("name")) return "name";
    return k;
  };

  // Resilient CSV parser with quoted field support
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
      return row;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setPreviewData([]);

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            setErrorMessage("No worksheet found in the Excel file.");
            return;
          }

          const data: any[] = [];
          let headers: string[] = [];

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              headers = (row.values as any[]).map(val => val ? String(val).trim().toLowerCase() : "");
            } else {
              const rowData: any = {};
              (row.values as any[]).forEach((val, idx) => {
                if (idx > 0 && headers[idx]) {
                  let strVal = val !== undefined && val !== null ? String(val).trim() : "";
                  if (typeof val === 'object' && val !== null) {
                    if ((val as any).result !== undefined) strVal = String((val as any).result);
                    else if ((val as any).text !== undefined) strVal = String((val as any).text);
                  }
                  rowData[normalizeKey(headers[idx])] = strVal;
                }
              });
              data.push(rowData);
            }
          });

          if (data.length > 0) {
            setPreviewData(data);
          } else {
            setErrorMessage("No valid data found in the Excel file.");
          }
        } catch (err: any) {
          console.error(err);
          setErrorMessage("Excel parsing failed: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/enquiries/bulk", {
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
          onClose();
        }, 1500);
      } else {
        setErrorMessage(resData.message || "Bulk import failed.");
      }
    } catch (err: any) {
      console.error("Error submitting bulk import:", err);
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Bulk Import CRM Leads</h2>
              <p className="text-xs text-slate-500 font-medium">Upload via CSV or Paste Data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mt-0.5 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">
              Upload a structured CSV file containing contact records. Supported headers are:
            </p>
            <div className="flex flex-wrap gap-1">
              {['Name', 'Mobile', 'ParentName', 'ParentContact', 'Email', 'City', 'Course', 'Brand', 'LeadSource', 'Priority', 'ExpectedFee', 'Remarks'].map(h => (
                <span key={h} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded-md border border-slate-200">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-8 transition-colors flex flex-col items-center justify-center relative group">
            <input 
              type="file" 
              accept=".csv,.json,.xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-indigo-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Drag & Drop or Click to browse</h3>
            <p className="text-sm text-slate-500">Accepts CSV and Excel (.xlsx) files</p>
          </div>

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Preview Data ({previewData.length} records)</h3>
                <button 
                  onClick={() => { setPreviewData([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Clear Data
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                        <th className="px-4 py-3 whitespace-nowrap">Name</th>
                        <th className="px-4 py-3 whitespace-nowrap">Mobile</th>
                        <th className="px-4 py-3 whitespace-nowrap">Parent Contact</th>
                        <th className="px-4 py-3 whitespace-nowrap">Course</th>
                        <th className="px-4 py-3 whitespace-nowrap">Brand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {previewData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800">{row.name || <span className="text-slate-300 italic">Empty</span>}</td>
                          <td className="px-4 py-3 text-slate-600">{row.mobile || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.parentMobile || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.course || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.brand || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 5 && (
                  <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-xs text-slate-500 font-medium">
                    Showing 5 of {previewData.length} records
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleImportSubmit}
            disabled={isSubmitting || previewData.length === 0}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              "Confirm Import"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
