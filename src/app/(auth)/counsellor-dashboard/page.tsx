"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "../../component/context/user-context";
import CounsellorSidebar from "@/components/CounsellorSidebar";
import Link from "next/link";
import ProfileDisplay from "@/components/ProfileDisplay";
import CommandPalette from "@/components/CommandPalette";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import StudentSearchCenter from "@/components/StudentSearchCenter";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const MOTIVATIONAL_QUOTES = [
  "Every conversation is a step closer to changing a life.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The secret of getting ahead is getting started.",
  "Opportunities don't happen. You create them.",
  "To give real service you must add something which cannot be bought or measured with money.",
  "Strive not to be a success, but rather to be of value.",
  "Your most unhappy customers are your greatest source of learning.",
  "Don't watch the clock; do what it does. Keep going.",
  "You are never too old to set another goal or to dream a new dream.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Act as if what you do makes a difference. It does."
];

export default function CounsellorDashboardPage() {
  const { user, logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [stats, setStats] = useState({
    leadsCount: 0,
    newToday: 0,
    followUpsToday: 0,
    admissionsCount: 0,
    conversionRate: "0%",
    revenue: 0,
    collection: 0,
  });

  const [pipeline, setPipeline] = useState({
    newLead: 0,
    contacted: 0,
    interested: 0,
    demoAttended: 0,
    admission: 0
  });

  const [leadsList, setLeadsList] = useState<string[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [todayFollowUps, setTodayFollowUps] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [enqRes, admRes] = await Promise.all([
          fetch("/api/enquiries"),
          fetch("/api/admissions")
        ]);

        const enqData = await enqRes.json();
        const admData = await admRes.json();

        if (enqData.success && admData.success) {
          const allEnquiries = enqData.data || [];
          const allAdmissions = admData.data || [];

          // Strict matching: only show data for the currently logged in counsellor
          let myEnquiries = allEnquiries.filter((e: any) => (e.assignedCrmAdvisor || "").toLowerCase() === (user.name || "").toLowerCase());

          let myAdmissions = allAdmissions.filter((a: any) => (a.counsellor || "").toLowerCase() === (user.name || "").toLowerCase());

          // Top Metrics
          const leadsCount = myEnquiries.length;
          setLeadsList(myEnquiries.map((e: any) => e.studentFullName).filter(Boolean));

          const todayStr = new Date().toISOString().split("T")[0];
          const newToday = myEnquiries.filter((e: any) => {
            const d = new Date(e.createdAt);
            return d.toISOString().split("T")[0] === todayStr;
          }).length;

          // Follow-ups today & pending tasks
          let fUpTodayCount = 0;
          let fUpList: any[] = [];
          myEnquiries.forEach((e: any) => {
            if (e.followUps && e.followUps.length > 0) {
              e.followUps.forEach((f: any) => {
                if (f.date === todayStr || !f.isCompleted) {
                  fUpTodayCount++;
                  fUpList.push({
                    id: e._id + (f._id || Math.random().toString()),
                    enquiryId: e._id,
                    name: e.studentFullName,
                    time: f.time || "TBD",
                    action: f.typeOfContact || "Call",
                    completed: f.isCompleted || false,
                    text: `${f.typeOfContact || "Follow-up"} with ${e.studentFullName}`,
                    email: e.emailAddress,
                    number: e.primaryPhoneMobile,
                    course: e.targetCourse,
                    fee: e.expectedCourseFee,
                    priorityLevel: e.priorityLevel
                  });
                }
              });
            } else if (e.status !== "Admitted" && e.status !== "Lost") {
              fUpTodayCount++;
              fUpList.push({
                id: e._id,
                enquiryId: e._id,
                name: e.studentFullName,
                time: "Today",
                action: "Initial Contact",
                completed: false,
                text: `Initial Contact with ${e.studentFullName}`,
                email: e.emailAddress,
                number: e.primaryPhoneMobile,
                course: e.targetCourse,
                fee: e.expectedCourseFee,
                priorityLevel: e.priorityLevel
              });
            }
          });

          const admissionsCount = myAdmissions.length;
          const convRate = leadsCount > 0 ? ((admissionsCount / leadsCount) * 100).toFixed(1) + "%" : "0%";

          const revenue = myAdmissions.reduce((sum: number, a: any) => sum + (a.finalFee || 0), 0);
          const collection = myAdmissions.reduce((sum: number, a: any) => sum + (a.amountReceivedToday || 0), 0);

          setStats({
            leadsCount,
            newToday,
            followUpsToday: fUpTodayCount,
            admissionsCount,
            conversionRate: convRate,
            revenue,
            collection
          });

          // Pipeline
          const pLine = { newLead: 0, contacted: 0, interested: 0, demoAttended: 0, admission: 0 };
          myEnquiries.forEach((e: any) => {
            if (e.status === "New") pLine.newLead++;
            else if (e.status === "Contacted") pLine.contacted++;
            else if (e.status === "Interested") pLine.interested++;
            else if (e.status === "Demo Attended") pLine.demoAttended++;
            else if (e.status === "Admitted") pLine.admission++;
          });
          setPipeline(pLine);

          // Recent Enquiries
          setRecentEnquiries(myEnquiries.slice(0, 4));

          // Follow Ups List
          setTodayFollowUps(fUpList.slice(0, 4));

          // Tasks
          setTasks(fUpList.filter((f: any) => !f.completed).slice(0, 4));

          // Birthdays
          const tDate = new Date();
          const tMonth = tDate.getMonth();
          const tDay = tDate.getDate();
          const upcomingBirthdays = myAdmissions
            .filter((a: any) => a.dob)
            .map((a: any) => {
              const d = new Date(a.dob);
              return {
                id: a._id || Math.random().toString(),
                name: a.fullName,
                month: d.getMonth(),
                day: d.getDate(),
                dateStr: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              };
            })
            .filter((b: any) => (b.month === tMonth && b.day >= tDay) || (b.month === (tMonth + 1) % 12))
            .sort((a: any, b: any) => {
              const distA = a.month === tMonth ? a.day - tDay : a.day + 31;
              const distB = b.month === tMonth ? b.day - tDay : b.day + 31;
              return distA - distB;
            })
            .slice(0, 3);
          setBirthdays(upcomingBirthdays);

          // Notifications
          const notifs: any[] = [];
          const newEnquiriesToday = myEnquiries.filter((e: any) => {
            if (!e.createdAt) return false;
            const d = new Date(e.createdAt);
            return d.toISOString().split("T")[0] === todayStr;
          });
          newEnquiriesToday.forEach((e: any) => {
            notifs.push({
              id: "new_" + e._id,
              title: "New Enquiry",
              message: `${e.studentFullName} enquired for ${e.targetCourse || 'a course'}`,
              time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "new_lead",
              isRead: false,
              email: e.emailAddress,
              number: e.primaryPhoneMobile,
              course: e.targetCourse,
              fee: e.expectedCourseFee,
              priorityLevel: e.priorityLevel
            });
          });
          fUpList.forEach((f: any) => {
            notifs.push({
              id: "fup_" + f.id,
              title: `Follow-up: ${f.name}`,
              message: f.text,
              time: f.time,
              type: "follow_up",
              isRead: false,
              email: f.email,
              number: f.number,
              course: f.course,
              fee: f.fee,
              priorityLevel: f.priorityLevel
            });
          });
          
          notifs.sort((a, b) => {
            const pMap: any = { High: 3, Medium: 2, Low: 1 };
            const valA = pMap[a.priorityLevel || 'Medium'] || 0;
            const valB = pMap[b.priorityLevel || 'Medium'] || 0;
            return valB - valA;
          });

          setNotifications(notifs);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  // Formatting helpers
  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)} K`;
    return `₹${val}`;
  };

  const getPercent = (val: number, total: number) => {
    if (total === 0) return "0%";
    return ((val / total) * 100).toFixed(1) + "%";
  };
  const totalPipeline = Object.values(pipeline).reduce((a, b) => a + b, 0);

  const [todaysQuote, setTodaysQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  useEffect(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setTodaysQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
    
    return () => {
      // Need to cleanup the event listener here if we added it in the same useEffect
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
        }
      };
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleMarkLost = async (enquiryId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await fetch('/api/enquiries/mark-lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId, date: today })
      });
      setRecentEnquiries(prev => prev.filter((req: any) => req._id !== enquiryId));
    } catch (error) {
      console.error("Failed to mark lead as lost:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <CounsellorSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-3.5 py-2 shadow-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Leads
            </button>

            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsCommandPaletteOpen(true)}
                className="relative w-full sm:w-64 flex items-center justify-between pl-3 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 group"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 mr-2 group-hover:text-purple-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                  Search anything...
                </div>
                <span className="flex items-center pointer-events-none text-[10px] font-bold text-slate-400/80 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  Ctrl + K
                </span>
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Today's Notifications</h3>
                    <span className="text-[10px] font-semibold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No notifications for today</div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div key={notif.id} className="group relative p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                          <div className="hidden group-hover:block mt-3 pt-3 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Email</span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate block" title={notif.email}>{notif.email || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Number</span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate block">{notif.number || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Course</span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate block" title={notif.course}>{notif.course || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block">Expected Fee</span>
                                <span className="text-[11px] font-semibold text-slate-700 truncate block">{notif.fee || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${notif.priorityLevel === 'High' ? 'bg-rose-100 text-rose-600' : notif.priorityLevel === 'Low' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-600'}`}>
                                {notif.priorityLevel || 'Medium'} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-5 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden shadow-sm shrink-0">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : "C"}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user.name || ""}</p>
                <p className="text-[11px] font-semibold text-emerald-600 leading-tight mt-0.5 capitalize">{user.role}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <ProfileDisplay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} />
        </header>

        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

        {/* Dashboard Content */}
        <motion.div 
          className="p-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Student Search & Action Center */}
          <StudentSearchCenter />

          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <MetricCard title="My Leads" value={stats.leadsCount} trend="+ 0%" trendUp={true} hoverList={leadsList} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><UserIcon /></div>
            } />
            <MetricCard title="New Today" value={stats.newToday} trend="+ 0%" trendUp={true} icon={
              <div className="bg-blue-50 text-blue-500 p-2 rounded-lg"><UserAddIcon /></div>
            } />
            <MetricCard title="Follow-ups Today" value={stats.followUpsToday} trend="+ 0%" trendUp={true} icon={
              <div className="bg-orange-50 text-orange-500 p-2 rounded-lg"><CalendarIcon /></div>
            } />
            <MetricCard title="Admissions" value={stats.admissionsCount} trend="+ 0%" trendUp={true} icon={
              <div className="bg-purple-50 text-purple-500 p-2 rounded-lg"><AcademicIcon /></div>
            } />
            <MetricCard title="Conversion Rate" value={stats.conversionRate} trend="+ 0%" trendUp={true} icon={
              <div className="bg-blue-50 text-blue-500 p-2 rounded-lg"><ChartUpIcon /></div>
            } />
            <MetricCard title="Revenue (INR)" value={formatINR(stats.revenue)} trend="+ 0%" trendUp={true} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><ChartUpIcon /></div>
            } />
            <MetricCard title="Collection (INR)" value={formatINR(stats.collection)} trend="+ 0%" trendUp={true} icon={
              <div className="bg-emerald-50 text-emerald-500 p-2 rounded-lg"><WalletIcon /></div>
            } />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Lead Pipeline */}
            <DashboardCard title="My Lead Pipeline">
              <div className="flex items-center gap-6 mt-4">
                {/* Visual Funnel */}
                <div className="flex flex-col items-center gap-1 w-32">
                  <div className="w-full h-8 bg-blue-500 rounded-sm"></div>
                  <div className="w-2/3 h-8 bg-amber-400 rounded-sm"></div>
                  <div className="w-1/3 h-8 bg-purple-500 rounded-sm"></div>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-2">
                  <PipelineStat label="New Lead" value={pipeline.newLead} percent={getPercent(pipeline.newLead, totalPipeline)} color="bg-blue-500" />
                  <PipelineStat label="Demo Attended" value={pipeline.demoAttended} percent={getPercent(pipeline.demoAttended, totalPipeline)} color="bg-amber-400" />
                  <PipelineStat label="Admission" value={pipeline.admission} percent={getPercent(pipeline.admission, totalPipeline)} color="bg-purple-500" />
                </div>
              </div>
            </DashboardCard>

            {/* Today's Follow-ups */}
            <DashboardCard title="Today's Follow-ups">
              <div className="space-y-4 mt-4">
                {todayFollowUps.length > 0 ? todayFollowUps.map((f: any, i: number) => (
                  <FollowUpItem key={f.id || i} name={f.name} time={f.time} action={f.action} actionColor="text-emerald-600 bg-emerald-50 border-emerald-100" />
                )) : (
                  <p className="text-xs text-slate-400">No follow-ups for today.</p>
                )}
              </div>
            </DashboardCard>

            {/* My Tasks */}
            <DashboardCard title="My Tasks">
              <div className="space-y-4 mt-4">
                {tasks.length > 0 ? tasks.map((t: any, i: number) => (
                  <TaskItem key={t.id || i} text={t.text} time={t.time} completed={t.completed} />
                )) : (
                  <p className="text-xs text-slate-400">No pending tasks today.</p>
                )}
              </div>
            </DashboardCard>

            {/* Recent Enquiries */}
            <DashboardCard title="Recent Enquiries">
              <div className="space-y-4 mt-4">
                {recentEnquiries.length > 0 ? recentEnquiries.map((e: any, i: number) => (
                  <EnquiryItem 
                    key={e._id || i} 
                    id={e._id}
                    name={e.studentFullName} 
                    source={e.leadSource || "Website"} 
                    time={new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    onMarkLost={handleMarkLost}
                  />
                )) : (
                  <p className="text-xs text-slate-400">No recent enquiries.</p>
                )}
              </div>
            </DashboardCard>

          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* My Performance */}
            <DashboardCard title="My Performance (This Month)">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 mt-4 grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Leads</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">{stats.leadsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Admissions</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">{stats.admissionsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Conversion</span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">{stats.conversionRate}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Revenue</span>
                  <p className="text-lg font-extrabold text-emerald-600 mt-1">{formatINR(stats.revenue)}</p>
                </div>
              </div>
            </DashboardCard>

            {/* Follow-up Reminders */}
            <DashboardCard title="Follow-up Reminders">
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                  <span className="text-xs font-semibold text-slate-600">{tasks.length} leads are pending follow-up</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  <span className="text-xs font-semibold text-slate-600">0 demos scheduled this week</span>
                </div>
              </div>
            </DashboardCard>

            {/* Upcoming Birthdays */}
            <DashboardCard title="Upcoming Birthdays">
              <div className="space-y-4 mt-4">
                {birthdays.length > 0 ? birthdays.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-700">{b.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{b.dateStr}</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400">No upcoming birthdays.</p>
                )}
              </div>
            </DashboardCard>

            {/* Motivational Quote */}
            <DashboardCard title="Motivational Quote">
              <div className="mt-4 flex flex-col items-center justify-center h-full text-center px-4 relative">
                <span className="text-4xl text-emerald-200 absolute top-0 left-2">"</span>
                <p className="text-sm font-semibold text-slate-600 italic relative z-10 px-4">
                  {todaysQuote}
                </p>
                <span className="text-4xl text-emerald-200 absolute bottom-0 right-2 leading-none">"</span>
              </div>
            </DashboardCard>

          </div>

        </motion.div>
      </div>

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          // refresh data if needed
          window.location.reload();
        }}
      />
    </div>
  );
}

