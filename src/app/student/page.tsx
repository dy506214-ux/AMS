import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAttendanceStatsForStudent, getAttendanceForStudent } from '@/lib/services/attendance';
import { getStudentById } from '@/lib/services/student';
import { CheckCircle, AlertCircle, Percent, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Disable cache for live stats

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = await getStudentById(user.id);
  if (!student) return null;

  const stats = await getAttendanceStatsForStudent(user.id);
  const attendanceLogs = await getAttendanceForStudent(user.id);
  const recentLogs = attendanceLogs.slice(0, 5); // Fetch top 5 recent days

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hello, {student.name}</h2>
        <p className="text-sm text-slate-500 mt-1">Here is your attendance overview for {student.class} - {student.section}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.percentage}%</span>
            <span className="text-xs text-slate-500 font-medium">Out of {stats.totalDays} sessions</span>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Present Days</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight text-emerald-600">{stats.presentDays}</span>
            <span className="text-xs text-slate-500 font-medium">Days present at school</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Absent Days</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight text-rose-600">{stats.absentDays}</span>
            <span className="text-xs text-slate-500 font-medium">Excused or unexcused absences</span>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Progress Doughnut Ring Card */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col gap-6 items-center justify-center">
          <div className="w-full text-left">
            <h3 className="text-base font-bold text-slate-900">Attendance Percentage</h3>
            <p className="text-xs text-slate-500 mt-1">Overall percentage overview ring</p>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#f1f5f9" 
                strokeWidth="8" 
                fill="transparent" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#skyGradient)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{stats.percentage}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Register Health</span>
            </div>
          </div>
        </div>

        {/* Recent Attendance Logs widget */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Registers</h3>
                <p className="text-xs text-slate-500 mt-1">Your last 5 attendance logs</p>
              </div>
              <Link 
                href="/student/history" 
                className="text-xs text-sky-600 font-bold hover:text-sky-700 hover:underline inline-flex items-center gap-0.5"
              >
                Full History <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-slate-500 border border-slate-100">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase border ${
                      log.status === 'present'
                        ? 'bg-emerald-50/10 border-emerald-500/20 text-emerald-600'
                        : log.status === 'absent'
                        ? 'bg-rose-50/10 border-rose-500/20 text-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-450 text-center py-6">No registers found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
