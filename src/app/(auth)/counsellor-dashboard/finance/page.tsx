"use client";

import React, { useState, useEffect, useRef } from "react";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import { useUser } from "@/app/component/context/user-context";

interface AdmissionType {
    _id: string;
    admissionId: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    brand: string;
    course: string;
    batch: string;
    duration: string;
    startDate: string;
    academicYear: string;
    admissionDate: string;
    companyAssigned: string;
    courseFee: number;
    scholarshipAmount: number;
    discountAmount: number;
    additionalDiscount: number;
    totalDiscount: number;
    finalFee: number;
    paymentMode: string;
    transactionNo: string;
    amountReceivedToday: number;
    remainingBalance: number;
    hasEmi: boolean;
    numInstallments: number;
    installmentAmount: number;
    counsellor: string;
    customEmiPlan?: { dueDate: string | Date; amount: number }[];
}

export default function CounsellorFeeCollectionPage() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<AdmissionType[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<AdmissionType | null>(null);
    const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
    const [recentAdmissions, setRecentAdmissions] = useState<AdmissionType[]>([]);
    const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);
    const [activeModal, setActiveModal] = useState<"history" | "ledger" | "print" | null>(null);
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

    // Form States
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [amountReceived, setAmountReceived] = useState("");
    const [receivedDate, setReceivedDate] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [remarks, setRemarks] = useState("");
    const [allocateTo, setAllocateTo] = useState("Outstanding");
    const [selectedCompany, setSelectedCompany] = useState("");

    // Particulars distribution checkboxes
    const [payCourseFee, setPayCourseFee] = useState(true);
    const [payOtherCharges, setPayOtherCharges] = useState(false);

    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCustomEmi, setIsCustomEmi] = useState(false);
    const [selectedEmiIndices, setSelectedEmiIndices] = useState<number[]>([]);
    const [autoAllocatedCompany, setAutoAllocatedCompany] = useState("");

    useEffect(() => {
        if (selectedStudent && paymentMode !== "Cash" && !selectedStudent.companyAssigned) {
            fetch(`/api/engine/allocate?brand=${encodeURIComponent(selectedStudent.brand)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setAutoAllocatedCompany(data.company);
                    }
                })
                .catch(err => console.error("Failed to fetch allocated company", err));
        }
    }, [selectedStudent, paymentMode]);

    const [editingEmiIndex, setEditingEmiIndex] = useState<number | null>(null);
    const [editEmiAmount, setEditEmiAmount] = useState<number>(0);
    const [editEmiDate, setEditEmiDate] = useState<string>("");

    const handleEditEmi = (index: number, currentAmount: number, currentDate: Date) => {
        if (!isCustomEmi || index === (selectedStudent?.numInstallments || 4) - 1) return;
        setEditingEmiIndex(index);
        setEditEmiAmount(currentAmount);
        setEditEmiDate(currentDate.toISOString().split("T")[0]);
    };

    const handleEmiCheckbox = (index: number, checked: boolean, dueAmount: number) => {
        const currentAmount = parseFloat(amountReceived || "0");
        if (checked) {
            setSelectedEmiIndices(prev => [...prev, index]);
            setAmountReceived((currentAmount + dueAmount).toString());
        } else {
            setSelectedEmiIndices(prev => prev.filter(i => i !== index));
            setAmountReceived(Math.max(0, currentAmount - dueAmount).toString());
        }
    };

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Set default date
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setReceivedDate(today);
    }, []);

    // Fetch recent admissions when user is loaded
    useEffect(() => {
        if (user) {
            fetchRecentAdmissions();
        }
    }, [user]);

    const fetchRecentAdmissions = async () => {
        try {
            setIsLoadingAdmissions(true);
            const res = await fetch("/api/admissions");
            const data = await res.json();
            if (res.ok && data.success) {
                // Show all admissions for testing/demo purposes
                setRecentAdmissions(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch recent admissions:", err);
        } finally {
            setIsLoadingAdmissions(false);
        }
    };

    // Generate dynamic reference number on student select
    useEffect(() => {
        if (selectedStudent) {
            const randomId = Math.floor(10000 + Math.random() * 90000);
            setReferenceNo(`Ref-2026-${randomId}`);
            setSelectedCompany(selectedStudent.companyAssigned || "Design Gateway Pvt Ltd");
        }
    }, [selectedStudent]);

    // Click outside search dropdown to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Admissions Handler
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        try {
            setIsLoadingSearch(true);
            const res = await fetch(`/api/admissions?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setSearchResults(data.data);
                setShowDropdown(true);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const selectStudent = async (student: AdmissionType) => {
        setSelectedStudent(student);
        setSearchQuery("");
        setShowDropdown(false);
        setAmountReceived("");
        setRemarks("");
        fetchPayments(student._id);
    };

    const fetchPayments = async (admissionId: string) => {
        try {
            const res = await fetch(`/api/payments?admissionId=${admissionId}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setPaymentsHistory(data.data);
            }
        } catch (err) {
            console.error("Failed to load payments history:", err);
        }
    };

    // Live Math calculations
    const totalFees = selectedStudent ? selectedStudent.finalFee : 0;
    const currentDue = selectedStudent ? selectedStudent.remainingBalance : 0;
    const totalPaid = selectedStudent ? totalFees - currentDue : 0;

    const registrationFee = selectedStudent ? Math.min(1000, totalFees) : 0;
    const courseFee = selectedStudent ? Math.max(0, totalFees - registrationFee) : 0;
    const examFee = 0;

    // Distribute payments across categories (Registration -> Course)
    const regPaid = Math.min(registrationFee, totalPaid);
    const coursePaid = totalPaid - regPaid;
    const examPaid = 0;

    // Dues
    const regDue = registrationFee - regPaid;
    const courseDue = courseFee - coursePaid;
    const examDue = 0;

    // Input adjustments
    const inputAmtVal = parseFloat(amountReceived) || 0;
    const newPaidAmount = totalPaid + inputAmtVal;
    const newDueAmount = Math.max(0, currentDue - inputAmtVal);

    // Live allocations
    let allocatedCourse = 0;
    let allocatedOther = 0;

    if (payCourseFee) {
        allocatedCourse = Math.min(courseDue, inputAmtVal);
    }
    const totalAllocated = allocatedCourse + allocatedOther;

    const handleFormReset = () => {
        setAmountReceived("");
        setRemarks("");
        setPaymentMode("Cash");
        setPayCourseFee(true);
        setPayOtherCharges(false);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        if (inputAmtVal <= 0) {
            setErrorMsg("Please enter a valid amount received.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    admissionId: selectedStudent._id,
                    amountReceived: inputAmtVal,
                    paymentMode,
                    referenceNo,
                    remarks,
                    company: selectedCompany,
                    particulars: {
                        courseFeeDue: allocatedCourse,
                        registrationFeeDue: 0,
                        materialFeeDue: 0,
                        examFeeDue: 0,
                    }
                })
            });

            const resData = await res.json();

            if (res.ok && resData.success) {
                setSuccessMsg(resData.message || "Payment processed successfully!");
                // Refresh student record
                const freshRes = await fetch(`/api/admissions?q=${selectedStudent.admissionId}`);
                const freshData = await freshRes.json();
                if (freshRes.ok && freshData.success && freshData.data.length > 0) {
                    setSelectedStudent(freshData.data[0]);
                }
                fetchPayments(selectedStudent._id);
                setAmountReceived("");
                setRemarks("");
                fetchRecentAdmissions();
            } else {
                setErrorMsg(resData.message || "Failed to process payment.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to communicate with backend server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Installment plan calculator
    const generateInstallments = () => {
        if (!selectedStudent) return [];
        const totalInst = selectedStudent.numInstallments || 4;
        
        // Calculate how much of the fee is actually put into EMIs
        const initialPayment = selectedStudent.amountReceivedToday || 0;
        const emiPrincipal = selectedStudent.finalFee - initialPayment;
        
        // Base amount is either from DB or calculated
        const baseAmount = selectedStudent.installmentAmount || Math.floor(emiPrincipal / totalInst);
        
        // Amount paid specifically towards EMIs (total paid minus the downpayment)
        let runningPaid = Math.max(0, totalPaid - initialPayment);
        
        const installments = [];
        const baseDate = new Date(selectedStudent.admissionDate || new Date());
        // Start EMIs 1 month after admission
        baseDate.setMonth(baseDate.getMonth() + 1);

        for (let i = 1; i <= totalInst; i++) {
            let instAmount = i === totalInst
                ? emiPrincipal - baseAmount * (totalInst - 1)
                : baseAmount;

            let dueDate = new Date(baseDate);
            dueDate.setMonth(baseDate.getMonth() + (i - 1));

            if (selectedStudent.customEmiPlan && selectedStudent.customEmiPlan[i - 1]) {
                instAmount = selectedStudent.customEmiPlan[i - 1].amount;
                dueDate = new Date(selectedStudent.customEmiPlan[i - 1].dueDate);
            }

            let status = "Pending";
            let statusClass = "text-slate-400 bg-slate-100 border-slate-200";
            let bulletClass = "bg-slate-200 border-slate-300";
            let dueAmount = instAmount;

            if (runningPaid >= instAmount) {
                status = "Paid";
                statusClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                bulletClass = "bg-emerald-500 border-emerald-600";
                runningPaid -= instAmount;
                dueAmount = 0;
            } else if (runningPaid > 0) {
                status = "Partial";
                statusClass = "text-amber-600 bg-amber-50 border-amber-100";
                bulletClass = "bg-amber-500 border-amber-600";
                dueAmount = instAmount - runningPaid;
                runningPaid = 0;
            }

            const formattedDueDate = dueDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            installments.push({
                num: `${i}${i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"} Installment`,
                amount: instAmount,
                dueAmount,
                dateText: status === "Paid" ? `Paid on ${formattedDueDate}` : `Due on ${formattedDueDate}`,
                rawDate: dueDate,
                status,
                statusClass,
                bulletClass,
            });
        }

        return installments;
    };

    const handleSaveEmiEdit = async () => {
        if (editingEmiIndex === null || !selectedStudent) return;
        
        const currentPlan = generateInstallments();
        const originalAmount = currentPlan[editingEmiIndex].amount;
        const diff = originalAmount - editEmiAmount;
        
        const remainingEmisCount = currentPlan.length - 1 - editingEmiIndex;
        if (remainingEmisCount <= 0) return;
        
        const newCustomPlan = currentPlan.map((inst) => ({
           dueDate: inst.rawDate,
           amount: inst.amount
        }));
        
        newCustomPlan[editingEmiIndex].dueDate = new Date(editEmiDate);
        newCustomPlan[editingEmiIndex].amount = editEmiAmount;
        
        const roundedDiffPerRemaining = Math.round(diff / remainingEmisCount);
        let appliedDiff = 0;
        
        for (let i = editingEmiIndex + 1; i < newCustomPlan.length - 1; i++) {
            newCustomPlan[i].amount += roundedDiffPerRemaining;
            appliedDiff += roundedDiffPerRemaining;
        }
        
        newCustomPlan[newCustomPlan.length - 1].amount += (diff - appliedDiff);
        
        setSelectedStudent(prev => prev ? { ...prev, customEmiPlan: newCustomPlan } : null);
        setEditingEmiIndex(null);
        
        try {
            await fetch("/api/admissions/custom-emi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudent._id, customEmiPlan: newCustomPlan })
            });
        } catch(e) {
            console.error(e);
        }
    };

    const installments = generateInstallments();

    return (
        <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
            {/* Sidebar navigation */}
            <CounsellorSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Top Header & Search Bar */}
                <header className="bg-white border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Fee Collection</h1>
                        <p className="text-[10px] text-slate-400">Collect fees from students and generate receipts</p>
                    </div>

                    {/* Search bar */}
                    <div className="relative w-80" ref={dropdownRef}>
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by name, admission no., mobile..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-semibold"
                        />

                        {/* Dropdown Results */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                {searchResults.map((student) => (
                                    <div
                                        key={student._id}
                                        onClick={() => selectStudent(student)}
                                        className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                                        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-bold">
                                            <span>{student.admissionId}</span>
                                            <span>{student.mobileNumber}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showDropdown && searchResults.length === 0 && !isLoadingSearch && (
                            <div className="absolute left-0 right-0 mt-2 p-4 text-center bg-white border border-slate-200 rounded-xl text-[10px] text-slate-400 font-bold shadow-xl">
                                No matching admissions found
                            </div>
                        )}
                    </div>
                </header>

                {/* Dashboard Panels */}
                <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                    {selectedStudent ? (
                        <>
                            {/* Column 1 & 2: Left Section */}
                            <div className="lg:col-span-2 space-y-6">
                                {successMsg && (
                                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500 shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        {successMsg}
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-500 shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Selected Student Details Card */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xl shadow-inner shrink-0 select-none">
                                            {selectedStudent.fullName.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-bold text-slate-800">{selectedStudent.fullName}</h2>
                                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                                                    Active
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-semibold font-mono">Admission No.: {selectedStudent.admissionId}</p>
                                            <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium">
                                                <span className="flex items-center gap-1">📞 {selectedStudent.mobileNumber}</span>
                                                <span className="flex items-center gap-1">✉️ {selectedStudent.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider line for MD screen */}
                                    <div className="hidden md:block w-px bg-slate-100 self-stretch my-1"></div>

                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs font-semibold text-slate-700">
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Course</span>
                                            <span className="text-slate-800">{selectedStudent.course}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Batch</span>
                                            <span className="text-slate-800">{selectedStudent.batch}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brand</span>
                                            <span className="text-slate-800">{selectedStudent.brand}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Company</span>
                                            <span className="text-slate-800">{selectedStudent.companyAssigned}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admission Date</span>
                                            <span className="text-slate-800">
                                                {new Date(selectedStudent.admissionDate).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Counsellor</span>
                                            <span className="text-slate-800">{selectedStudent.counsellor}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 1. Fee Details Table */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] select-none">1</span>
                                            Fee Details
                                        </h3>
                                        <button
                                            onClick={() => setActiveModal("ledger")}
                                            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-500 border border-indigo-100 hover:bg-indigo-50 bg-white px-3 py-1.5 rounded-xl transition-all"
                                        >
                                            View Fee Ledger
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse font-semibold">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <th className="py-2 pb-3">Particulars</th>
                                                    <th className="py-2 pb-3 text-right">Total (₹)</th>
                                                    <th className="py-2 pb-3 text-right">Paid (₹)</th>
                                                    <th className="py-2 pb-3 text-right">Due (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 text-slate-600">
                                                <tr>
                                                    <td className="py-2.5 text-slate-800">Course Fee</td>
                                                    <td className="py-2.5 text-right">{courseFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-slate-500">{coursePaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-rose-500">{courseDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2.5 text-slate-800">Registration Fee</td>
                                                    <td className="py-2.5 text-right">{registrationFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-slate-500">{regPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-rose-500">{regDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>

                                                <tr>
                                                    <td className="py-2.5 text-slate-800">Exam Fee</td>
                                                    <td className="py-2.5 text-right">{examFee.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-slate-500">{examPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-2.5 text-right text-rose-500">{examDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                                <tr className="font-extrabold text-slate-800 bg-slate-50/50">
                                                    <td className="py-3 px-2 rounded-l-xl">Total</td>
                                                    <td className="py-3 text-right text-indigo-600">{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 text-right text-emerald-600">{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="py-3 text-right text-rose-600 rounded-r-xl">{currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 2. Collect Payment Form */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] select-none">2</span>
                                            Collect Payment
                                        </h3>
                                    </div>

                                    <form onSubmit={handlePaymentSubmit} className="space-y-5 text-xs font-bold text-slate-600">
                                        {/* Payment Mode Selector */}
                                        <div className="space-y-2">
                                            <label className="block text-[9px] uppercase tracking-widest text-slate-400">Payment Mode *</label>
                                            <div className="flex flex-wrap gap-2">
                                                {["Cash", "UPI", "Card", "Net Banking", "Cheque", "DD", "Wallet", "Other"].map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => setPaymentMode(mode)}
                                                        className={`px-4 py-2 border rounded-xl flex items-center gap-1.5 transition-all ${paymentMode === mode
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                                                            }`}
                                                    >
                                                        <span>
                                                            {mode === "Cash" ? "💵" : mode === "UPI" ? "📱" : mode === "Card" ? "💳" : "💼"}
                                                        </span>
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Amount Received */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Amount Received *</label>
                                                <input
                                                    type="number"
                                                    value={amountReceived}
                                                    onChange={(e) => setAmountReceived(e.target.value)}
                                                    placeholder="e.g. 10000"
                                                    required
                                                    max={currentDue}
                                                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                                />
                                            </div>

                                            {/* Received Date */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Received Date *</label>
                                                <input
                                                    type="date"
                                                    value={receivedDate}
                                                    onChange={(e) => setReceivedDate(e.target.value)}
                                                    required
                                                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                                />
                                            </div>

                                            {/* Reference No */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Reference No.</label>
                                                <input
                                                    type="text"
                                                    value={referenceNo}
                                                    onChange={(e) => setReferenceNo(e.target.value)}
                                                    placeholder="e.g. Ref-2026-00056"
                                                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Remarks */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Remarks (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    placeholder="Enter remarks (optional)"
                                                    className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                                />
                                            </div>

                                            {/* Allocate To */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Allocate To</label>
                                                <div className="flex items-center gap-4 py-2 text-xs font-semibold">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="allocateTo"
                                                            checked={allocateTo === "Outstanding"}
                                                            onChange={() => setAllocateTo("Outstanding")}
                                                            className="text-indigo-600 focus:ring-indigo-500/50"
                                                        />
                                                        Outstanding (Oldest First)
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="allocateTo"
                                                            checked={allocateTo === "Specific"}
                                                            onChange={() => setAllocateTo("Specific")}
                                                            className="text-indigo-600 focus:ring-indigo-500/50"
                                                        />
                                                        Specific Installment
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Target Company Allocation */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Company Allocation</label>
                                                <div className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-not-allowed flex items-center justify-between">
                                                    <span>
                                                        {paymentMode === "Cash"
                                                            ? "Cash (Unallocated)"
                                                            : selectedStudent?.companyAssigned
                                                                ? selectedStudent.companyAssigned
                                                                : (autoAllocatedCompany || "Allocating...")}
                                                    </span>
                                                    {paymentMode !== "Cash" && !selectedStudent?.companyAssigned && autoAllocatedCompany && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500 shrink-0">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>

                                            {/* For Particulars checkboxes */}
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">For Particulars</label>
                                                <div className="space-y-1.5 py-1 text-xs">
                                                    <label className="flex items-center justify-between cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={payCourseFee}
                                                                onChange={(e) => setPayCourseFee(e.target.checked)}
                                                                className="text-indigo-600 focus:ring-indigo-500/50 rounded-sm"
                                                            />
                                                            Course Fee Due
                                                        </span>
                                                        <span className="text-slate-500">₹{courseDue.toLocaleString("en-IN")}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Allocation Live display */}
                                        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex justify-between text-center">
                                            <div>
                                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Received</span>
                                                <span className="text-sm font-extrabold text-slate-800">₹{inputAmtVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Allocated</span>
                                                <span className="text-sm font-extrabold text-indigo-600">₹{totalAllocated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remaining Balance</span>
                                                <span className="text-sm font-extrabold text-rose-500">₹{newDueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>

                                        {/* Form Controls */}
                                        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 shrink-0">
                                            <button
                                                type="button"
                                                onClick={handleFormReset}
                                                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleFormReset}
                                                disabled={isSubmitting}
                                                className="px-5 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                Save & Print Receipt
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 rounded-xl transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? "Processing..." : "Collect Fee & Generate Receipt"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Column 3: Right Section */}
                            <div className="space-y-6">
                                {/* Payment Summary */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                                    <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                                        💵 Payment Summary
                                    </h3>
                                    <div className="space-y-2.5 text-xs font-bold">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Total Fees</span>
                                            <span>₹{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-600">
                                            <span>Total Paid</span>
                                            <span>₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-rose-500 border-b border-slate-100 pb-3">
                                            <span>Total Due</span>
                                            <span>₹{currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        <div className="pt-1.5 space-y-2">
                                            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Today's Collection</span>
                                            <div className="flex justify-between items-center text-emerald-600">
                                                <span>New Paid Amount</span>
                                                <span>+ ₹{inputAmtVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-rose-500">
                                                <span>New Due Amount</span>
                                                <span>₹{newDueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Installment Plan */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                                            📅 Installment Plan
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Customize EMI</span>
                                            <button 
                                                onClick={() => {
                                                    setIsCustomEmi(!isCustomEmi);
                                                    if (isCustomEmi) setSelectedEmiIndices([]); // clear selection if toggled off
                                                }}
                                                className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isCustomEmi ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isCustomEmi ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stepper list */}
                                    <div className="relative pl-6 space-y-5">
                                        {/* Stepper vertical line background */}
                                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                                        {installments.map((inst, index) => (
                                            <div key={index} className="relative flex justify-between items-start text-xs font-bold">
                                                {/* Stepper node bullet */}
                                                <div className={`absolute -left-5.5 mt-1 h-2.5 w-2.5 rounded-full border-2 border-white ${inst.bulletClass}`}></div>

                                                <div 
                                                    className={`space-y-0.5 pr-2 ${isCustomEmi && index !== (selectedStudent?.numInstallments || 4) - 1 && inst.status !== 'Paid' ? 'cursor-pointer hover:bg-slate-50 p-1 -m-1 rounded border border-dashed border-slate-300' : ''}`}
                                                    onClick={() => {
                                                        if (inst.status !== 'Paid') {
                                                            handleEditEmi(index, inst.amount, inst.rawDate);
                                                        }
                                                    }}
                                                >
                                                    <span className="block text-slate-800 leading-none">{inst.num} {isCustomEmi && index !== (selectedStudent?.numInstallments || 4) - 1 && inst.status !== 'Paid' && '✏️'}</span>
                                                    <span className="block text-[9px] text-slate-400 font-semibold leading-none">{inst.dateText}</span>
                                                </div>

                                                <div className="flex-1"></div>

                                                <div className="text-right space-y-1 pr-2">
                                                    <span className="block text-slate-700 leading-none">₹{inst.amount.toLocaleString("en-IN")}</span>
                                                    <span className={`inline-block text-[8px] font-extrabold border rounded-md px-1.5 py-0.2 uppercase leading-none ${selectedEmiIndices.includes(index) ? "text-emerald-600 bg-emerald-50 border-emerald-100" : inst.statusClass}`}>
                                                        {selectedEmiIndices.includes(index) ? "Paid" : inst.status}
                                                    </span>
                                                </div>
                                                
                                                {inst.status !== "Paid" && (
                                                    <div className="flex items-center h-full pt-1">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedEmiIndices.includes(index)}
                                                            onChange={(e) => handleEmiCheckbox(index, e.target.checked, inst.dueAmount)}
                                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                    <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                                        ⚡ Quick Actions
                                    </h3>
                                    <div className="space-y-2 font-bold text-xs">
                                        <button
                                            onClick={() => setActiveModal("history")}
                                            className="w-full flex items-center justify-between p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all"
                                        >
                                            View Receipt History
                                            <span className="text-[10px] text-slate-400 font-mono">➜</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveModal("ledger")}
                                            className="w-full flex items-center justify-between p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all"
                                        >
                                            View Fee Ledger
                                            <span className="text-[10px] text-slate-400 font-mono">➜</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (paymentsHistory && paymentsHistory.length > 0) {
                                                    setSelectedReceipt(paymentsHistory[0]);
                                                    setActiveModal("print");
                                                } else {
                                                    alert("No payment receipt available to print.");
                                                }
                                            }}
                                            className="w-full flex items-center justify-between p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all"
                                        >
                                            Print Receipt
                                            <span className="text-[10px] text-slate-400 font-mono">➜</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state (when no student selected) */
                        <div className="lg:col-span-3 space-y-6">
                            {/* Header inside empty state */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-3 shadow-sm">
                                <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner mx-auto font-extrabold text-xl select-none">
                                    ₹
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-sm font-extrabold text-slate-800">Select a student account to collect fee</h3>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Search for a student's name, admission number, or phone number in the top header, or select from the list of recent admissions below.
                                    </p>
                                </div>
                            </div>

                            {/* Recent Admissions list */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recent Admissions</h3>

                                {isLoadingAdmissions ? (
                                    <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                                        Loading admissions list...
                                    </div>
                                ) : recentAdmissions.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recentAdmissions.map((student) => (
                                            <div
                                                key={student._id}
                                                onClick={() => selectStudent(student)}
                                                className="bg-white border border-slate-200 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-600/5 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-4 group"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md px-1.5 py-0.5 uppercase font-mono">
                                                            {student.admissionId || "No ID"}
                                                        </span>
                                                        <span className={`text-[9px] font-bold border rounded-md px-1.5 py-0.5 uppercase tracking-wide ${student.remainingBalance > 0
                                                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            }`}>
                                                            {student.remainingBalance > 0 ? "Due Balance" : "Fully Paid"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                            {student.fullName}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 font-semibold">{student.course} ({student.batch})</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-bold">
                                                    <div>
                                                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Remaining Due</span>
                                                        <span className={student.remainingBalance > 0 ? "text-rose-500" : "text-emerald-600"}>
                                                            ₹{student.remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-indigo-600 group-hover:translate-x-1 transition-transform">
                                                        Select ➜
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-400 font-bold">
                                        No recent admissions records found. Please create admissions in the Admission module first.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay wrapper */}
            {activeModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
                    {/* Receipt History Modal */}
                    {activeModal === "history" && (
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                    📋 Receipt History — {selectedStudent.fullName}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                {paymentsHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs font-semibold">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="py-2">Receipt No</th>
                                                    <th className="py-2">Date</th>
                                                    <th className="py-2">Mode</th>
                                                    <th className="py-2 text-right">Amount (₹)</th>
                                                    <th className="py-2 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 text-slate-600">
                                                {paymentsHistory.map((receipt) => (
                                                    <tr key={receipt._id}>
                                                        <td className="py-3 font-mono font-bold text-indigo-600">{receipt.receiptNo}</td>
                                                        <td className="py-3">
                                                            {new Date(receipt.paymentDate || receipt.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </td>
                                                        <td className="py-3">{receipt.paymentMode}</td>
                                                        <td className="py-3 text-right font-bold text-slate-800">
                                                            ₹{receipt.amountReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReceipt(receipt);
                                                                    setActiveModal("print");
                                                                }}
                                                                className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                                                            >
                                                                Print
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 font-bold">No receipt history recorded.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fee Ledger Modal */}
                    {activeModal === "ledger" && (
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                    📒 Student Fee Ledger — {selectedStudent.fullName}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Fees</span>
                                        <span className="text-sm font-extrabold text-slate-800">₹{selectedStudent.finalFee.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</span>
                                        <span className="text-sm font-extrabold text-emerald-600">₹{(selectedStudent.finalFee - selectedStudent.remainingBalance).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Outstanding Due</span>
                                        <span className="text-sm font-extrabold text-rose-500">₹{selectedStudent.remainingBalance.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Transaction History</h4>
                                    <div className="relative pl-6 space-y-4 border-l border-slate-105">
                                        {/* Course Admission generated */}
                                        <div className="relative">
                                            <div className="absolute -left-[29px] mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500"></div>
                                            <div className="flex justify-between items-start text-xs font-bold">
                                                <div>
                                                    <span className="block text-slate-800">Course Admission generated</span>
                                                    <span className="block text-[9px] text-slate-400 font-semibold">
                                                        {new Date(selectedStudent.admissionDate).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric"
                                                        })}
                                                    </span>
                                                </div>
                                                <span className="text-rose-500">+ ₹{selectedStudent.finalFee.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>

                                        {/* Payment Receipts timeline */}
                                        {paymentsHistory.map((receipt, index) => (
                                            <div key={receipt._id || index} className="relative">
                                                <div className="absolute -left-[29px] mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></div>
                                                <div className="flex justify-between items-start text-xs font-bold">
                                                    <div>
                                                        <span className="block text-slate-800">Payment Received ({receipt.receiptNo})</span>
                                                        <span className="block text-[9px] text-slate-400 font-semibold">
                                                            {new Date(receipt.paymentDate || receipt.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric", month: "short", year: "numeric"
                                                            })} via {receipt.paymentMode}
                                                        </span>
                                                    </div>
                                                    <span className="text-emerald-600">- ₹{receipt.amountReceived.toLocaleString("en-IN")}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Print Receipt Modal */}
                    {activeModal === "print" && selectedReceipt && (
                        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                    🖨️ Receipt Details
                                </h3>
                                <button onClick={() => {
                                    setSelectedReceipt(null);
                                    setActiveModal(null);
                                }} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1" id="printable-receipt">
                                <div className="border border-slate-200/80 rounded-2xl p-6 space-y-6 text-xs text-slate-700 bg-white font-semibold">
                                    <div className="text-center border-b border-slate-100 pb-4">
                                        <h2 className="text-lg font-black text-indigo-600 tracking-tight uppercase">{selectedStudent.brand || "CADD Mantra"}</h2>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Official Fee Receipt</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                                        <div className="space-y-1">
                                            <p><span className="text-slate-400">Receipt No:</span> <span className="font-mono font-bold text-slate-800">{selectedReceipt.receiptNo}</span></p>
                                            <p><span className="text-slate-400">Student Name:</span> <span className="text-slate-800">{selectedStudent.fullName}</span></p>
                                            <p><span className="text-slate-400">Admission No:</span> <span className="text-slate-800 font-mono">{selectedStudent.admissionId}</span></p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p>
                                                <span className="text-slate-400">Receipt Date:</span>{" "}
                                                <span className="text-slate-800">
                                                    {new Date(selectedReceipt.paymentDate || selectedReceipt.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </span>
                                            </p>
                                            <p><span className="text-slate-400">Course:</span> <span className="text-slate-800">{selectedStudent.course}</span></p>
                                            <p><span className="text-slate-400">Batch:</span> <span className="text-slate-800">{selectedStudent.batch}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Transaction Breakup</h4>
                                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-xs font-semibold">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                                        <th className="p-3">Particulars</th>
                                                        <th className="p-3 text-right">Paid Amount (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {selectedReceipt.particulars?.courseFeeDue > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-800">Course Fee Allocation</td>
                                                            <td className="p-3 text-right font-bold">₹{selectedReceipt.particulars.courseFeeDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    )}
                                                    {selectedReceipt.particulars?.registrationFeeDue > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-800">Registration Fee Allocation</td>
                                                            <td className="p-3 text-right font-bold">₹{selectedReceipt.particulars.registrationFeeDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    )}
                                                    {!(selectedReceipt.particulars?.courseFeeDue > 0) && !(selectedReceipt.particulars?.registrationFeeDue > 0) && (
                                                        <tr>
                                                            <td className="p-3 text-slate-800">General Fee Payment</td>
                                                            <td className="p-3 text-right font-bold">₹{selectedReceipt.amountReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    )}
                                                    <tr className="bg-slate-50/50 font-extrabold text-slate-800">
                                                        <td className="p-3">Total Amount Received</td>
                                                        <td className="p-3 text-right text-indigo-600">₹{selectedReceipt.amountReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center text-[10px] font-bold">
                                        <div>
                                            <span className="block text-slate-400 uppercase">Payment Mode</span>
                                            <span className="text-slate-800 text-xs">{selectedReceipt.paymentMode}</span>
                                        </div>
                                        {selectedReceipt.referenceNo && (
                                            <div className="text-right">
                                                <span className="block text-slate-400 uppercase">Reference / TXN No</span>
                                                <span className="text-slate-800 text-xs font-mono">{selectedReceipt.referenceNo}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 flex justify-between items-end">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] text-slate-400 uppercase">Company Assigned</p>
                                            <p className="text-slate-800 font-bold">{selectedReceipt.company || selectedStudent.companyAssigned || "Design Gateway Pvt Ltd"}</p>
                                        </div>
                                        <div className="border-t border-slate-200 pt-1 px-8 text-center text-slate-400 text-[10px] font-bold">
                                            Authorized Signature
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                                <button
                                    onClick={() => {
                                        setSelectedReceipt(null);
                                        setActiveModal(null);
                                    }}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.617 0-1.11-.476-1.12-1.09l-.23-2.524m11.78 0H5.877m12.002-9.07c.052-.314.231-.59.504-.747m0 0l.852-.49a1.125 1.125 0 011.5 1.5l-.49.852m0 0a1.123 1.123 0 01-.747.504m0 0a40.06 40.06 0 00-11.782 0M18.84 8.18a1.124 1.124 0 00-.747-.504m0 0l-.852-.49a1.125 1.125 0 00-1.5 1.5l.49.852m0 0c.157.272.433.451.747.504m0 0a40.063 40.063 0 0011.782 0M6.16 8.18c.314-.052.59-.23.747-.504l.49-.852a1.125 1.125 0 00-1.5-1.5l-.852.49a1.123 1.123 0 00-.504.747m0 0A39.917 39.917 0 006 13.5m12-5.32c-.052-.314-.231-.59-.504-.747l-.852-.49a1.125 1.125 0 00-1.5 1.5l.49.852c.157.272.433.451.747.504z" />
                                    </svg>
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Edit EMI Modal */}
            {editingEmiIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-extrabold text-slate-800 text-sm">Customize Installment {editingEmiIndex + 1}</h3>
                            <button onClick={() => setEditingEmiIndex(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                                <input 
                                    type="date" 
                                    value={editEmiDate}
                                    onChange={(e) => setEditEmiDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={editEmiAmount}
                                    onChange={(e) => setEditEmiAmount(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] p-3 rounded-xl leading-relaxed">
                                <strong>Note:</strong> Any changes to this amount will automatically adjust the remaining EMIs to keep the total fee balanced.
                            </div>
                        </div>
                        
                        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                            <button
                                onClick={() => setEditingEmiIndex(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEmiEdit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                            >
                                Apply & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === "print" && (
                <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible !important;
            }
            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
            )}
        </div>
    );
}