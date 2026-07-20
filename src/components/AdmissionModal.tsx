"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess?: () => void;
}

export default function AdmissionModal({ isOpen, onClose, lead, onSuccess }: AdmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  // 1. Student Information
  const [fullName, setFullName] = useState(lead?.studentFullName || "");
  const [mobileNumber, setMobileNumber] = useState(lead?.primaryPhoneMobile || "");
  const [email, setEmail] = useState(lead?.emailAddress || "");
  const [parentName, setParentName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(lead?.currentCity || "");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [counsellor, setCounsellor] = useState(lead?.assignedCrmAdvisor || "");
  const [brand, setBrand] = useState(lead?.targetBrand || "");

  // 2. Course Details
  const [course, setCourse] = useState(lead?.targetCourse || "");
  const [batch, setBatch] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + " - " + (new Date().getFullYear() + 1).toString().slice(2));
  const [courseFee, setCourseFee] = useState(Math.floor(Number(lead?.expectedCourseFee?.replace(/[^0-9.]/g, ''))) || 0);
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [companyAssigned, setCompanyAssigned] = useState("");

  // 3. Discount & Scholarship
  const [scholarshipType, setScholarshipType] = useState("None");
  const [scholarshipAmount, setScholarshipAmount] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");

  // Calculated Fees
  const totalDiscount = scholarshipAmount + discountAmount + additionalDiscount;
  const finalFee = courseFee - totalDiscount;

  // 4. Payment & EMI
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [transactionNo, setTransactionNo] = useState("");
  const [amountReceivedToday, setAmountReceivedToday] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  
  const remainingBalance = finalFee - amountReceivedToday;

  const [hasEmi, setHasEmi] = useState(false);
  const [numInstallments, setNumInstallments] = useState(1);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [firstDueDate, setFirstDueDate] = useState("");
  const [autoAllocatedCompany, setAutoAllocatedCompany] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (paymentMode === "Cash") {
        setAutoAllocatedCompany("Cash (Unallocated)");
        setCompanyAssigned("Unallocated");
      } else {
        fetch(`/api/engine/allocate?brand=${encodeURIComponent(brand || "")}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.company) {
              setAutoAllocatedCompany(data.company);
              setCompanyAssigned(data.company);
            }
          })
          .catch(err => console.error("Failed to fetch allocated company", err));
      }
    }
  }, [isOpen, paymentMode, brand]);

  useEffect(() => {
    if (hasEmi && numInstallments > 0) {
      setInstallmentAmount(Math.round(remainingBalance / numInstallments));
    }
  }, [remainingBalance, numInstallments, hasEmi]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/courses")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCourses(data.data);
          }
        })
        .catch((err) => console.error("Failed to fetch courses:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && lead) {
      setFullName(lead.studentFullName || "");
      setMobileNumber(lead.primaryPhoneMobile || "");
      setEmail(lead.emailAddress || "");
      setCounsellor(lead.assignedCrmAdvisor || "");
      setBrand(lead.targetBrand || "");
      setCourse(lead.targetCourse || "");
      setCourseFee(Math.floor(Number(lead.expectedCourseFee?.replace(/[^0-9.]/g, ''))) || 0);
      
      setParentName("");
      setAddress("");
      setCity(lead.currentCity || "");
      setState("");
      setPincode("");
      setDob("");
      setGender("");
      setBatch("");
      setDuration("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setCompanyAssigned("");
      setScholarshipType("None");
      setScholarshipAmount(0);
      setDiscountType("None");
      setDiscountAmount(0);
      setAdditionalDiscount(0);
      setDiscountReason("");
      setPaymentMode("UPI");
      setTransactionNo("");
      setAmountReceivedToday(0);
      setHasEmi(false);
      setNumInstallments(1);
      setInstallmentAmount(0);
      setFirstDueDate("");
    }
  }, [lead, isOpen]);

  const handleGenerateAdmission = async () => {
    if (!fullName || !mobileNumber || !city || !state || !pincode || !counsellor || 
        !course || !batch || !duration || !startDate || !academicYear || !admissionDate || !companyAssigned) {
      alert("Please fill in all required fields (Full Name, Mobile, City, State, Pincode, Counsellor, Course, Batch, Duration, Start Date, Academic Year, Admission Date, and Company Assigned).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        enquiryId: lead?._id,
        fullName, mobileNumber, email, address, city, state, pincode, dob, gender, counsellor, brand,
        course, batch, duration, startDate, academicYear, admissionDate, companyAssigned,
        courseFee, scholarshipType, scholarshipAmount, discountType, discountAmount, additionalDiscount, totalDiscount, finalFee,
        paymentMode, transactionNo, amountReceivedToday, paymentDate, remainingBalance, hasEmi, numInstallments, installmentAmount
      };

      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Admission generated successfully!");
        onSuccess?.();
        onClose();
      } else {
        alert("Error: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate admission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed if (!isOpen) return null; to handle AnimatePresence

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-slate-50 w-full h-full max-w-[1400px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
          >
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">New Student Admission</h1>
              <p className="text-xs font-semibold text-slate-500">Create a new admission and generate admission documents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Admissions
            </button>
            <button onClick={() => {}} className="px-4 py-2 bg-white border border-rose-200 text-rose-500 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* Progress Bar (Visual Only) */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between overflow-x-auto shrink-0">
          {[
            { id: 1, title: "Student Information", desc: "Student & Contact Details", active: true },
            { id: 2, title: "Course Details", desc: "Course & Batch Information", active: true },
            { id: 3, title: "Discount & Scholarship", desc: "Discounts & Fee Adjustments", active: true },
            { id: 4, title: "Payment & EMI", desc: "Payment & Installment Details", active: true },
            { id: 5, title: "Review & Confirm", desc: "Review & Generate Admission", active: false }
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-4 shrink-0 px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step.active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                {step.active ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden lg:block">
                <p className={`text-sm font-bold ${step.active ? "text-slate-800" : "text-slate-500"}`}>{step.id}. {step.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* 1. Student Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
                  Student Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Full Name <span className="text-rose-500">*</span></label>
                    <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Mobile Number <span className="text-rose-500">*</span></label>
                    <input type="text" value={mobileNumber} onChange={e=>setMobileNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Email</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <label className="text-xs font-bold text-slate-500">Address</label>
                    <input type="text" value={address} onChange={e=>setAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">City <span className="text-rose-500">*</span></label>
                    <input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">State <span className="text-rose-500">*</span></label>
                    <input type="text" value={state} onChange={e=>setState(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Pincode <span className="text-rose-500">*</span></label>
                    <input type="text" value={pincode} onChange={e=>setPincode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Date of Birth</label>
                    <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Gender</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Counsellor <span className="text-rose-500">*</span></label>
                    <input type="text" value={counsellor} onChange={e=>setCounsellor(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Course Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</div>
                  Course Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Course <span className="text-rose-500">*</span></label>
                    <select 
                      value={course} 
                      onChange={e => {
                        const selectedCourseName = e.target.value;
                        setCourse(selectedCourseName);
                        
                        const selectedCourseObj = courses.find(c => c.name === selectedCourseName);
                        if (selectedCourseObj) {
                          if (selectedCourseObj.duration) setDuration(selectedCourseObj.duration);
                          if (selectedCourseObj.fee) {
                            const numFee = Math.floor(Number(selectedCourseObj.fee.replace(/[^0-9.]/g, ''))) || 0;
                            setCourseFee(numFee);
                          }
                        }
                      }} 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                    >
                      <option value="">Select a course...</option>
                      {courses.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Batch <span className="text-rose-500">*</span></label>
                    <input type="text" value={batch} onChange={e=>setBatch(e.target.value)} placeholder="e.g. Weekend Batch - Jul 2026" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Duration <span className="text-rose-500">*</span></label>
                    <input type="text" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 6 Months" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Start Date <span className="text-rose-500">*</span></label>
                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Academic Year <span className="text-rose-500">*</span></label>
                    <input type="text" value={academicYear} onChange={e=>setAcademicYear(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Admission Date <span className="text-rose-500">*</span></label>
                    <input type="date" value={admissionDate} onChange={e=>setAdmissionDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Course Fee (₹) <span className="text-rose-500">*</span></label>
                    <input type="number" step="any" value={courseFee} onChange={e=>setCourseFee(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Discount & Scholarship */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</div>
                  Discount & Scholarship
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Scholarship Type</label>
                    <select value={scholarshipType} onChange={e=>setScholarshipType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white">
                      <option value="None">None</option>
                      <option value="Merit Based">Merit Based</option>
                      <option value="Need Based">Need Based</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Scholarship Amount (₹)</label>
                    <input type="number" step="any" value={scholarshipAmount} onChange={e=>setScholarshipAmount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Discount Type</label>
                    <select value={discountType} onChange={e=>setDiscountType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white">
                      <option value="None">None</option>
                      <option value="Festive Offer">Festive Offer</option>
                      <option value="Launching of Course">Launching of Course</option>
                      <option value="Anniversary Offer">Anniversary Offer</option>
                      <option value="Month End Offer">Month End Offer</option>
                      <option value="Group Discount">Group Discount</option>
                      <option value="Early Bird Offer">Early Bird Offer</option>
                      <option value="Referral Discount">Referral Discount</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Discount Amount (₹)</label>
                    <input type="number" step="any" value={discountAmount} onChange={e=>setDiscountAmount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-slate-500 mb-1">Course Fee (₹)</p>
                    <p className="text-2xl font-extrabold text-slate-800">{courseFee.toLocaleString()}</p>
                  </div>
                  <div className="text-slate-300 font-extrabold text-2xl">-</div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-slate-500 mb-1">Total Discount (₹)</p>
                    <p className="text-2xl font-extrabold text-emerald-600">{totalDiscount.toLocaleString()}</p>
                  </div>
                  <div className="text-slate-300 font-extrabold text-2xl">=</div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-slate-500 mb-1">Final Fee (₹)</p>
                    <p className="text-2xl font-extrabold text-indigo-700">{finalFee.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Payment & EMI */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</div>
                  Payment & EMI
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Payment Mode <span className="text-rose-500">*</span></label>
                    <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white">
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-slate-500">Company Allocation</label>
                    <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-slate-50 cursor-not-allowed flex items-center justify-between">
                      <span className="truncate">
                        {paymentMode === "Cash" ? "Cash (Unallocated)" : (autoAllocatedCompany || "Allocating...")}
                      </span>
                      {paymentMode !== "Cash" && autoAllocatedCompany && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Transaction / Reference No. <span className="text-rose-500">*</span></label>
                    <input type="text" value={transactionNo} onChange={e=>setTransactionNo(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Amount Received Today (₹) <span className="text-rose-500">*</span></label>
                    <input type="number" step="any" value={amountReceivedToday} onChange={e=>setAmountReceivedToday(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-indigo-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-indigo-50" />
                  </div>
                </div>

                <div className="p-6 border border-slate-200 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Remaining Balance (₹)</label>
                    <div className="w-full px-4 py-2.5 rounded-xl text-lg font-extrabold text-slate-800">{remainingBalance.toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">EMI / Installment</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={()=>setHasEmi(true)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${hasEmi ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Yes</button>
                      <button onClick={()=>setHasEmi(false)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${!hasEmi ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>No</button>
                    </div>
                  </div>
                  
                  {hasEmi && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Number of Installments</label>
                        <input type="number" min="1" value={numInstallments} onChange={e=>setNumInstallments(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Installment Amount (₹)</label>
                        <input type="number" readOnly value={installmentAmount} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 bg-slate-100 outline-none" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Warning / Validation Message */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <div className="text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-emerald-700">Please review all details carefully before generating admission. After submission, admission documents and receipts will be generated.</p>
            </div>

          </div>

          {/* Right Sidebar - Admission Summary */}
          <div className="w-[380px] bg-indigo-50/30 border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-indigo-900 tracking-tight flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Admission Summary
              </h3>
              <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg">
                  {fullName ? fullName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() : "?"}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{fullName || "Student Name"}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">Ready to Admit</span>
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Student Details</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mobile</span>
                    <span className="font-semibold text-slate-800">{mobileNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email</span>
                    <span className="font-semibold text-slate-800">{email || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">City</span>
                    <span className="font-semibold text-slate-800">{city || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Counsellor</span>
                    <span className="font-semibold text-slate-800">{counsellor || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Course Details</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Course</span>
                    <span className="font-semibold text-slate-800">{course || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Batch</span>
                    <span className="font-semibold text-slate-800">{batch || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Duration</span>
                    <span className="font-semibold text-slate-800">{duration || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Start Date</span>
                    <span className="font-semibold text-slate-800">{startDate || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Fee Summary</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Course Fee</span>
                    <span className="font-semibold text-slate-800">₹{courseFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Total Discount</span>
                    <span className="font-semibold text-emerald-600">- ₹{totalDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-indigo-50 p-2 rounded-lg -mx-2">
                    <span className="text-indigo-900 font-bold">Final Fee</span>
                    <span className="font-extrabold text-indigo-700">₹{finalFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Received Today</span>
                    <span className="font-semibold text-slate-800">₹{amountReceivedToday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span className="font-bold">Outstanding Balance</span>
                    <span className="font-extrabold">₹{remainingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Payment Summary</h4>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Payment Mode</span>
                    <span className="font-semibold text-slate-800">{paymentMode}</span>
                  </div>
                  {hasEmi && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">EMI / Installments</span>
                        <span className="font-semibold text-slate-800">{numInstallments} Installments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Installment Amount</span>
                        <span className="font-semibold text-slate-800">₹{installmentAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save Draft
            </button>
          </div>
          <div className="flex gap-3">
            <button disabled={isSubmitting} onClick={handleGenerateAdmission} className="px-6 py-2.5 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {isSubmitting ? "Processing..." : "Generate Admission"}
            </button>
            <button disabled={isSubmitting} onClick={handleGenerateAdmission} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              {isSubmitting ? "Processing..." : "Generate Admission + First Receipt"}
            </button>
          </div>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
