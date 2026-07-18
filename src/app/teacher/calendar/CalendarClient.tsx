'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  ClipboardCheck, 
  Loader2, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface CalendarClientProps {
  classesAndSections: { class: string; section: string }[];
}

export default function CalendarClient({ classesAndSections }: CalendarClientProps) {
  // Real-Time Calendar Date Navigation States
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-indexed (1-12)
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const [monthlySummaries, setMonthlySummaries] = useState<any>({});
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);

  // Fetch full month attendance summaries in batch
  const fetchMonthSummaries = async (year: number, month: number) => {
    setLoadingCalendar(true);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/teacher/attendance-summary?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlySummaries(data.dailySummaries || {});
      } else {
        setMonthlySummaries({});
      }
    } catch {
      setMonthlySummaries({});
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    fetchMonthSummaries(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Construct schedule list for the selected date
  const mockSubjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'];
  const getDailySchedule = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay();
    if (day === 0 || day === 6 || classesAndSections.length === 0) return []; // Weekends no classes
    
    const schedule = [];
    const times = [
      { start: '08:30 AM', end: '09:15 AM' },
      { start: '09:30 AM', end: '10:15 AM' },
      { start: '11:00 AM', end: '11:45 AM' },
      { start: '01:00 PM', end: '01:45 PM' }
    ];

    for (let i = 0; i < 4; i++) {
      const sec = classesAndSections[i % classesAndSections.length];
      const subject = mockSubjects[(i + day) % mockSubjects.length];
      schedule.push({
        id: `sched-slot-${i}`,
        className: `Class ${sec.class}${sec.section}`,
        subject,
        time: `${times[i].start} - ${times[i].end}`
      });
    }
    return schedule;
  };

  const selectedSchedule = getDailySchedule(selectedDate);

  // Month navigation actions
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    setCurrentYear(y);
    setCurrentMonth(m);
    setSelectedDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar cells builder (Dynamic Grid)
  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    // getDay() of 1st day (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Monday is the first header, so adjust Sunday to index 6
    const adjustedStartDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const days = [];

    // Empty spaces for padding before the 1st of the month
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(
        <div key={`pad-${i}`} className="min-h-[100px] border border-slate-100 bg-slate-50/50 p-2" />
      );
    }

    // Days 1 to daysInMonth
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSystemToday = today.getFullYear() === currentYear && 
                            (today.getMonth() + 1) === currentMonth && 
                            today.getDate() === d;
      const isSelected = selectedDate === dateStr;
      
      const dayOfWeek = new Date(currentYear, currentMonth - 1, d).getDay(); // 0=Sun, 6=Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const summary = monthlySummaries[dateStr];
      const hasRecord = summary ? summary.isMarked : false;
      const attendanceRate = summary ? summary.rate : 0;

      days.push(
        <div
          key={`cal-grid-day-${d}`}
          onClick={() => setSelectedDate(dateStr)}
          className={`min-h-[100px] border border-slate-100 p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
            isSelected 
              ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/10' 
              : isSystemToday
                ? 'bg-blue-50/20 border-blue-300 font-bold'
                : 'hover:bg-slate-50 bg-white'
          }`}
        >
          {/* Day number */}
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : isSystemToday
                  ? 'bg-blue-100 text-blue-600 font-black'
                  : 'text-slate-800'
            }`}>
              {d}
            </span>

            {/* Attendance Indicator Dot */}
            {hasRecord && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </div>

          {/* Quick Info inside cell */}
          {!isWeekend ? (
            <div className="flex flex-col gap-1 mt-2">
              {/* Scheduled classes count */}
              {classesAndSections.length > 0 && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-blue-500" />
                  <span>4 Classes</span>
                </div>
              )}
              {/* Attendance percentage indicator if record exists */}
              {hasRecord && (
                <div className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100/50 w-fit leading-none">
                  {attendanceRate}% Rate
                </div>
              )}
            </div>
          ) : (
            <span className="text-[8px] font-bold text-slate-400 uppercase mt-auto tracking-wider">Weekend</span>
          )}
        </div>
      );
    }

    return days;
  };

  // Get date summary details for right sidebar inspector
  const dateSummary = monthlySummaries[selectedDate] || null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Calendar & Schedules
          </h2>
          <p className="text-xs text-slate-450 mt-1">Review monthly class grids, log timelines, and verify attendance rates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Full Screen Grid */}
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Calendar top controls */}
          <div className="flex justify-between items-center p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl">
                <CalendarIcon className="w-5 h-5 animate-pulse animate-duration-1500" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Grid</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleToday}
                className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer bg-white"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Days Headers */}
          <div className="grid grid-cols-7 text-center font-extrabold text-slate-400 text-[10px] uppercase bg-slate-50 border-b border-slate-100 py-3 tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-0 relative">
            {loadingCalendar && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {renderCalendarDays()}
          </div>
        </div>

        {/* Right Side: Day Details panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Selected Date Summary Header */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inspecting Day</span>
              <span className="text-base font-black text-slate-900 mt-1 block">
                {(() => {
                  const parts = selectedDate.split('-');
                  const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  return dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                })()}
              </span>
            </div>

            {/* Attendance Status */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
              {dateSummary ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Summary</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Registers Taken
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Rate</span>
                        <span className="text-sm font-extrabold text-slate-800 mt-1.5">{dateSummary.rate}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Present</span>
                        <span className="text-sm font-extrabold text-emerald-600 mt-1.5">{dateSummary.present}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Late</span>
                        <span className="text-sm font-extrabold text-amber-600 mt-1.5">{dateSummary.late}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Absent</span>
                        <span className="text-sm font-extrabold text-rose-600 mt-1.5">{dateSummary.absent}</span>
                      </div>
                    </div>

                    {/* Visual progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${dateSummary.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-slate-500 py-1">
                  <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500">No attendance records registered for this day yet.</span>
                </div>
              )}
            </div>

            {/* Quick Link to attendance register */}
            <Link 
              href={`/teacher/attendance`}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs"
            >
              <span>{dateSummary ? 'Edit Attendance Register' : 'Mark Today\'s Attendance'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Selected Date Schedule List */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Scheduled periods</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">Class Hours Breakdown</span>
            </div>

            <div className="flex flex-col gap-3">
              {selectedSchedule.length > 0 ? (
                selectedSchedule.map((c, idx) => (
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

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-700">{c.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-bold flex flex-col gap-2 items-center bg-slate-50/50 rounded-xl border border-slate-100">
                  <ClipboardCheck className="w-8 h-8 text-slate-300" />
                  <span>No scheduled classes for this day (Weekend/Holiday).</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
