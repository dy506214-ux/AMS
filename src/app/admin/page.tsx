import React from 'react';
import { getOverallSchoolStats, getTodayAttendanceSummary } from '@/lib/services/attendance';
import { Users, UserSquare, ClipboardCheck, Percent, CalendarRange, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Disable caching to fetch live data on page reload

export default async function AdminDashboard() {
  const overallStats = await getOverallSchoolStats();
  const todayStats = await getTodayAttendanceSummary();

  const stats = [
    {
      name: 'Total Teachers',
      value: overallStats.totalTeachers,
      icon: Users,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      description: 'Active employees',
      link: '/admin/teachers'
    },
    {
      name: 'Total Students',
      value: overallStats.totalStudents,
      icon: UserSquare,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      description: 'Enrolled students',
      link: '/admin/students'
    },
    {
      name: "Today's Attendance",
      value: `${todayStats.totalPresent} / ${todayStats.totalStudents}`,
      icon: ClipboardCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: `${todayStats.totalAbsent} absent students today`,
      link: '#'
    },
    {
      name: 'Average Attendance',
      value: `${overallStats.averageAttendancePercentage}%`,
      icon: Percent,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      description: 'Historical average',
      link: '#'
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time summaries and statistics of school attendance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover-lift">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.name}</span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                </div>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{stat.description}</span>
                {stat.link !== '#' && (
                  <Link 
                    href={stat.link} 
                    className="text-xs text-sky-600 font-bold hover:text-sky-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    View <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's Summary Circular Progress Card */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Attendance Status</h3>
            <p className="text-xs text-slate-500 mt-1">Status of today's attendance summary</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            {/* Visual Progress Doughnut Ring */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#f1f5f9" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                {/* Progress circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#skyGradient)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * todayStats.percentage) / 100}
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
                <span className="text-3xl font-black text-slate-800 tracking-tight">{todayStats.percentage}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Present Today</span>
              </div>
            </div>

            {/* Status Breakdown Legend */}
            <div className="grid grid-cols-2 gap-8 w-full mt-8 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-slate-900 leading-none">{todayStats.totalPresent}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Present</span>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-slate-900 leading-none">{todayStats.totalAbsent}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Info & Tips Panel */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance System Quick-start</h3>
            <p className="text-xs text-slate-500 mt-1">A guide for administrating the portal operations</p>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex gap-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Add & Organize Teachers</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Navigate to the <Link href="/admin/teachers" className="text-sky-600 underline font-semibold">Teachers tab</Link> to create staff accounts with unique employee IDs.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Enroll Students & Assign Tutors</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Create students in the <Link href="/admin/students" className="text-sky-600 underline font-semibold">Students tab</Link>, assign their grade level, and link them to their class tutor.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Monitor Daily Registers</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Staff logs in to submit the daily register. Attendance percentage updates instantly across all portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
