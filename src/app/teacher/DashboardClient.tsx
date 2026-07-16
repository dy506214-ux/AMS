'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ClipboardCheck, 
  Percent, 
  BookOpen, 
  Megaphone, 
  Calendar as CalendarIcon, 
  ArrowRight,
  TrendingUp,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface WeeklyData {
  day: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  totalMarked: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  createdAt: Date | string;
}

interface DashboardClientProps {
  totalStudents: number;
  todayPresent: number;
  todayRate: number;
  totalClasses: number;
  weeklyData: WeeklyData[];
  recentAnnouncements: Announcement[];
  classesAndSections: { class: string; section: string }[];
  userName: string;
}

export default function DashboardClient({
  totalStudents,
  todayPresent,
  todayRate,
  totalClasses,
  weeklyData,
  recentAnnouncements,
  classesAndSections,
  userName
}: DashboardClientProps) {
  // Calendar Widget State
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-16'); // Default to Today
  const [dateSummary, setDateSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'schedule'>('attendance');

  // Chart Tooltip Hover State
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Load calendar summary on click
  const fetchDateSummary = async (dateStr: string) => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/teacher/attendance-summary?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setDateSummary(data);
      } else {
        setDateSummary(null);
      }
    } catch {
      setDateSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchDateSummary(selectedDate);
  }, [selectedDate]);

  // Generate upcoming classes list based on sections
  const mockSubjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'];
  const getUpcomingSchedule = () => {
    if (classesAndSections.length === 0) return [];
    
    // We create a structured list using the teacher's sections
    const schedule = [];
    const times = [
      { start: '08:30 AM', end: '09:15 AM', relative: 'Today' },
      { start: '09:30 AM', end: '10:15 AM', relative: 'Today' },
      { start: '11:00 AM', end: '11:45 AM', relative: 'Tomorrow' },
      { start: '01:00 PM', end: '01:45 PM', relative: 'Fri, Jul 18' }
    ];

    for (let i = 0; i < 4; i++) {
      const sec = classesAndSections[i % classesAndSections.length];
      const subject = mockSubjects[i % mockSubjects.length];
      schedule.push({
        id: `class-slot-${i}`,
        className: `Class ${sec.class}${sec.section}`,
        subject,
        time: `${times[i].start} - ${times[i].end}`,
        relative: times[i].relative
      });
    }
    return schedule;
  };

  const scheduleList = getUpcomingSchedule();

  // Weekly attendance chart calculations (SVG)
  const chartWidth = 550;
  const chartHeight = 200;
  const chartPadding = { top: 20, right: 30, bottom: 30, left: 40 };

  // Max value for Y-axis (scale to total students, default 60)
  const maxStudents = totalStudents || 60;

  const getCoordinates = (data: WeeklyData[], key: 'present' | 'absent' | 'late') => {
    const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
    const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    
    return data.map((d, index) => {
      const val = d[key];
      const x = chartPadding.left + (index * usableWidth) / 5;
      const y = chartHeight - chartPadding.bottom - (val / maxStudents) * usableHeight;
      return { x, y, value: val, day: d.day, date: d.date };
    });
  };

  const presentCoords = getCoordinates(weeklyData, 'present');
  const absentCoords = getCoordinates(weeklyData, 'absent');
  const lateCoords = getCoordinates(weeklyData, 'late');

  const makePathD = (coords: { x: number; y: number }[]) => {
    return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  };

  const makeAreaD = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const startX = coords[0].x;
    const endX = coords[coords.length - 1].x;
    const bottomY = chartHeight - chartPadding.bottom;
    return `${makePathD(coords)} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  // Sparkline SVG Paths (static mockup curves for metric cards)
  const sparklines = {
    blue: "M 10 35 Q 35 10 60 25 T 110 5 T 160 20",
    green: "M 10 25 Q 35 35 60 15 T 110 25 T 160 10",
    purple: "M 10 15 Q 35 5 60 25 T 110 10 T 160 5",
    orange: "M 10 30 Q 35 30 60 15 T 110 20 T 160 15"
  };

  // Calendar days generation (July 2026)
  const renderCalendarDays = () => {
    const daysInMonth = 31;
    const startDayOfWeek = 3; // Wednesday (0 = Sun, 1 = Mon, ..., 3 = Wed)
    const days = [];

    // Empty spots for preceding days of the week
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-9" />);
    }

    // July 1 to 31
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `2026-07-${String(d).padStart(2, '0')}`;
      const isToday = d === 16;
      const isSelected = selectedDate === dateStr;
      const hasRecord = d <= 14 && d !== 4 && d !== 5 && d !== 11 && d !== 12; // Seeding matches July 1-14 weekdays
      
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-9 w-9 rounded-full text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' 
              : isToday
                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span>{d}</span>
          {/* Small dot indicating registers marked */}
          {hasRecord && (
            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
          )}
        </button>
      );
    }
    return days;
  };

  // Helper for time ago
  const formatTimeAgo = (createdAt: Date | string) => {
    const created = new Date(createdAt);
    const diff = new Date('2026-07-16T21:48:30').getTime() - created.getTime(); // relative to mockup date
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Students</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalStudents}</span>
            <span className="text-[10px] text-slate-500 font-semibold">In your classes</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <svg className="w-20 h-8 text-blue-500 opacity-80" viewBox="0 0 170 40">
              <motion.path 
                d={sparklines.blue} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
          </div>
        </div>

        {/* Today's Present Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Today's Present</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{todayPresent}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">{todayRate}% Present</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <svg className="w-20 h-8 text-emerald-500 opacity-80" viewBox="0 0 170 40">
              <motion.path 
                d={sparklines.green} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
          </div>
        </div>

        {/* Today's Rate Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Today's Rate</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{todayRate}%</span>
            <span className="text-[10px] text-slate-500 font-semibold">Average Attendance</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <svg className="w-20 h-8 text-violet-500 opacity-80" viewBox="0 0 170 40">
              <motion.path 
                d={sparklines.purple} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
          </div>
        </div>

        {/* Total Classes Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Classes</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalClasses}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Classes Assigned</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <svg className="w-20 h-8 text-amber-500 opacity-80" viewBox="0 0 170 40">
              <motion.path 
                d={sparklines.orange} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Charts & Action Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Attendance line graph */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Attendance Overview <span className="text-slate-400 text-sm font-medium">(This Week)</span></h3>
            </div>
            <select className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:bg-slate-200 transition-colors">
              <option>This Week</option>
            </select>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full h-[220px]">
            <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Y Axis Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = chartPadding.top + (1 - pct) * (chartHeight - chartPadding.top - chartPadding.bottom);
                return (
                  <g key={`grid-${idx}`}>
                    <line 
                      x1={chartPadding.left} 
                      y1={y} 
                      x2={chartWidth - chartPadding.right} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={chartPadding.left - 10} 
                      y={y + 4} 
                      textAnchor="end" 
                      className="text-[10px] fill-slate-400 font-bold"
                    >
                      {Math.round(pct * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {weeklyData.map((d, index) => {
                const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
                const x = chartPadding.left + (index * usableWidth) / 5;
                return (
                  <text 
                    key={`x-lbl-${index}`}
                    x={x} 
                    y={chartHeight - 10} 
                    textAnchor="middle" 
                    className="text-[10px] fill-slate-500 font-bold"
                  >
                    {d.day}
                  </text>
                );
              })}

              {/* Guide Line on Hover */}
              {hoveredIdx !== null && (
                <line 
                  x1={presentCoords[hoveredIdx].x} 
                  y1={chartPadding.top} 
                  x2={presentCoords[hoveredIdx].x} 
                  y2={chartHeight - chartPadding.bottom} 
                  stroke="#3b82f6" 
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
              )}

              {/* Areas */}
              <path d={makeAreaD(presentCoords)} fill="url(#presentGrad)" />
              <path d={makeAreaD(absentCoords)} fill="url(#absentGrad)" />
              <path d={makeAreaD(lateCoords)} fill="url(#lateGrad)" />

              {/* Lines */}
              <motion.path 
                d={makePathD(presentCoords)} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
              <motion.path 
                d={makePathD(absentCoords)} 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
              <motion.path 
                d={makePathD(lateCoords)} 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />

              {/* Interactive nodes */}
              {weeklyData.map((d, index) => {
                const p = presentCoords[index];
                const a = absentCoords[index];
                const l = lateCoords[index];

                return (
                  <g key={`nodes-${index}`} className="cursor-pointer">
                    {/* Trigger rect for hover sensitivity */}
                    <rect 
                      x={p.x - 30} 
                      y={chartPadding.top} 
                      width={60} 
                      height={chartHeight - chartPadding.top - chartPadding.bottom} 
                      fill="transparent"
                      onMouseEnter={() => setHoveredIdx(index)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />

                    {/* Nodes */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredIdx === index ? 6 : 4} 
                      fill="#10b981" 
                      stroke="#fff" 
                      strokeWidth="2" 
                    />
                    <circle 
                      cx={a.x} 
                      cy={a.y} 
                      r={hoveredIdx === index ? 6 : 4} 
                      fill="#f43f5e" 
                      stroke="#fff" 
                      strokeWidth="2" 
                    />
                    <circle 
                      cx={l.x} 
                      cy={l.y} 
                      r={hoveredIdx === index ? 6 : 4} 
                      fill="#f59e0b" 
                      stroke="#fff" 
                      strokeWidth="2" 
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Tooltip */}
            <AnimatePresence>
              {hoveredIdx !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs z-20 pointer-events-none flex flex-col gap-1.5"
                  style={{
                    left: `${presentCoords[hoveredIdx].x - 80}px`,
                    top: `10px`
                  }}
                >
                  <div className="font-bold text-slate-300 border-b border-white/10 pb-1 flex justify-between gap-6">
                    <span>{weeklyData[hoveredIdx].day} - {weeklyData[hoveredIdx].date}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Stats</span>
                  </div>
                  {weeklyData[hoveredIdx].totalMarked > 0 ? (
                    <div className="grid grid-cols-3 gap-3 pt-0.5">
                      <div className="flex flex-col">
                        <span className="text-emerald-400 font-bold text-sm">{weeklyData[hoveredIdx].present}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Present</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-amber-400 font-bold text-sm">{weeklyData[hoveredIdx].late}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Late</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-rose-400 font-bold text-sm">{weeklyData[hoveredIdx].absent}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Absent</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-bold text-[10px] italic py-1">Registers pending</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-4 justify-start items-center border-t border-slate-100 pt-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-700">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-700">Late</span>
            </div>
          </div>
        </div>

        {/* Upcoming Classes Schedule */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Upcoming Classes</h3>
            <Link href="/teacher/calendar" className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-0.5">
              <span>View All</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3.5">
            {scheduleList.length > 0 ? (
              scheduleList.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white ${
                      idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-emerald-500' : 'bg-violet-500'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 leading-tight">{c.className}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5">{c.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">{c.time}</span>
                      <span className={`text-[9px] font-bold mt-0.5 uppercase tracking-wide ${
                        c.relative === 'Today' ? 'text-blue-500' : c.relative === 'Tomorrow' ? 'text-purple-500' : 'text-slate-500'
                      }`}>
                        {c.relative}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No scheduled classes found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        
        {/* Quick Mark Attendance Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Quick Mark Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">Check class registers and log today's attendance records</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-hidden">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3 border border-blue-100 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-700">Mark attendance for your classes</span>
            <span className="text-[10px] text-slate-400 mt-1 font-semibold">2 sections assigned</span>
          </div>

          <Link 
            href="/teacher/attendance"
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Mark Attendance</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Announcements List */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Announcements</h3>
            <Link href="/teacher/announcements" className="text-xs font-bold text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((ann, index) => (
                <div key={ann.id} className="flex gap-3">
                  <div className={`p-2.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border text-white ${
                    ann.category === 'Holiday' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                      : ann.category === 'PTM'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                  }`}>
                    <Megaphone className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 leading-tight hover:text-blue-600 transition-colors cursor-pointer truncate">
                      {ann.title}
                    </span>
                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                      {ann.content}
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold mt-1">
                      {formatTimeAgo(ann.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No recent announcements found.</p>
            )}
          </div>
        </div>

        {/* Interactive Calendar Widget */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Calendar</h3>
            <Link href="/teacher/calendar" className="text-xs font-bold text-blue-600 hover:text-blue-500">
              View Full Calendar
            </Link>
          </div>

          {/* Calendar Grid Header */}
          <div className="text-center font-bold text-slate-800 text-sm mb-3">July 2026</div>
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase mb-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 justify-items-center mb-4">
            {renderCalendarDays()}
          </div>

          {/* Interactive summary for selected date */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 min-h-[90px] flex flex-col justify-center">
            {loadingSummary ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-slate-500 font-bold">Querying stats...</span>
              </div>
            ) : dateSummary ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    dateSummary.isMarked 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {dateSummary.isMarked ? 'Registers Taken' : 'Pending'}
                  </span>
                </div>

                {dateSummary.isMarked ? (
                  <div className="grid grid-cols-4 gap-2 pt-0.5 text-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Rate</span>
                      <span className="text-xs font-bold text-slate-800 mt-1 leading-none">{dateSummary.rate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Pres</span>
                      <span className="text-xs font-bold text-emerald-600 mt-1 leading-none">{dateSummary.present}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Late</span>
                      <span className="text-xs font-bold text-amber-600 mt-1 leading-none">{dateSummary.late}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Abs</span>
                      <span className="text-xs font-bold text-rose-600 mt-1 leading-none">{dateSummary.absent}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-1 text-slate-500">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold">No attendance records logged for this day.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1 text-amber-600">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Failed to load statistics for this date.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
