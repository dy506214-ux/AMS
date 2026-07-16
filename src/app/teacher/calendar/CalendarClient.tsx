'use client';

import React, { useState, useEffect } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-16'); // Default to Today
  const [dateSummary, setDateSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  // Fetch summary for selected date
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

  // Construct schedule list for the selected date
  const mockSubjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Computer Science'];
  const getDailySchedule = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    if (day === 0 || day === 6 || classesAndSections.length === 0) return []; // Weekends no classes
    
    // Construct 4 classes for weekdays
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

  // Calendar cells builder (July 2026)
  const renderCalendarDays = () => {
    const daysInMonth = 31;
    const startDayOfWeek = 3; // Wednesday (0=Sun, 1=Mon, 2=Tue, 3=Wed)
    const days = [];

    // Empty spaces for padding
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(
        <div key={`pad-${i}`} className="min-h-[100px] border border-slate-100 bg-slate-50/50 p-2" />
      );
    }

    // Days 1 to 31
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `2026-07-${String(d).padStart(2, '0')}`;
      const isToday = d === 16;
      const isSelected = selectedDate === dateStr;
      const dayOfWeek = (d + startDayOfWeek - 2) % 7; // 0 = Mon, 5 = Sat, 6 = Sun
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const hasRecord = d <= 14 && !isWeekend;

      days.push(
        <div
          key={`cal-grid-day-${d}`}
          onClick={() => setSelectedDate(dateStr)}
          className={`min-h-[100px] border border-slate-100 p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
            isSelected 
              ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/10' 
              : isToday
                ? 'bg-blue-50/20 border-blue-300'
                : 'hover:bg-slate-50 bg-white'
          }`}
        >
          {/* Day number */}
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : isToday
                  ? 'bg-blue-100 text-blue-600'
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
                  90% Rate
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar & Schedules</h2>
        <p className="text-sm text-slate-500 mt-1">Review monthly class grids, log timelines, and verify attendance rates</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Full Screen Grid */}
        <div className="xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Calendar top controls */}
          <div className="flex justify-between items-center p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">July 2026</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Grid</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3.5 py-2 hover:bg-slate-150 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer">
                Today
              </button>
              <button className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Days Headers */}
          <div className="grid grid-cols-7 text-center font-bold text-slate-500 text-[10px] uppercase bg-slate-50 border-b border-slate-100 py-3 tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Right Side: Day Details panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Selected Date Summary Header */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inspecting Day</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Attendance Status */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 min-h-[90px] flex flex-col justify-center">
              {loadingSummary ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-xs text-slate-500 font-bold">Querying stats...</span>
                </div>
              ) : dateSummary ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-250 pb-2">
                    <span className="text-xs font-extrabold text-slate-800">Attendance Summary</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dateSummary.isMarked 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {dateSummary.isMarked ? 'Registers Taken' : 'Pending'}
                    </span>
                  </div>

                  {dateSummary.isMarked ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Rate</span>
                          <span className="text-sm font-extrabold text-slate-800 mt-1">{dateSummary.rate}%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Present</span>
                          <span className="text-sm font-extrabold text-emerald-600 mt-1">{dateSummary.present}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Late</span>
                          <span className="text-sm font-extrabold text-amber-600 mt-1">{dateSummary.late}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase leading-none">Absent</span>
                          <span className="text-sm font-extrabold text-rose-600 mt-1">{dateSummary.absent}</span>
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
                  ) : (
                    <div className="flex items-center gap-2.5 text-slate-500 py-1">
                      <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold">No attendance records registered for this day yet.</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-red-500 font-bold">Failed to load statistics.</span>
              )}
            </div>

            {/* Quick Link to attendance register */}
            <Link 
              href="/teacher/attendance"
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs"
            >
              <span>{dateSummary?.isMarked ? 'Edit Attendance Register' : 'Mark Today\'s Attendance'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Selected Date Schedule List */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Scheduled periods</span>
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
                  <ClipboardCheck className="w-8 h-8 text-slate-350" />
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
