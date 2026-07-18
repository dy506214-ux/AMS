'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Users, Clock, Calendar, CheckCircle2, AlertCircle, HelpCircle, 
  MapPin, Mail, Phone, GraduationCap, Award, FileText, Sparkles, BookMarked,
  Printer, X, Eye, ArrowRight, User, Search
} from 'lucide-react';
import Link from 'next/link';

interface SubjectClass {
  subjectName: string;
  subjectCode: string;
  description: string;
  teacherName: string;
  teacherPhoto: string;
  teacherEmail: string;
  teacherPhone: string;
  teacherDesignation: string;
  class: string;
  section: string;
  roomNumber: string;
  lectureTime: string;
  duration: string;
  day: string;
  attendancePercentage: number;
  teacherId: string;
}

interface StudentClassesClientProps {
  student: {
    name: string;
    class: string;
    section: string;
    photoUrl: string;
    rollNumber: string;
  };
  subjectClasses: SubjectClass[];
}

export default function StudentClassesClient({ student, subjectClasses }: StudentClassesClientProps) {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'cards' | 'grid'>('grid'); // Default to grid matching screenshot
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState<'all' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Modals States
  const [selectedTeacher, setSelectedTeacher] = useState<SubjectClass | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectClass | null>(null);
  const [showTimetableModal, setShowTimetableModal] = useState<boolean>(false);

  // Dynamic date/time helper for current lectures
  const todayName = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  }, []);

  // Filtered Cards
  const filteredClasses = useMemo(() => {
    return subjectClasses.filter(c => {
      const matchesSearch = c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDay = dayFilter === 'all' || c.day === dayFilter;
      const matchesTeacher = teacherFilter === 'all' || c.teacherName === teacherFilter;
      const matchesSubject = subjectFilter === 'all' || c.subjectName === subjectFilter;

      return matchesSearch && matchesDay && matchesTeacher && matchesSubject;
    });
  }, [subjectClasses, searchQuery, dayFilter, teacherFilter, subjectFilter]);

  // Unique lists for filters
  const uniqueTeachers = useMemo(() => {
    return Array.from(new Set(subjectClasses.map(c => c.teacherName)));
  }, [subjectClasses]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(subjectClasses.map(c => c.subjectName)));
  }, [subjectClasses]);

  // Statistics Calculations
  const totalSubjects = subjectClasses.length;
  const totalTeachers = uniqueTeachers.length;
  const weeklyPeriods = 42; // 7 periods * 6 days
  const todayClassesCount = todayName === 'Sun' ? 0 : 6; // 6 classes + 1 break daily

  // Mappings for weekly periods inside left table
  const periodsMap = [7, 6, 6, 5, 4, 3, 2];
  const totalWeeklyPeriods = periodsMap.reduce((a, b) => a + b, 0);

  // Deterministic details for Teacher Modal based on name hash
  const getTeacherModalDetails = (tc: SubjectClass) => {
    const hash = tc.teacherName.charCodeAt(0) + tc.teacherName.charCodeAt(tc.teacherName.length - 1);
    
    const qualifications = ['Ph.D. in Education & Pedagogy', 'M.Sc. in Physics & Mathematics', 'M.A. in English Literature', 'M.Tech. in Computer Science', 'M.Sc. in Biological Sciences'];
    const experienceYears = (hash % 15) + 5;
    const department = tc.subjectName.includes('Math') || tc.subjectName.includes('Physics') || tc.subjectName.includes('Science') 
      ? 'Department of Natural Sciences' 
      : tc.subjectName.includes('English') || tc.subjectName.includes('Hindi') || tc.subjectName.includes('Sanskrit')
      ? 'Department of Languages & Humanities'
      : 'Department of Applied Sciences & Tech';

    const hours = ['Mon, Wed 10:00 AM - 12:00 PM', 'Tue, Thu 02:00 PM - 04:00 PM', 'Wednesday 01:00 PM - 03:00 PM', 'Friday 09:30 AM - 11:30 AM'];

    return {
      qualification: qualifications[hash % qualifications.length],
      experience: `${experienceYears} Years`,
      department,
      officeHours: hours[hash % hours.length]
    };
  };

  // Deterministic details for Subject Modal based on name hash
  const getSubjectModalDetails = (sc: SubjectClass) => {
    const hash = sc.subjectName.charCodeAt(0) + sc.subjectName.charCodeAt(sc.subjectName.length - 1);
    
    const books = [
      'NCERT Textbook & Reference Exemplar Solutions',
      'Advanced Concepts in Applied Sciences, Pearson',
      'Oxford Communicative English & Grammatics Workbook',
      'Principles of Modern Computational Architectures, McGraw-Hill',
      'Foundations of Modern History & Geopolitical Structures'
    ];
    
    const syllabi = [
      ['Unit 1: Foundations & Fundamentals', 'Unit 2: Conceptual Methodologies', 'Unit 3: Applied Structural Analysis', 'Unit 4: Case Studies & Projects', 'Unit 5: Revision & Final Assessments'],
      ['Unit 1: Theory of Relativity', 'Unit 2: Organic Formulations', 'Unit 3: Human Anatomy & Physiology', 'Unit 4: Ecological Balance', 'Unit 5: Practical Exercises'],
      ['Unit 1: Language Syntax', 'Unit 2: Prose & Poetry Studies', 'Unit 3: Creative Writing Skills', 'Unit 4: Dramatic Arts', 'Unit 5: Oral Communication Exam']
    ];

    const credits = (hash % 2) + 4; // 4 or 5 credits

    return {
      syllabus: syllabi[hash % syllabi.length],
      book: books[hash % books.length],
      assignmentsCount: (hash % 4) + 1,
      upcomingTests: `Unit Test 2 scheduled on July ${22 + (hash % 8)}, 2026`,
      credits
    };
  };

  // Timetable helper matching the screenshot layout
  const timetableGrid = useMemo(() => {
    const periods = [
      { id: 1, time: '08:30 - 09:20' },
      { id: 2, time: '09:20 - 10:10' },
      { id: 3, time: '10:10 - 11:00' },
      { id: 4, time: '11:15 - 12:05' },
      { id: 5, time: '12:05 - 12:55' },
      { id: 6, time: '12:55 - 01:45' },
      { id: 7, time: '01:45 - 02:30' }
    ];

    const names = subjectClasses.map(c => c.subjectName);
    
    // Map periods to subjects for each day
    // Shorthands: Math, Sci, Eng, S.St, Hindi, Comp, P.E.
    const mapShorthand = (fullName: string) => {
      if (fullName.includes('Math')) return 'Math';
      if (fullName.includes('Science')) return 'Sci';
      if (fullName.includes('English')) return 'Eng';
      if (fullName.includes('Social') || fullName.includes('EVS')) return 'S.St';
      if (fullName.includes('Hindi')) return 'Hindi';
      if (fullName.includes('Computer')) return 'Comp';
      if (fullName.includes('Physical') || fullName.includes('PE')) return 'P.E.';
      return fullName.substring(0, 4);
    };

    const getCellSubject = (period: number, dayIdx: number) => {
      // dayIdx: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat
      const n = names.length;
      if (n === 0) return '';
      
      // Fixed layout matching screenshot rotation
      if (period === 1) {
        return names[[0, 2, 1, 0, 2, 1][dayIdx] % n];
      }
      if (period === 2) {
        return names[[1, 0, 2, 1, 0, 2][dayIdx] % n];
      }
      if (period === 3) {
        return names[[2, 1, 0, 2, 1, 0][dayIdx] % n];
      }
      if (period === 4) {
        if (dayIdx === 4) return names[5 % n]; // Comp
        return names[[3, 4, 3, 4, 3, 3][dayIdx] % n]; // S.St or Hindi
      }
      if (period === 5) {
        if (dayIdx === 5) return names[5 % n]; // Comp
        return names[[4, 3, 4, 3, 4, 4][dayIdx] % n]; // Hindi or S.St
      }
      if (period === 6) {
        if (dayIdx === 5) return 'Library';
        return names[[5, 6, 5, 6, 6, 5][dayIdx] % n]; // Comp or PE
      }
      if (period === 7) {
        if (dayIdx === 1 || dayIdx === 3) return 'Comp Lab';
        if (dayIdx === 5) return names[6 % n]; // PE
        return 'Library';
      }
      return '';
    };

    return periods.map(p => ({
      ...p,
      days: Array.from({ length: 6 }, (_, idx) => {
        const fullSubject = getCellSubject(p.id, idx);
        return {
          fullName: fullSubject,
          shorthand: mapShorthand(fullSubject)
        };
      })
    }));
  }, [subjectClasses]);

  // Color mappings for timetable legend & badges
  const subjectColors: Record<string, { bg: string, text: string, border: string, badge: string }> = {
    'Math': { bg: 'bg-blue-50/50', text: 'text-blue-600', border: 'border-blue-100', badge: 'bg-blue-500' },
    'Sci': { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', badge: 'bg-emerald-500' },
    'Eng': { bg: 'bg-purple-50/50', text: 'text-purple-600', border: 'border-purple-100', badge: 'bg-purple-500' },
    'S.St': { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', badge: 'bg-amber-500' },
    'Hindi': { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100', badge: 'bg-rose-500' },
    'Comp': { bg: 'bg-sky-50/50', text: 'text-sky-600', border: 'border-sky-100', badge: 'bg-sky-500' },
    'P.E.': { bg: 'bg-teal-50/50', text: 'text-teal-600', border: 'border-teal-100', badge: 'bg-teal-500' },
    'Library': { bg: 'bg-slate-50/50', text: 'text-slate-500', border: 'border-slate-100', badge: 'bg-slate-400' },
    'Comp Lab': { bg: 'bg-indigo-50/50', text: 'text-indigo-600', border: 'border-indigo-100', badge: 'bg-indigo-500' }
  };

  // Status calculation for each subject card
  const getLectureStatus = (c: SubjectClass) => {
    if (c.day !== todayName) return 'Upcoming';
    
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    // Parse lectureTime (e.g., "08:30 AM - 09:15 AM")
    const match = c.lectureTime.match(/(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/);
    if (!match) return 'Upcoming';

    let startHr = parseInt(match[1]);
    const startMin = parseInt(match[2]);
    const startAmpm = match[3];
    let endHr = parseInt(match[4]);
    const endMin = parseInt(match[5]);
    const endAmpm = match[6];

    if (startAmpm === 'PM' && startHr !== 12) startHr += 12;
    if (startAmpm === 'AM' && startHr === 12) startHr = 0;
    if (endAmpm === 'PM' && endHr !== 12) endHr += 12;
    if (endAmpm === 'AM' && endHr === 12) endHr = 0;

    const startTotal = startHr * 60 + startMin;
    const endTotal = endHr * 60 + endMin;

    if (currentMin < startTotal) return 'Upcoming';
    if (currentMin >= startTotal && currentMin <= endTotal) return 'Ongoing';
    return 'Completed';
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 text-slate-800 animate-fadeIn">
      
      {/* 1. Page Title Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <Link href="/student" className="hover:text-slate-600 transition-colors">Student Portal</Link>
            <span>/</span>
            <span className="text-slate-500">Classes</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            My Classes
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-450 mt-1">View all your assigned classes, subjects, teachers and class schedule.</p>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Subjects */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Subjects</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{totalSubjects}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">In Your Class</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Teachers</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{totalTeachers}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">Subject Teachers</span>
          </div>
        </div>

        {/* Total Periods */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Periods</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{weeklyPeriods}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">Per Week</span>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Today's Classes</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{todayClassesCount}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">Periods Scheduled</span>
          </div>
        </div>
      </div>

      {/* 3. Class Information Card Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-slate-900/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Class Information</h3>
            <p className="text-xs text-slate-450 mt-1 flex flex-wrap gap-x-2 font-semibold">
              <span>Class {student.class} – Section {student.section}</span>
              <span className="text-slate-200">•</span>
              <span>Academic Year 2026</span>
              <span className="text-slate-200">•</span>
              <span>Roll No. {parseInt(student.rollNumber)}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowTimetableModal(true)}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-blue-600" /> View Time Table
        </button>
      </div>

      {/* 4. Tab selection switcher */}
      <div className="flex border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('grid')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'grid' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Timetable Overview
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'cards' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Subject Cards
        </button>
      </div>

      {/* Tab 1: Subject Cards Grid View */}
      {activeTab === 'cards' && (
        <div className="flex flex-col gap-6">
          {/* Filters inside Tab */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-wrap gap-4 items-center">
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by subject, teacher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={dayFilter}
                onChange={e => setDayFilter(e.target.value as any)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-650 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Days</option>
                <option value="Mon">Monday</option>
                <option value="Tue">Tuesday</option>
                <option value="Wed">Wednesday</option>
                <option value="Thu">Thursday</option>
                <option value="Fri">Friday</option>
                <option value="Sat">Saturday</option>
              </select>

              <select
                value={teacherFilter}
                onChange={e => setTeacherFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-650 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Teachers</option>
                {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-650 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((c, idx) => {
                const status = getLectureStatus(c);
                const attColor = c.attendancePercentage >= 85 ? 'text-emerald-600' : c.attendancePercentage >= 75 ? 'text-amber-600' : 'text-rose-600';
                
                // Color gradients based on index
                const gradients = [
                  'from-blue-600 to-indigo-700',
                  'from-emerald-600 to-teal-700',
                  'from-purple-600 to-fuchsia-700',
                  'from-amber-500 to-orange-600',
                  'from-rose-500 to-pink-600',
                  'from-sky-500 to-blue-600',
                  'from-teal-500 to-emerald-600'
                ];
                const cardGradient = gradients[idx % gradients.length];

                return (
                  <div key={c.subjectCode} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:translate-y-[-2px] transition-all">
                    
                    {/* Card Header (Gradient with title & code) */}
                    <div className={`p-4 bg-gradient-to-r ${cardGradient} text-white flex justify-between items-start shrink-0`}>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black tracking-widest uppercase opacity-75">{c.subjectCode}</span>
                        <h4 className="text-sm font-black truncate mt-0.5 leading-tight">{c.subjectName}</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider border border-white/20 bg-white/10 ${
                        status === 'Ongoing' ? 'animate-pulse text-yellow-300' : ''
                      }`}>
                        {status}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col gap-4 flex-1">
                      
                      {/* Teacher summary */}
                      <div className="flex items-center gap-3">
                        <img
                          src={c.teacherPhoto}
                          alt={c.teacherName}
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-800 leading-tight">{c.teacherName}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{c.teacherDesignation}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed italic">{c.description}</p>

                      {/* Class Details Grid */}
                      <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3 text-[11px] font-semibold text-slate-650">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Room {c.roomNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.lectureTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.day} ({c.duration})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookMarked className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.class}–{c.section}</span>
                        </div>
                      </div>

                      {/* Attendance Percentage Indicator */}
                      <div className="border-t border-slate-50 pt-3.5 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                          <span className={`font-black ${attColor}`}>{c.attendancePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              c.attendancePercentage >= 85 ? 'bg-emerald-500' : c.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${c.attendancePercentage}%` }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Card Footer Actions */}
                    <div className="bg-slate-50/50 p-3.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedTeacher(c)}
                        className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Teacher Info
                      </button>
                      <button
                        onClick={() => setSelectedSubject(c)}
                        className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Subject Info
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-slate-400 font-bold">
                No classes found matching the query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Timetable Grid View (Matching the Screenshot Layout) */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Subjects & Teachers List */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">Subjects & Teachers</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">View all subjects, teachers and weekly periods</p>
            </div>

            <div className="flex flex-col gap-3">
              {subjectClasses.map((c, idx) => {
                const colors = [
                  'bg-blue-500/10 text-blue-600',
                  'bg-emerald-500/10 text-emerald-600',
                  'bg-purple-500/10 text-purple-600',
                  'bg-amber-500/10 text-amber-600',
                  'bg-rose-500/10 text-rose-600',
                  'bg-sky-500/10 text-sky-600',
                  'bg-teal-500/10 text-teal-600'
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={c.subjectCode} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      
                      {/* Name & Teacher */}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-850 truncate">{c.subjectName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <img
                            src={c.teacherPhoto}
                            alt={c.teacherName}
                            className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                          />
                          <span className="text-[10px] text-slate-455 font-bold truncate">{c.teacherName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Periods and Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Weekly</span>
                        <span className="text-xs font-black text-slate-700 mt-0.5">{periodsMap[idx % periodsMap.length]}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedTeacher(c)}
                          className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 text-slate-450 hover:text-slate-650 rounded-lg transition-all cursor-pointer"
                          title="View Teacher Profile"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedSubject(c)}
                          className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 text-slate-450 hover:text-slate-650 rounded-lg transition-all cursor-pointer"
                          title="View Syllabus & Books"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total count Footer */}
            <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-455">
              <span>Total Weekly Periods</span>
              <span className="text-xs font-extrabold text-slate-800">{totalWeeklyPeriods} Periods</span>
            </div>

          </div>

          {/* Right Column: Weekly Timetable Overview */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">Weekly Timetable Overview</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Your class timetable for the week</p>
            </div>

            {/* Timetable Table Grid */}
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-[9px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-3 border-r border-slate-150">Period</th>
                    <th className="py-3 px-3 border-r border-slate-150">Time</th>
                    <th className="py-3 px-2 border-r border-slate-150">Mon</th>
                    <th className="py-3 px-2 border-r border-slate-150">Tue</th>
                    <th className="py-3 px-2 border-r border-slate-150">Wed</th>
                    <th className="py-3 px-2 border-r border-slate-150">Thu</th>
                    <th className="py-3 px-2 border-r border-slate-150">Fri</th>
                    <th className="py-3 px-2">Sat</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-bold text-slate-700">
                  {timetableGrid.map((row, idx) => {
                    
                    // Add recess slot after period 3
                    const insertBreak = idx === 3;
                    
                    return (
                      <React.Fragment key={row.id}>
                        {insertBreak && (
                          <tr className="bg-slate-50/30 border-b border-slate-150 font-black text-[9px] tracking-widest text-slate-450 uppercase">
                            <td colSpan={2} className="py-2 px-3 border-r border-slate-150 text-center">
                              11:00 - 11:15
                            </td>
                            <td colSpan={6} className="py-2 px-3 text-center flex items-center justify-center gap-1.5">
                              ☕ Break
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-150 last:border-0 hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-3 border-r border-slate-150 font-extrabold text-slate-450 bg-slate-50/20">{row.id}</td>
                          <td className="py-3 px-3 border-r border-slate-150 font-mono text-[9px] font-semibold text-slate-500 whitespace-nowrap">{row.time}</td>
                          
                          {row.days.map((day, dIdx) => {
                            const scColor = subjectColors[day.shorthand] || { bg: 'bg-white', text: 'text-slate-650' };
                            return (
                              <td 
                                key={dIdx} 
                                className={`py-3 px-1.5 border-r border-slate-150 last:border-r-0 ${scColor.bg} ${scColor.text} font-black`}
                              >
                                {day.shorthand}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Colors Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2.5 pt-3.5 border-t border-slate-50 justify-center">
              {Object.keys(subjectColors).map(key => (
                <div key={key} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${subjectColors[key].badge}`} />
                  <span>{key}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* 5. Timetable Modal */}
      {showTimetableModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh] my-8 animate-scaleUp">
            
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-black text-slate-800">Weekly Lecture Schedule Timetable</span>
              </div>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-455 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Detailed schedule table */}
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] uppercase tracking-wider font-black text-slate-400 bg-slate-50 py-3">
                      <th className="py-3 px-3 border-r border-slate-150">Period</th>
                      <th className="py-3 px-3 border-r border-slate-150">Time</th>
                      <th className="py-3 px-3 border-r border-slate-150">Monday</th>
                      <th className="py-3 px-3 border-r border-slate-150">Tuesday</th>
                      <th className="py-3 px-3 border-r border-slate-150">Wednesday</th>
                      <th className="py-3 px-3 border-r border-slate-150">Thursday</th>
                      <th className="py-3 px-3 border-r border-slate-150">Friday</th>
                      <th className="py-3 px-3">Saturday</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-bold text-slate-750">
                    {timetableGrid.map((row, idx) => {
                      const insertBreak = idx === 3;
                      
                      return (
                        <React.Fragment key={row.id}>
                          {insertBreak && (
                            <tr className="bg-slate-50/50 border-b border-slate-150 font-black text-[10px] tracking-widest text-slate-450 uppercase">
                              <td colSpan={2} className="py-2.5 px-3 border-r border-slate-150 text-center">
                                11:00 AM - 11:15 AM
                              </td>
                              <td colSpan={6} className="py-2.5 px-3 text-center">
                                ☕ Lunch / Recess Break
                              </td>
                            </tr>
                          )}
                          <tr className="border-b border-slate-150 last:border-0 hover:bg-slate-50/30 transition-colors">
                            <td className="py-3 px-3 border-r border-slate-150 font-extrabold text-slate-450 bg-slate-50/20">{row.id}</td>
                            <td className="py-3 px-3 border-r border-slate-150 font-mono text-[10px] font-semibold text-slate-500 whitespace-nowrap">{row.time}</td>
                            
                            {row.days.map((day, dIdx) => {
                              const scColor = subjectColors[day.shorthand] || { bg: 'bg-white', text: 'text-slate-650' };
                              return (
                                <td 
                                  key={dIdx} 
                                  className={`py-3 px-3 border-r border-slate-150 last:border-r-0 ${scColor.bg} ${scColor.text} font-black`}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="font-black text-xs leading-none">{day.shorthand}</span>
                                    {day.fullName !== 'Library' && day.fullName !== 'Comp Lab' && (
                                      <span className="text-[8px] text-slate-400 font-semibold mt-1">Room {student.class}0{dIdx + 1}</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowTimetableModal(false)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-650 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Close Timetable
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Teacher Detail Modal */}
      {selectedTeacher && (() => {
        const details = getTeacherModalDetails(selectedTeacher);
        
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden animate-scaleUp">
              
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex justify-between items-center shrink-0">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Teacher Profile Details</span>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="p-1.5 hover:bg-slate-200 text-slate-455 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-5">
                
                {/* Profile header */}
                <div className="flex gap-4 items-center border-b border-slate-50 pb-4">
                  <img
                    src={selectedTeacher.teacherPhoto}
                    alt={selectedTeacher.teacherName}
                    className="w-16 h-16 rounded-full border border-slate-200 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-slate-900 leading-tight">{selectedTeacher.teacherName}</h4>
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1 block">{selectedTeacher.teacherDesignation}</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="flex flex-col gap-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1">Qualification</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1">{details.qualification}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1.5">Experience</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1.5">{details.experience}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1.5">Department</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1.5">{details.department}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1.5">Email</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1.5 break-all">{selectedTeacher.teacherEmail}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1.5">Phone</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1.5 font-mono">{selectedTeacher.teacherPhone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-50">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] py-1.5">Office Hours</span>
                    <span className="col-span-2 font-extrabold text-slate-700 py-1.5">{details.officeHours}</span>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-650 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 7. Subject Detail Modal */}
      {selectedSubject && (() => {
        const details = getSubjectModalDetails(selectedSubject);
        
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden animate-scaleUp">
              
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3.5 flex justify-between items-center shrink-0">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Subject Syllabus & Curriculum</span>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="p-1.5 hover:bg-slate-200 text-slate-455 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-4 overflow-y-auto">
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">{selectedSubject.subjectName}</h4>
                  <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1 block">Course Code: {selectedSubject.subjectCode}</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Course Syllabus</span>
                    <ul className="list-disc pl-5 font-bold text-slate-700 flex flex-col gap-1 mt-1 leading-normal">
                      {details.syllabus.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-slate-50 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recommended Textbook</span>
                    <span className="font-extrabold text-slate-750 mt-1 leading-relaxed">{details.book}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-center">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex flex-col items-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Course Credits</span>
                      <span className="text-sm font-black text-slate-800 mt-1">{details.credits} Credits</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex flex-col items-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Pending Assignments</span>
                      <span className="text-sm font-black text-amber-600 mt-1">{details.assignmentsCount} Due</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex flex-col text-[11px]">
                    <span className="text-[8px] font-black text-blue-700 uppercase tracking-wider">Upcoming Assessment</span>
                    <span className="font-extrabold text-slate-850 mt-1 leading-normal">{details.upcomingTests}</span>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-655 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
