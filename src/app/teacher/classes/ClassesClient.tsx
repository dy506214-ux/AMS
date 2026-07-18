'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, GraduationCap, Users, Calendar, ArrowRight, Search, 
  Filter, Grid, List, Plus, Mail, Phone, Clock, Landmark, User,
  CheckCircle, FileSpreadsheet, Printer, RefreshCw, X, HelpCircle, 
  ChevronRight, ChevronLeft, BookMarked, Download, Info, Sparkles
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  photoUrl: string;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  employeeId: string;
}

interface Slot {
  id: string;
  classId: string;
  sectionId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
}

interface ClassesClientProps {
  assignedStudents: Student[];
  classesAndSections: { class: string; section: string }[];
  teacherProfile: TeacherProfile | null;
  todaySlots: Slot[];
}

export default function ClassesClient({ 
  assignedStudents, 
  classesAndSections, 
  teacherProfile, 
  todaySlots 
}: ClassesClientProps) {
  const { showToast } = useToast();
  
  // UI layouts & filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  
  // Modals / Overlays
  const [selectedClassCard, setSelectedClassCard] = useState<{ class: string; section: string } | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Student modal search & pagination
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 6;

  // More menu state
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // Dynamic calculations
  const totalClassesCount = classesAndSections.length;
  const totalStudentsCount = assignedStudents.length;

  const dynamicSubjects = useMemo(() => {
    return {
      '1': ['Mathematics', 'English', 'EVS'],
      '2': ['Mathematics', 'Hindi', 'Science'],
      '3': ['Mathematics', 'Science', 'Social Studies'],
      '4': ['Mathematics', 'Science', 'English', 'Hindi'],
      '5': ['Mathematics', 'Science', 'Social Studies', 'English', 'Sanskrit']
    };
  }, []);

  const getSubjectsForClass = (classId: string): string[] => {
    return dynamicSubjects[classId as keyof typeof dynamicSubjects] || ['Mathematics', 'Science', 'English'];
  };

  const totalSubjectsCount = useMemo(() => {
    const allSubjects = new Set<string>();
    classesAndSections.forEach(c => {
      getSubjectsForClass(c.class).forEach(s => allSubjects.add(s));
    });
    return allSubjects.size || 3;
  }, [classesAndSections, getSubjectsForClass]);

  const todayClassesCount = todaySlots.length;

  // Determine gender deterministically
  const getGenderByName = (name: string): 'Male' | 'Female' => {
    const lowercase = name.toLowerCase();
    const femaleEndings = ['a', 'i', 'ee', 'ta', 'sha', 'ra', 'ma', 'ya', 'na'];
    const femaleNames = ['meera', 'tanisha', 'ishita', 'ananya', 'diya', 'ria', 'priya', 'sanjana', 'shruti', 'sneha', 'tanvi', 'aditi', 'kavya', 'neha', 'pooja', 'rhea'];
    const firstWord = lowercase.split(' ')[0];
    
    if (femaleNames.includes(firstWord)) return 'Female';
    if (femaleEndings.some(ending => firstWord.endsWith(ending))) {
      const maleExceptions = ['aditya', 'krishna', 'rama', 'shiva', 'surya', 'abhishek', 'alok', 'amit', 'anil', 'arjun', 'deepak', 'kartik', 'rahul', 'rohan', 'sachin', 'sanjay', 'vijay', 'vikram', 'vivek'];
      if (maleExceptions.includes(firstWord)) return 'Male';
      return 'Female';
    }
    return 'Male';
  };

  // Class card mapping helpers
  const getRoomNumber = (classId: string, sectionId: string): string => {
    const classNum = parseInt(classId) || 1;
    const secCode = sectionId.toUpperCase().charCodeAt(0) - 64; // A=1, B=2
    return `${classNum}0${secCode}`;
  };

  const getNextLectureTime = (classId: string, sectionId: string): string => {
    const slot = todaySlots.find(s => s.classId === classId && s.sectionId === sectionId);
    return slot ? slot.time : '09:30 AM';
  };

  const getSlotStatus = (classId: string, sectionId: string): 'Active' | 'Pending' | 'Completed' => {
    const slot = todaySlots.find(s => s.classId === classId && s.sectionId === sectionId);
    if (!slot) return 'Pending';
    return slot.status === 'completed' ? 'Completed' : 'Active';
  };

  // Filtered Class Cards
  const filteredClassCards = useMemo(() => {
    return classesAndSections.filter(c => {
      const matchesSearch = c.class.includes(searchQuery) || c.section.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || c.class === classFilter;
      const matchesSection = sectionFilter === 'all' || c.section === sectionFilter;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [classesAndSections, searchQuery, classFilter, sectionFilter]);

  // List of students in the selected class modal
  const modalStudentsList = useMemo(() => {
    if (!selectedClassCard) return [];
    return assignedStudents.filter(s => 
      s.class === selectedClassCard.class && 
      s.section === selectedClassCard.section &&
      (s.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || s.rollNumber.includes(modalSearchQuery))
    );
  }, [assignedStudents, selectedClassCard, modalSearchQuery]);

  const totalModalPages = Math.ceil(modalStudentsList.length / modalPageSize) || 1;
  const paginatedModalStudents = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize;
    return modalStudentsList.slice(start, start + modalPageSize);
  }, [modalStudentsList, modalPage]);

  // Actions
  const handleAddClassClick = () => {
    showToast('Class allocation is managed by the school administrator.', 'info');
  };

  const handleRefreshData = () => {
    showToast('Assigned class directory refreshed successfully.', 'success');
  };

  const handleDownloadCSV = (c: { class: string; section: string }) => {
    const studentsInClass = assignedStudents.filter(s => s.class === c.class && s.section === c.section);
    if (studentsInClass.length === 0) return;

    const headers = ['Roll No', 'Admission No', 'Name', 'Gender', 'Email', 'Phone'];
    const rows = studentsInClass.map(s => [
      s.rollNumber,
      s.id,
      s.name,
      getGenderByName(s.name),
      s.email,
      s.phone
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Class_${c.class}-${c.section}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student list downloaded as CSV.', 'success');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuIndex(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 text-slate-800 animate-fadeIn">
      
      {/* Title & Subtitle */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Classes
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-450 mt-1">View and manage all classes assigned to you.</p>
        </div>
      </div>

      {/* TOP STATISTICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Classes</span>
            <span className="text-2xl font-black text-slate-950 mt-1">{totalClassesCount}</span>
            <span className="text-[10px] text-slate-450 mt-0.5">Classes Allocated</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Students</span>
            <span className="text-2xl font-black text-slate-950 mt-1">{totalStudentsCount}</span>
            <span className="text-[10px] text-slate-450 mt-0.5">Students in all classes</span>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
            <BookMarked className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Subjects</span>
            <span className="text-2xl font-black text-slate-950 mt-1">{totalSubjectsCount}</span>
            <span className="text-[10px] text-slate-450 mt-0.5">Subjects Assigned</span>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Today's Classes</span>
            <span className="text-2xl font-black text-slate-950 mt-1">{todayClassesCount}</span>
            <span className="text-[10px] text-slate-450 mt-0.5">Classes Scheduled Today</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search classes, sections..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-colors"
          />
        </div>

        {/* Middle Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            {Array.from(new Set(classesAndSections.map(c => c.class))).map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Sections</option>
            {Array.from(new Set(classesAndSections.map(c => c.section))).map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          {/* Grid/List toggles */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add class button */}
          <button
            onClick={handleAddClassClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* ASSIGNED CLASSES CONTAINER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Your Assigned Classes</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
            {filteredClassCards.length} Allocated
          </span>
        </div>

        {filteredClassCards.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
              : 'flex flex-col gap-4'
          }>
            {filteredClassCards.map((c, index) => {
              const studentsInClass = assignedStudents.filter(s => s.class === c.class && s.section === c.section).length;
              const classTeacherName = teacherProfile?.name || 'Arjun Sharma';
              const roomNumber = getRoomNumber(c.class, c.section);
              const nextLectureTime = getNextLectureTime(c.class, c.section);
              const slotStatus = getSlotStatus(c.class, c.section);
              const subjectsList = getSubjectsForClass(c.class);

              // Cycle gradient colors dynamically
              const bgGradients = [
                'from-blue-600 to-indigo-700',
                'from-emerald-600 to-teal-700',
                'from-purple-600 to-violet-700'
              ];
              const badgeColors = [
                'bg-indigo-50 border-indigo-100 text-indigo-600',
                'bg-teal-50 border-teal-100 text-teal-600',
                'bg-violet-50 border-violet-100 text-violet-600'
              ];

              const currentGrad = bgGradients[index % 3];
              const currentBadge = badgeColors[index % 3];

              return (
                <div 
                  key={`${c.class}-${c.section}`}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                >
                  {/* Card Gradient Header Banner */}
                  <div className={`bg-gradient-to-r ${currentGrad} p-5 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-extrabold text-base tracking-tight leading-tight">Class {c.class}</h4>
                        <span className={`text-[9px] font-extrabold tracking-widest uppercase border rounded-md px-1.5 py-0.5 mt-1 border-white/20 bg-white/10 w-fit`}>
                          Section {c.section}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body content */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {/* Row 1 Stats */}
                    <div className="grid grid-cols-3 gap-2 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{studentsInClass} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookMarked className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{subjectsList.length} Subjects</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{nextLectureTime} Lecture</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-450">Daily Attendance Status</span>
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider border ${
                        slotStatus === 'Completed'
                          ? 'bg-slate-100 border-slate-200 text-slate-500'
                          : 'bg-emerald-50 border-emerald-150 text-emerald-600 animate-pulse'
                      }`}>
                        {slotStatus}
                      </span>
                    </div>

                    {/* Class Details Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3.5 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class Teacher</span>
                        <span className="font-extrabold text-slate-800 mt-1 leading-tight">{classTeacherName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Room Number</span>
                        <span className="font-extrabold text-slate-850 mt-1 leading-tight">{roomNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Academic Year</span>
                        <span className="font-extrabold text-slate-850 mt-1 leading-tight">2026</span>
                      </div>
                    </div>

                    {/* Subjects tags */}
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                      {subjectsList.map(sub => (
                        <span 
                          key={sub}
                          className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg border uppercase tracking-wider ${currentBadge}`}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer action bar */}
                  <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between gap-2 relative">
                    <Link
                      href={`/teacher/classes/view-students?class=${c.class}&section=${c.section}`}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 w-full justify-center"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" /> View Students
                    </Link>

                    <Link
                      href={`/teacher/attendance?class=${c.class}&section=${c.section}`}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 w-full justify-center"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mark Attendance
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedClassCard(c);
                        setShowDetailsModal(true);
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 w-full justify-center"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-500" /> Class Details
                    </button>

                    {/* More button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuIndex(activeMenuIndex === index ? null : index);
                        }}
                        className="bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      >
                        <span className="font-bold text-[11px] h-3.5 flex items-center">⋮</span>
                      </button>

                      {/* Dropdown Options */}
                      {activeMenuIndex === index && (
                        <div className="absolute right-0 bottom-12 w-48 bg-white border border-slate-150 rounded-xl shadow-lg p-2 z-30 flex flex-col gap-1 text-[10px] font-bold text-slate-700 animate-scaleUp">
                          <button
                            onClick={() => {
                              setSelectedClassCard(c);
                              setShowDetailsModal(true);
                            }}
                            className="text-left w-full hover:bg-slate-50 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> View Timetable
                          </button>
                          <button
                            onClick={() => handleDownloadCSV(c)}
                            className="text-left w-full hover:bg-slate-50 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" /> Download Register
                          </button>
                          <button
                            onClick={() => handleDownloadCSV(c)}
                            className="text-left w-full hover:bg-slate-50 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-500" /> Export CSV
                          </button>
                          <button
                            onClick={handleRefreshData}
                            className="text-left w-full hover:bg-slate-50 p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 border-t border-slate-50 mt-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Data
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center text-slate-400 text-xs font-bold flex flex-col gap-2 items-center justify-center shadow-xs">
            <Search className="w-8 h-8 text-slate-300" />
            <span>No assigned classes match the search or filter settings.</span>
          </div>
        )}
      </div>

      {/* BOTTOM INFORMATION BANNER */}
      <div className="bg-blue-50 border border-blue-150 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500 text-white rounded-lg mt-0.5 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider">Information</h4>
            <p className="text-[11px] text-blue-700 mt-1">You can manage students, view class details, and mark attendance for each class allocated.</p>
          </div>
        </div>

        {/* Graphic illustration */}
        <div className="hidden md:flex items-center shrink-0 pr-2">
          <GraduationCap className="w-10 h-10 text-blue-200 stroke-1" />
        </div>
      </div>

      {/* VIEW STUDENTS MODAL OVERLAY */}
      {showStudentsModal && selectedClassCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-150 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-150 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-sm">Class Students Directory</h4>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">
                    Class {selectedClassCard.class} - Section {selectedClassCard.section}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setModalSearchQuery('');
                  setModalPage(1);
                }}
                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Search */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search student by name or roll no..."
                  value={modalSearchQuery}
                  onChange={e => {
                    setModalSearchQuery(e.target.value);
                    setModalPage(1);
                  }}
                  className="w-full border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 bg-slate-50 text-xs font-semibold focus:outline-none focus:bg-white focus:border-slate-300 transition-colors"
                />
              </div>

              {/* Students Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedModalStudents.length > 0 ? (
                  paginatedModalStudents.map(student => {
                    const studentGender = getGenderByName(student.name);
                    return (
                      <div 
                        key={student.id} 
                        className="p-4 border border-slate-150 hover:border-slate-250 rounded-xl flex gap-3.5 bg-white shadow-xs hover:shadow-sm transition-all group"
                      >
                        <img 
                          src={student.photoUrl} 
                          alt={student.name} 
                          className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-inner shrink-0" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                          }}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {student.name}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-400">
                            <span className="uppercase tracking-widest border px-1 rounded-sm">Roll: {student.rollNumber}</span>
                            <span className={`px-1.5 py-0.5 rounded-sm uppercase ${
                              studentGender === 'Female' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {studentGender}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 text-[9px] font-semibold text-slate-450 mt-2 border-t border-slate-50 pt-1.5 truncate">
                            <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 text-slate-350 shrink-0" /> {student.email}</span>
                            <span className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-slate-350 shrink-0" /> {student.phone}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold flex flex-col gap-2 items-center justify-center">
                    <Search className="w-8 h-8 text-slate-300 animate-bounce" />
                    <span>No students match the search criteria.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Pagination */}
            {modalStudentsList.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex items-center justify-between text-[10px] font-bold text-slate-450">
                <span>
                  Showing {Math.min((modalPage - 1) * modalPageSize + 1, modalStudentsList.length)} to {Math.min(modalPage * modalPageSize, modalStudentsList.length)} of {modalStudentsList.length} students
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalPage(p => Math.max(p - 1, 1))}
                    disabled={modalPage === 1}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {Array.from({ length: totalModalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setModalPage(page)}
                      className={`w-6 h-6 rounded-lg text-center transition-all cursor-pointer ${
                        modalPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setModalPage(p => Math.min(p + 1, totalModalPages))}
                    disabled={modalPage === totalModalPages}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CLASS DETAILS MODAL OVERLAY */}
      {showDetailsModal && selectedClassCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-150 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-150 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-950 text-sm">Class Details & Timetable</h4>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">
                    Class {selectedClassCard.class} - Section {selectedClassCard.section}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-5 overflow-y-auto text-xs text-slate-600">
              
              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class Room</span>
                  <span className="text-slate-800 font-extrabold text-sm mt-1 block">Room {getRoomNumber(selectedClassCard.class, selectedClassCard.section)}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Timetable Period</span>
                  <span className="text-slate-800 font-extrabold text-sm mt-1 block">Mon-Fri (08:30 AM - 11:30 AM)</span>
                </div>
              </div>

              {/* Timetable schedule grid */}
              <div>
                <h5 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-2 border-b border-slate-50 pb-1">Weekly Timetable Schedule</h5>
                <div className="flex flex-col gap-1.5">
                  {[
                    { day: 'Monday', time: '08:30 AM - 09:15 AM', subject: 'Mathematics' },
                    { day: 'Tuesday', time: '09:30 AM - 10:15 AM', subject: 'English' },
                    { day: 'Wednesday', time: '10:30 AM - 11:15 AM', subject: 'EVS / Science' },
                    { day: 'Thursday', time: '08:30 AM - 09:15 AM', subject: 'Mathematics' },
                    { day: 'Friday', time: '09:30 AM - 10:15 AM', subject: 'English' }
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-xs hover:border-slate-200 transition-all">
                      <span className="font-extrabold text-slate-800 w-24">{p.day}</span>
                      <span className="text-slate-500 font-semibold">{p.time}</span>
                      <span className="bg-sky-50 text-sky-600 border border-sky-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">{p.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
