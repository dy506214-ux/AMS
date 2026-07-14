import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/actions/auth';
import { getStudentsByTeacherId } from '@/lib/services/student';
import { getAttendanceForClass } from '@/lib/services/attendance';
import { Users, ClipboardCheck, ArrowRight, CheckCircle2, AlertCircle, Percent } from 'lucide-react';

export const revalidate = 0; // Disable cache to get live stats

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const assignedStudents = await getStudentsByTeacherId(user.id);
  const totalAssignedCount = assignedStudents.length;

  // Let's identify the unique class/section combinations assigned to this teacher
  // For simplicity, we look at the students list.
  const classesAndSections = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
    const exists = acc.some(item => item.class === student.class && item.section === student.section);
    if (!exists) {
      acc.push({ class: student.class, section: student.section });
    }
    return acc;
  }, []);

  // Check today's register state for the first assigned class
  const todayDate = new Date().toISOString().split('T')[0];
  let todayPresent = 0;
  let todayAbsent = 0;
  let isRegisterComplete = false;

  if (classesAndSections.length > 0) {
    const primaryClass = classesAndSections[0];
    const todayRecords = await getAttendanceForClass(primaryClass.class, primaryClass.section, todayDate);
    
    // Check if any register records exist
    const markedRecords = todayRecords.filter(r => r.status !== 'unmarked');
    isRegisterComplete = markedRecords.length === todayRecords.length && todayRecords.length > 0;
    
    todayPresent = markedRecords.filter(r => r.status === 'present').length;
    todayAbsent = markedRecords.filter(r => r.status === 'absent').length;
  }

  // Calculate percentage of today's attendance for the assigned students
  const totalTodayMarked = todayPresent + todayAbsent;
  const todayPercentage = totalTodayMarked > 0 
    ? Math.round((todayPresent / totalTodayMarked) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {user.name}</h2>
        <p className="text-sm text-slate-500 mt-1">Class Teacher Dashboard Overview</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Assigned Students</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalAssignedCount}</span>
            <span className="text-xs text-slate-500 font-medium">In your designated classes</span>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{"Today's Presence"}</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{todayPresent} Present</span>
            <span className="text-xs text-slate-500 font-medium">{"today's students absent today"}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{"Today's Rate"}</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{todayPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">Average present rate today</span>
          </div>
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-500 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Register Status Banner & Action */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {isRegisterComplete ? (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{"Today's Register Status"}</h3>
                <span className="text-xs text-slate-400">Date: {todayDate}</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {isRegisterComplete 
                ? "You have completed today\u0027s daily register check. You can modify the marked records at any time."
                : "You have pending daily student attendance registers to review and log."}
            </p>
          </div>

          <Link 
            href="/teacher/attendance"
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-4 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isRegisterComplete ? 'Edit Today\u0027s Attendance' : 'Mark Daily Attendance'}</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Assigned Classes quick stats */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Assigned Classes</h3>
            <p className="text-xs text-slate-500 mt-1">Review active student allocations</p>
          </div>

          <div className="flex flex-col gap-3">
            {classesAndSections.length > 0 ? (
              classesAndSections.map((item, idx) => {
                const classCount = assignedStudents.filter(s => s.class === item.class && s.section === item.section).length;
                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-100/50 border border-slate-200/50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{item.class}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Section {item.section}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {classCount} Students
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No students assigned to you yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
