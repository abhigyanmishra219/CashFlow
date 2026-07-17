"use client";

import React, { useState, useEffect } from "react";
import AddCourseModal from "./AddCourseModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useUser } from "@/app/component/context/user-context";

export default function CourseDisplay() {
  const { user } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete Modal state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All Brands (Super)");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/courses");
      const data = await response.json();
      if (response.ok && data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    fetchCourses();
  };

  const confirmDeleteCourse = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/courses/${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setItemToDelete(null);
        fetchCourses();
      } else {
        alert("Failed to delete: " + (data.error || "unknown error"));
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchCourses();
      } else {
        alert("Failed to update status: " + (data.error || "unknown error"));
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
      alert("Error toggling course status");
    }
  };

  // Dynamic Statistics
  const totalCurriculums = courses.length;
  const activeCount = courses.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = courses.filter((c) => c.status === "INACTIVE").length;

  let topCategory = "N/A";
  let topCategoryCount = 0;
  if (courses.length > 0) {
    const categoryCounts: Record<string, number> = {};
    courses.forEach((c) => {
      const cat = c.category || "N/A";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    let max = 0;
    let bestCat = "N/A";
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > max) {
        max = count;
        bestCat = cat;
      }
    });
    topCategory = bestCat;
    topCategoryCount = max;
  }

  const recentLaunchName = courses.length > 0 ? courses[0].name : "None";

  const stats = [
    {
      title: "Total Curriculums",
      value: String(totalCurriculums),
      subtext: "System catalog size",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      title: "Active Courses",
      value: String(activeCount),
      subtext: "Available for enrollment",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    },
    {
      title: "Inactive / Archived",
      value: String(inactiveCount),
      subtext: "Disabled from pipeline",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
    },
    {
      title: "Top Category",
      value: topCategory,
      badge: topCategoryCount > 0 ? String(topCategoryCount) : undefined,
      subtext: "Most frequent category"
    },
    {
      title: "Recent Launch",
      value: recentLaunchName.length > 25 ? recentLaunchName.slice(0, 22) + "..." : recentLaunchName,
      subtext: "Latest registered code",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-indigo-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      )
    }
  ];

  // Dynamic filter values
  const uniqueBrands = Array.from(new Set(courses.map((c) => c.brand).filter(Boolean)));
  const uniqueCategories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  const uniqueDurations = Array.from(new Set(courses.map((c) => c.duration).filter(Boolean)));

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand =
      selectedBrand === "All Brands (Super)" || course.brand === selectedBrand;

    const matchesCategory =
      selectedCategory === "All Categories" || course.category === selectedCategory;

    const matchesDuration =
      selectedDuration === "All Durations" || course.duration === selectedDuration;

    const matchesStatus =
      selectedStatus === "All Statuses" || course.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesCategory && matchesDuration && matchesStatus;
  });

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Course Curriculum Registry</h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Manage course curriculum structure, tuition codes, terms, global categories, and authorization states.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 shadow-md shadow-indigo-600/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Course
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block select-none">
                {stat.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
                  {stat.value}
                </span>
                {stat.badge && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded-md px-1.5 py-0.5 leading-none">
                    {stat.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400/90 block leading-none select-none">
                {stat.subtext}
              </span>
            </div>
            {stat.icon && <div className="shrink-0">{stat.icon}</div>}
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all courses by name, code, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-700 font-semibold"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          {user?.role !== "brand manager" && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="All Brands (Super)">All Brands (Super)</option>
              {uniqueBrands.map((brand, i) => (
                <option key={i} value={brand}>{brand}</option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none"
          >
            <option value="All Categories">All Categories</option>
            {uniqueCategories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Duration Filter */}
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none"
          >
            <option value="All Durations">All Durations</option>
            {uniqueDurations.map((dur, i) => (
              <option key={i} value={dur}>{dur}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Courses List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Course (Name & Code)</th>
                <th className="py-3 px-6">Assigned Brand</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Fee (INR)</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 select-none">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80">Loading courses...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 select-none">
                    No courses found. Add a course to get started!
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, idx) => (
                  <tr key={course._id || idx} className="hover:bg-slate-50/40 transition-colors">
                    {/* Name and Code */}
                    <td className="py-4 px-6">
                      <span className="text-slate-800 font-bold block">{course.name}</span>
                      <span className="inline-block text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 mt-1 font-mono">
                        {course.code}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M14 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75" />
                        </svg>
                        {course.brand}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-bold border border-slate-300 text-slate-600 bg-white rounded-lg px-2.5 py-0.5">
                        {course.category}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-6 text-slate-500">
                      {course.duration}
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-6 text-slate-800 font-bold">
                      {course.fee}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        onClick={() => handleToggleStatus(course._id, course.status)}
                        className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-md px-2 py-0.5 border cursor-pointer select-none uppercase ${
                          course.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${course.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        {course.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(course._id, course.status)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Toggle Active/Inactive"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: course._id, name: course.name })}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Course"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-200/60 pt-4 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>DB Connection: Compliant</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>AI Assist: Connected</span>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span>Active Session Secured</span>
          <span>|</span>
          <span className="text-indigo-600">CoachFlow Enterprise v1.2</span>
        </div>
      </div>

      {/* Floating Plus button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all select-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Reusable Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Course Curriculum"
        itemName={itemToDelete?.name || "this course"}
        isLoading={isDeleting}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteCourse}
      />


    </div>
  );
}
