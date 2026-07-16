'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Clock, Percent, CheckCircle, AlertCircle, Calendar, 
  BookOpen, HelpCircle, Bell, Search, Sparkles, ChevronRight,
  TrendingUp, Award, GraduationCap, ArrowUpRight, BookOpenCheck, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  photoUrl: string;
}

interface Stats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

interface Log {
  id: string;
  date: string;
  status: string;
  classId: string;
  sectionId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  createdAt: string;
}

interface DashboardClientProps {
  student: Student;
  stats: Stats;
  recentLogs: Log[];
  announcements: Announcement[];
}

export default function DashboardClient({ 
  student, 
  stats, 
  recentLogs, 
  announcements 
}: DashboardClientProps) {
  const { showToast } = useToast();
  const [currentTime, setCurrentTime] = useState('');

  // Keep time ticking
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 text-slate-800 animate-fadeIn">
      
      {/* Top Banner / Header Greeting */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {student.name}! 👋
          </h2>
          <p className="text-xs text-slate-450 mt-1">Here is your academic status update for today.</p>
        </div>

        {/* Global Student Search / Meta row */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search classes, announcements..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-colors"
            />
          </div>
          
          {/* Calendar Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-slate-650 text-xs font-bold shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayDateStr}</span>
          </div>
        </div>
      </div>

      {/* TOP STATISTICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Attendance Rate</span>
              <span className="text-2xl font-black text-slate-950 mt-1.5">{stats.percentage}%</span>
              <span className="text-[9px] text-slate-450 mt-1">Overall Attendance</span>
            </div>
          </div>
          {/* Sparkline Graphic */}
          <div className="mt-4 h-8 w-full z-10 flex items-end">
            <svg className="w-full h-full text-blue-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M 0 5 Q 15 2 30 5 T 60 4 T 90 6 T 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
              <path d="M 0 5 Q 15 2 30 5 T 60 4 T 90 6 T 100 5" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Present Days</span>
              <span className="text-2xl font-black text-slate-950 mt-1.5 text-emerald-600">{stats.presentDays}</span>
              <span className="text-[9px] text-slate-450 mt-1">Days present at school</span>
            </div>
          </div>
          {/* Sparkline Graphic */}
          <div className="mt-4 h-8 w-full z-10 flex items-end">
            <svg className="w-full h-full text-emerald-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M 0 6 Q 20 8 40 4 T 80 6 T 100 3 L 100 10 L 0 10 Z" fill="currentColor" />
              <path d="M 0 6 Q 20 8 40 4 T 80 6 T 100 3" fill="none" stroke="#10b981" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Absent Days</span>
              <span className="text-2xl font-black text-slate-950 mt-1.5 text-rose-600">{stats.absentDays}</span>
              <span className="text-[9px] text-slate-450 mt-1">Excused or unexcused absences</span>
            </div>
          </div>
          {/* Sparkline Graphic */}
          <div className="mt-4 h-8 w-full z-10 flex items-end">
            <svg className="w-full h-full text-rose-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M 0 8 Q 30 7 60 9 T 90 8 T 100 9 L 100 10 L 0 10 Z" fill="currentColor" />
              <path d="M 0 8 Q 30 7 60 9 T 90 8 T 100 9" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Examinations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center gap-3.5 z-10">
            <div className="p-3 bg-purple-500/10 text-purple-650 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Examinations</span>
              <span className="text-2xl font-black text-slate-950 mt-1.5 text-purple-700">2</span>
              <span className="text-[9px] text-slate-450 mt-1">Upcoming exams scheduled</span>
            </div>
          </div>
          {/* Sparkline Graphic */}
          <div className="mt-4 h-8 w-full z-10 flex items-end">
            <svg className="w-full h-full text-purple-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M 0 7 Q 25 5 50 8 T 75 4 T 100 7 L 100 10 L 0 10 Z" fill="currentColor" />
              <path d="M 0 7 Q 25 5 50 8 T 75 4 T 100 7" fill="none" stroke="#a855f7" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* DASHBOARD MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Attendance Overview Percentage card */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Overall percentage overview</p>
          </div>

          <div className="flex items-center justify-around gap-4 flex-col sm:flex-row my-2">
            {/* Circular doughnut progress ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#f1f5f9" 
                  strokeWidth="9" 
                  fill="transparent" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="url(#blueProgressGradient)" 
                  strokeWidth="9" 
                  fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="blueProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.percentage}%</span>
                <span className="text-[8px] text-slate-450 font-extrabold uppercase mt-0.5 tracking-wider">
                  {stats.percentage >= 90 ? 'Excellent' : 'Good'}
                </span>
              </div>
            </div>

            {/* Legend checklist */}
            <div className="flex flex-col gap-2.5 text-[11px] font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="w-16">Present:</span>
                <span className="font-extrabold text-slate-800">{stats.presentDays} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="w-16">Absent:</span>
                <span className="font-extrabold text-slate-800">{stats.absentDays} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="w-16">Leave:</span>
                <span className="font-extrabold text-slate-800">0 Days</span>
              </div>
            </div>
          </div>

          {/* Bottom Alert bar */}
          <div className="bg-blue-50 border border-blue-150 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-1 bg-blue-500 text-white rounded mt-0.5 shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-blue-900">
                {stats.percentage >= 90 
                  ? "Excellent! Keep maintaining your perfect attendance." 
                  : "Keep improving your attendance rate to stay on track."}
              </p>
              <span className="text-[9px] text-blue-700 mt-0.5 block">Great job!</span>
            </div>
          </div>
        </div>

        {/* Recent Attendance registers list */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Attendance Registers</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Your last 5 attendance logs</p>
            </div>
            
            <Link 
              href="/student/history"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-500 flex items-center gap-0.5"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
                const dateObj = new Date(log.date);
                const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/40 rounded-xl hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-150 rounded-lg text-slate-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-800">{dayStr}, {dateStr}</span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Class {log.classId} - {log.sectionId}</span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      log.status === 'present'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-150'
                        : 'bg-rose-50 text-rose-600 border border-rose-150'
                    }`}>
                      {log.status === 'present' ? 'PRESENT' : 'ABSENT'}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No attendance logs available.</p>
            )}
          </div>
        </div>

      </div>

      {/* DASHBOARD BOTTOM ROW (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Today's Schedule */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
          <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Today's Schedule</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Your classes for today</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 my-1">
            {[
              { time: '08:00 AM - 08:45 AM', subject: 'Mathematics', room: 'Room 101', status: 'ONGOING', isBlue: true },
              { time: '09:00 AM - 09:45 AM', subject: 'English', room: 'Room 102', status: 'UPCOMING', isBlue: false },
              { time: '10:00 AM - 10:45 AM', subject: 'Physics', room: 'Room 103', status: 'UPCOMING', isBlue: false }
            ].map((slot, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400">{slot.time}</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-0.5">{slot.subject}</span>
                  <span className="text-[9px] text-slate-450 mt-0.5">{slot.room}</span>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                  slot.isBlue ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {slot.status}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showToast('Student timetable updated.', 'info')}
            className="text-[9px] font-bold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 cursor-pointer w-full border-t border-slate-50 pt-2.5 mt-1"
          >
            View Full Timetable <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Column 2: Upcoming Examinations */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
          <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-slate-400" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Upcoming Examinations</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Exams scheduled in next 30 days</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 my-1">
            {[
              { day: '17', month: 'JUL', title: 'Half Yearly Examination', class: `Class ${student.class} - ${student.section}`, date: 'Jul 22, 2026' },
              { day: '28', month: 'JUL', title: 'Science Practical', class: `Class ${student.class} - ${student.section}`, date: 'Jul 28, 2026' }
            ].map((exam, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                {/* Calendar date card */}
                <div className="flex flex-col items-center bg-white border border-slate-200 rounded-lg p-1.5 w-11 shrink-0 shadow-xs">
                  <span className="text-[9px] font-extrabold text-blue-600 tracking-wider leading-none">{exam.month}</span>
                  <span className="text-base font-black text-slate-900 mt-1 leading-none">{exam.day}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-slate-800 truncate">{exam.title}</span>
                  <span className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">{exam.class}</span>
                  <span className="text-[9px] text-slate-450 mt-1 font-bold">Scheduled: {exam.date}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showToast('Upcoming examination details verified.', 'info')}
            className="text-[9px] font-bold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 cursor-pointer w-full border-t border-slate-50 pt-2.5 mt-1"
          >
            View All Examinations <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Column 3: Important Announcements */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between gap-4">
          <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-slate-400" />
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Important Announcements</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">Latest updates from school</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 my-1">
            {announcements.length > 0 ? (
              announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold text-slate-800 truncate">{ann.title}</span>
                      <span className="text-[9px] text-slate-450 font-semibold mt-0.5">{ann.category}</span>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-bold shrink-0">
                    {ann.dateInfo}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 text-center py-6">No recent notices.</p>
            )}
          </div>

          <Link
            href="/student/announcements"
            className="text-[9px] font-bold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 cursor-pointer w-full border-t border-slate-50 pt-2.5 mt-1 text-center"
          >
            View All Announcements <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* BOTTOM GRAPHIC BANNER */}
      <div className="bg-blue-50 border border-blue-150 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5 shrink-0">
            <Bell className="w-4 h-4 animate-swing" />
          </div>
          <div>
            <h4 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider">Stay Updated!</h4>
            <p className="text-[11px] text-blue-700 mt-1">Check announcements, exam dates, and maintain your perfect attendance register.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