// Subcomponents

function MetricCard({ title, value, trend, trendUp, icon, hoverList }: any) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-1">{title}</h3>
          <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
        {icon}
      </div>
      <div className="mt-3 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
          )}
        </svg>
        <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend}
        </span>
      </div>

      {showTooltip && hoverList && hoverList.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 p-2 max-h-40 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider px-1">Lead Names</h4>
          {hoverList.map((name: string, i: number) => (
            <div key={i} className="text-xs font-semibold text-slate-700 p-1 hover:bg-slate-50 rounded">
              {name}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function DashboardCard({ title, actionText, children }: any) {
  return (
    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {actionText && (
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            {actionText}
          </button>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </motion.div>
  );
}

function PipelineStat({ label, value, percent, color }: any) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-sm ${color}`}></div>
        <span className="text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-800 font-bold">{value}</span>
        <span className="text-slate-400 w-10 text-right">({percent})</span>
      </div>
    </div>
  );
}

function FollowUpItem({ name, time, action, actionColor }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b`} alt={name} className="h-full w-full" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-semibold text-slate-400">{time}</span>
        <button className={`text-[10px] font-bold border rounded-md px-2 py-1 ${actionColor} hover:opacity-80 transition-opacity w-16 text-center`}>
          {action}
        </button>
      </div>
    </div>
  );
}

function TaskItem({ text, time, completed }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}>
          {completed && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className={`text-xs font-bold ${completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          {text}
        </p>
      </div>
      <span className="text-[10px] font-semibold text-slate-400">{time}</span>
    </div>
  );
}

function EnquiryItem({ id, name, source, time, onMarkLost }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          title="Mark as Lost"
          className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer hover:border-rose-400"
          onChange={(e) => {
            if (e.target.checked && id && onMarkLost) {
              onMarkLost(id);
            }
          }}
        />
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-xs font-bold text-slate-800">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-semibold text-slate-500 w-16">{source}</span>
        <span className="text-[10px] font-semibold text-slate-400 w-12 text-right">{time}</span>
        <span className="text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100 rounded px-1.5 py-0.5">
          New
        </span>
      </div>
    </div>
  );
}


// Icons (Simple SVG wrappers for cleaner code above)
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function UserAddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.5-.413 8.084-1.205a60.43 60.43 0 00-.49-6.347m-15.344 0C4.3 7.299 8 7 12 7s7.7 2.999 7.75 3.147m-15.344 0C3.46 11.584 3 13.088 3 14.7c0 1.71.533 3.32 1.455 4.654M19.75 10.147c.79 1.437 1.25 3.1 1.25 4.853 0 1.612-.46 3.116-1.205 4.454M12 2.25V5.25m0 0a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  );
}

function ChartUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}
