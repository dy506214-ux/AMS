'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Check, X, Loader2, UserCheck2, AlertCircle, Plus, Calendar, Clock, 
  CheckCircle2, FileSpreadsheet, Printer, Search, Lock, 
  ShieldCheck, ChevronRight, ChevronLeft, Sparkles, Filter, User, Trash2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  photoUrl: string;
  class: string;
  section: string;
}

interface Slot {
  id: string;
  createdBy: string;
  teacherId: string;
  classId: string;
  sectionId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  studentCount?: number;
  attendanceCount?: number;
  attendanceStatus?: string;
  createdAt: string;
}

interface StudentAttendanceState {
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  photoUrl: string;
  status: 'present' | 'absent' | 'unmarked';
  attendanceId?: string;
}

interface AttendanceClientProps {
  assignedStudents: Student[];
  initialServerDate: string;
}

export default function AttendanceClient({ assignedStudents, initialServerDate }: AttendanceClientProps) {
  // Unique classes and sections assigned to this teacher
  const classesAndSections = useMemo(() => {
    const list = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
      const exists = acc.some(item => item.class === student.class && item.section === student.section);
      if (!exists) {
        acc.push({ class: student.class, section: student.section });
      }
      return acc;
    }, []);
    
    // Sort class numerically, and section alphabetically
    return list.sort((a, b) => {
      const aClass = parseInt(a.class) || 0;
      const bClass = parseInt(b.class) || 0;
      if (aClass !== bClass) {
        return aClass - bClass;
      }
      return a.section.localeCompare(b.section);
    });
  }, [assignedStudents]);

  const [selectedClass, setSelectedClass] = useState(classesAndSections[0]?.class || '');
  const [selectedSection, setSelectedSection] = useState(classesAndSections[0]?.section || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramClass = params.get('class');
      const paramSection = params.get('section');
      if (paramClass) setSelectedClass(paramClass);
      if (paramSection) setSelectedSection(paramSection);
    }
  }, []);

  const [date, setDate] = useState(initialServerDate);
  const [todayDate, setTodayDate] = useState(initialServerDate);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [slotType, setSlotType] = useState('Morning');
  
  // UI states
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  
  const [todaySlots, setTodaySlots] = useState<Slot[]>([]);
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [successSlot, setSuccessSlot] = useState<Slot | null>(null);
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const { showToast } = useToast();
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'unmarked'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Active Tab & Module Switcher
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Attendance History & Audit Logs State
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyRange, setHistoryRange] = useState<'today' | 'yesterday' | '7days' | 'monthly' | 'all'>('today');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'archived'>('all');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // Confirmation Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [isDeletingSlotId, setIsDeletingSlotId] = useState<string | null>(null);

  // Time formatter utilities
  const formatTime12h = (timeStr: string): string => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) return timeStr;
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr) || 0;
    const minutes = parseInt(minutesStr) || 0;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getEndTime12h = (startTimeStr: string, durationMinutes: number): string => {
    if (!startTimeStr) return '';
    const cleanTime = startTimeStr.replace(/(AM|PM|am|pm)/gi, '').trim();
    const parts = cleanTime.split(':');
    let hours = parseInt(parts[0]) || 0;
    let minutes = parseInt(parts[1]) || 0;
    const isPM = startTimeStr.toLowerCase().includes('pm');
    const isAM = startTimeStr.toLowerCase().includes('am');
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + (durationMinutes || 30) * 60000);
    
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const ampm = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours % 12 || 12;
    const displayMinutes = endMinutes < 10 ? `0${endMinutes}` : endMinutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

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

  // Load students for active slot
  const loadStudentsForActiveSlot = useCallback(async (slotId: string) => {
    setIsLoadingStudents(true);
    setCurrentPage(1);
    try {
      const res = await fetch(`/api/attendance/slots/${slotId}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        showToast('Failed to load student register.', 'error');
      }
    } catch {
      showToast('Network error loading students.', 'error');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [showToast]);

  // Select Slot to load student list & sync URL search param
  const handleSelectSlot = useCallback((slot: Slot) => {
    setActiveSlot(slot);
    setSuccessSlot(null);
    loadStudentsForActiveSlot(slot.id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('slotId', slot.id);
      window.history.replaceState({}, '', url.toString());
    }
  }, [loadStudentsForActiveSlot]);

  // Load today's slots
  const loadTodaySlots = useCallback(async () => {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/attendance/slots?date=${todayDate}`);
      if (res.ok) {
        const data: Slot[] = await res.json();
        setTodaySlots(data);

        // Auto-restore active slot from URL search param if present
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const paramSlotId = params.get('slotId');
          if (paramSlotId) {
            const matched = data.find(s => s.id === paramSlotId);
            if (matched) {
              handleSelectSlot(matched);
            }
          }
        }
      } else {
        showToast('Failed to load today\'s slots.', 'error');
      }
    } catch {
      showToast('Network error loading slots.', 'error');
    } finally {
      setIsLoadingSlots(false);
    }
  }, [todayDate, showToast, handleSelectSlot]);

  const loadHistoryRecords = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const query = new URLSearchParams({
        search: historySearch,
        range: historyRange,
        status: historyStatusFilter,
        classId: selectedClass,
        sectionId: selectedSection
      });
      const res = await fetch(`/api/attendance/history?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryRecords(data.records || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch {
      showToast('Error loading attendance history.', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [historySearch, historyRange, historyStatusFilter, selectedClass, selectedSection, showToast]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryRecords();
    }
  }, [activeTab, loadHistoryRecords]);

  // Initial load
  useEffect(() => {
    loadTodaySlots();
  }, [loadTodaySlots]);

  // Monitor system date change and rollover automatically using server date
  useEffect(() => {
    const checkDate = async () => {
      try {
        const res = await fetch('/api/attendance/server-date');
        if (res.ok) {
          const data = await res.json();
          const currentToday = data.serverDate;
          if (currentToday && currentToday !== todayDate) {
            setTodayDate(currentToday);
            setDate(currentToday); // reset setup form date
            setActiveSlot(null);
            setStudents([]);
          }
        }
      } catch (e) {
        console.error('Failed to sync server date:', e);
      }
    };
    const interval = setInterval(checkDate, 5000);
    return () => clearInterval(interval);
  }, [todayDate]);

  // Handle Slot Creation
  const handleCreateSlot = async () => {
    if (!selectedClass || !selectedSection || !date || !time) {
      showToast('Please select all slot details.', 'error');
      return;
    }

    if (date !== todayDate) {
      showToast("Attendance slots can only be created for today's date.", 'error');
      return;
    }

    // Client-side duplicate check
    const duplicate = todaySlots.find(
      s => s.classId === selectedClass && 
           s.sectionId === selectedSection && 
           s.type === slotType
    );
    if (duplicate) {
      showToast(`Attendance has already been completed for Class ${selectedClass} - Section ${selectedSection} today.`, 'error');
      return;
    }

    setIsCreatingSlot(true);
    try {
      const res = await fetch('/api/attendance/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection,
          date,
          time: formatTime12h(time),
          duration,
          type: slotType
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessSlot(data);
        showToast('Attendance slot created successfully!', 'success');
        loadTodaySlots();
        // Auto-select the newly created slot
        handleSelectSlot(data);
      } else {
        if (res.status === 409) {
          showToast(`Attendance has already been completed for Class ${selectedClass} - Section ${selectedSection} today.`, 'error');
        } else {
          showToast(data.error || 'Failed to create slot.', 'error');
        }
      }
    } catch {
      showToast('Network error creating slot.', 'error');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  // Trigger Delete Slot Modal
  const handleRequestDeleteSlot = (slot: Slot, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setSlotToDelete(slot);
    setShowDeleteModal(true);
  };

  // Confirm and Execute Slot Deletion
  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    const targetId = slotToDelete.id;
    setIsDeletingSlotId(targetId);

    try {
      const res = await fetch(`/api/attendance/slots/${targetId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast('Slot deleted successfully.', 'success');
        if (activeSlot?.id === targetId) {
          setActiveSlot(null);
          setStudents([]);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('slotId');
            window.history.replaceState({}, '', url.toString());
          }
        }
        if (successSlot?.id === targetId) {
          setSuccessSlot(null);
        }
        loadTodaySlots();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete slot.', 'error');
      }
    } catch {
      showToast('Network error deleting slot.', 'error');
    } finally {
      setIsDeletingSlotId(null);
      setShowDeleteModal(false);
      setSlotToDelete(null);
    }
  };

  // Handle Student Status Toggle
  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    if (activeSlot?.status === 'completed' || activeSlot?.status === 'SAVED') return; // Locked mode
    if (activeSlot?.date !== todayDate) return; // Locked mode for old dates
    setStudents(prev => prev.map(student => {
      if (student.studentId === studentId) {
        return { ...student, status };
      }
      return student;
    }));
  };

  // Toggle all students to same status
  const handleToggleAll = (status: 'present' | 'absent') => {
    if (activeSlot?.status === 'completed' || activeSlot?.status === 'SAVED') return;
    if (activeSlot?.date !== todayDate) return;
    setStudents(prev => prev.map(student => ({ ...student, status })));
    showToast(`Marked all as ${status.toUpperCase()}.`, 'info');
  };

  // Save Attendance Submit
  const handleSaveAttendance = async () => {
    if (!activeSlot) return;
    if (activeSlot.date !== todayDate) {
      showToast("Only today's attendance can be saved.", 'error');
      return;
    }
    if (isSavingAttendance) return; // Prevent duplicate clicks

    const unmarked = students.some(s => s.status === 'unmarked');
    if (unmarked) {
      showToast('Please mark attendance for all students before saving.', 'error');
      return;
    }

    setIsSavingAttendance(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch(`/api/attendance/slots/${activeSlot.id}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: students.map(s => ({
            studentId: s.studentId,
            status: s.status
          }))
        })
      });

      if (res.ok) {
        showToast('✔ Attendance saved successfully.', 'success');
        // Refresh active slot and reload slots list immediately without page reload
        const updatedSlot = { ...activeSlot, status: 'SAVED' };
        setActiveSlot(updatedSlot);
        loadTodaySlots();
        loadStudentsForActiveSlot(activeSlot.id);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save attendance.', 'error');
      }
    } catch {
      showToast('Network error saving attendance.', 'error');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Filtering & Search student register
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNumber.includes(searchQuery) ||
                            s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const gender = getGenderByName(s.studentName);
      const matchesGender = genderFilter === 'all' || gender === genderFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [students, searchQuery, genderFilter, statusFilter]);

  // Paginated Students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Realtime Statistics (P/A Only)
  const totalStudentsCount = students.length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const remainingCount = students.filter(s => s.status === 'unmarked').length;

  const presentPercentage = totalStudentsCount > 0 
    ? Math.round((presentCount / totalStudentsCount) * 100) 
    : 0;

  // Exports
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!activeSlot || students.length === 0) return;
    
    const headers = ['Roll No', 'Admission No', 'Name', 'Gender', 'Status', 'Date', 'Slot Type'];
    const rows = students.map(s => [
      s.rollNumber,
      s.studentId,
      s.studentName,
      getGenderByName(s.studentName),
      s.status.toUpperCase(),
      activeSlot.date,
      activeSlot.type
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${activeSlot.classId}-${activeSlot.sectionId}_${activeSlot.date}_${activeSlot.type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Excel CSV exported successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 text-slate-800">
      
      {/* Page Title Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {activeTab === 'mark' ? 'Mark Attendance' : 'Attendance History & Audit Logs'}
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            {activeTab === 'mark'
              ? 'Create attendance slots, select slot parameters, and mark live registers.'
              : 'Search permanent attendance records, filter date ranges, view audit logs & export reports.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'mark'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            History & Audit Logs
          </button>
        </div>
      </div>

      {/* SECTION 1: Attendance Setup Card & Live Register */}
      {activeTab === 'mark' && (
        <>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-600 text-xs font-bold flex items-center justify-center">1</span>
          <h3 className="text-sm font-bold text-slate-900">Attendance Setup</h3>
          <span className="text-[10px] text-slate-400 font-semibold">(Create a slot to mark attendance)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Class</label>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                const match = classesAndSections.find(c => c.class === e.target.value);
                if (match) setSelectedSection(match.section);
              }}
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all cursor-pointer"
            >
              {Array.from(new Set(classesAndSections.map(c => c.class))).map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all cursor-pointer"
            >
              {classesAndSections
                .filter(c => c.class === selectedClass)
                .map(c => (
                  <option key={c.section} value={c.section}>Section {c.section}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              readOnly
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2 bg-slate-50 text-slate-500 text-xs font-bold focus:outline-none cursor-not-allowed pointer-events-none select-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Slot Type</label>
            <select
              value={slotType}
              onChange={e => setSlotType(e.target.value)}
              className="w-full border border-slate-150 rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="Morning">Morning Slot</option>
              <option value="Afternoon">Afternoon Slot</option>
              <option value="Evening">Evening Slot</option>
              <option value="Special Class">Special Class</option>
              <option value="Extra Class">Extra Class</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <button
            onClick={handleCreateSlot}
            disabled={isCreatingSlot}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCreatingSlot ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Slot...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Create Attendance Slot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Card Renders Immediately After Slot Creation */}
      {successSlot && (
        <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl flex items-start gap-4 animate-fadeIn">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          
          <div className="flex-1 flex flex-col gap-2">
            <div>
              <h4 className="font-bold text-emerald-800 text-sm">Attendance Slot Created Successfully!</h4>
              <p className="text-[11px] text-emerald-600 mt-0.5">Your slot is now active and ready for marking student registers.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSelectSlot(successSlot)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all cursor-pointer"
              >
                Open Register
              </button>
              <button
                onClick={() => setSuccessSlot(null)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Today's Slots (Timeline) & Live Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Timeline of Slots */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-600 text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="text-sm font-bold text-slate-900">Today's Attendance Slots</h3>
          </div>

          <div className="flex flex-col gap-3 min-h-[180px] max-h-[300px] overflow-y-auto pr-1">
            {isLoadingSlots ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                <span className="text-[11px] font-semibold mt-1">Retrieving slots...</span>
              </div>
            ) : todaySlots.length > 0 ? (
              todaySlots.map((slot) => {
                const isActive = activeSlot?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:bg-slate-50/50 ${
                      isActive 
                        ? 'bg-sky-50/20 border-sky-400 shadow-xs' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-900">
                          Class {slot.classId} • Section {slot.sectionId}
                        </span>
                        <span className="text-[10px] font-bold text-slate-650">
                          {slot.time} - {getEndTime12h(slot.time, slot.duration)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {slot.type} Slot
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider border ${
                        slot.status === 'completed' || slot.status === 'SAVED'
                          ? 'bg-emerald-50/10 border-emerald-500/20 text-emerald-600'
                          : 'bg-emerald-50 border-emerald-150 text-emerald-600 animate-pulse'
                      }`}>
                        {slot.status === 'completed' || slot.status === 'SAVED' ? '✅ SAVED' : '🟢 ACTIVE'}
                      </span>

                      {/* Delete Icon Button */}
                      <button
                        onClick={(e) => handleRequestDeleteSlot(slot, e)}
                        disabled={isDeletingSlotId === slot.id}
                        title="Delete Attendance Slot"
                        className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-150 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[10px] font-bold disabled:opacity-50"
                      >
                        {isDeletingSlotId === slot.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="hidden sm:inline text-rose-600 font-bold">Delete</span>
                          </>
                        )}
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-1 stroke-1 text-slate-350" />
                <p className="font-bold text-xs text-slate-500">No attendance slots created for today.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Create today's attendance slot to begin marking attendance.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Live Statistics */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Live Statistics</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Students */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Total</span>
                <span className="text-lg font-extrabold text-slate-800 mt-0.5">{totalStudentsCount}</span>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Present */}
            <div className="bg-emerald-50/20 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Present</span>
                <span className="text-lg font-extrabold text-emerald-700 mt-0.5">{presentCount}</span>
              </div>
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Absent */}
            <div className="bg-rose-50/20 border border-rose-100 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Absent</span>
                <span className="text-lg font-extrabold text-rose-700 mt-0.5">{absentCount}</span>
              </div>
              <div className="p-2 bg-rose-500 text-white rounded-lg">
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Remaining */}
            <div className="bg-amber-50/20 border border-amber-100 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Pending</span>
                <span className="text-lg font-extrabold text-amber-700 mt-0.5">{remainingCount}</span>
              </div>
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs">
            <span className="font-extrabold text-slate-700">Attendance Percentage</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-slate-900">{presentPercentage}%</span>
              {/* SVG circular progress */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="15" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#0ea5e9" strokeWidth="15" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * presentPercentage) / 100} strokeLinecap="round" className="transition-all duration-300" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: Student Attendance Register Table */}
      {activeSlot && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-600 text-xs font-bold flex items-center justify-center">3</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Attendance Register (Class {activeSlot.classId} - Section {activeSlot.sectionId})</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Mark attendance below. Unmarked students default to pending status.</p>
              </div>
            </div>

            {/* Lock Mode Banner */}
            {(activeSlot.status === 'completed' || activeSlot.status === 'SAVED') && (
              <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-slate-800 shadow-xs">
                <Lock className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-350">Locked / Read Only</span>
              </div>
            )}

            {/* Search, Filters, and Bulk Actions */}
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by name or roll no..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full border border-slate-150 rounded-xl pl-9 pr-4 py-2.5 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Status/Gender Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={`p-2.5 border rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                      genderFilter !== 'all' || statusFilter !== 'all'
                        ? 'bg-sky-50 border-sky-300 text-sky-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-xl shadow-lg p-4 z-40 flex flex-col gap-3 animate-scaleUp">
                      <div>
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Gender</span>
                        <div className="flex gap-1.5">
                          {['all', 'Male', 'Female'].map((g) => (
                            <button
                              key={g}
                              onClick={() => { setGenderFilter(g as any); setCurrentPage(1); }}
                              className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                genderFilter === g
                                  ? 'bg-sky-500 border-sky-500 text-white'
                                  : 'bg-white border-slate-150 text-slate-655 hover:bg-slate-50'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Status</span>
                        <div className="flex flex-col gap-1">
                          {['all', 'present', 'absent', 'unmarked'].map((s) => (
                            <button
                              key={s}
                              onClick={() => { setStatusFilter(s as any); setCurrentPage(1); }}
                              className={`text-left px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                statusFilter === s
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-white border-slate-150 text-slate-650 hover:bg-slate-50'
                              }`}
                            >
                              {s.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Attendance Actions */}
              {activeSlot.status !== 'completed' && activeSlot.status !== 'SAVED' && (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleToggleAll('present')}
                    disabled={activeSlot.date !== todayDate}
                    title="Mark all students as Present"
                    className="px-4 py-1.5 border border-emerald-250 bg-white hover:bg-emerald-50/20 text-emerald-600 font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" /> All Present
                  </button>
                  <button
                    onClick={() => handleToggleAll('absent')}
                    disabled={activeSlot.date !== todayDate}
                    title="Mark all students as Absent"
                    className="px-4 py-1.5 border border-rose-250 bg-white hover:bg-rose-50/20 text-rose-600 font-extrabold text-[10px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3.5 h-3.5" /> All Absent
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeSlot.date !== todayDate && (
            <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-bold shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Attendance editing is allowed only on the current date.</span>
            </div>
          )}

          {/* Student Table Register Grid */}
          <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs relative min-h-[200px]">
            {isLoadingStudents && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">Loading student registers...</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-6 w-16">Photo</th>
                    <th className="py-4 px-6 w-24">Roll No</th>
                    <th className="py-4 px-6 w-40">Admission No</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6 w-24">Gender</th>
                    <th className="py-4 px-6 w-28">Status Badge</th>
                    {activeSlot.status !== 'completed' && activeSlot.status !== 'SAVED' && (
                      <th className="py-4 px-6 text-center w-36">Mark Attendance</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => {
                      const gender = getGenderByName(student.studentName);
                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-6">
                            <img 
                              src={student.photoUrl} 
                              alt={student.studentName} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-150 shadow-xs" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-6 font-extrabold text-slate-900">{student.rollNumber}</td>
                          <td className="py-3.5 px-6 text-[10px] font-extrabold text-slate-450">{student.studentId}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-900">{student.studentName}</td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              gender === 'Female' 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {gender}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex px-2.5 py-1 text-[9px] font-extrabold rounded-full uppercase tracking-wider border ${
                              student.status === 'present'
                                ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                                : student.status === 'absent'
                                ? 'bg-rose-50 border-rose-150 text-rose-600'
                                : 'bg-slate-100 border-slate-200 text-slate-450'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          
                          {activeSlot.status !== 'completed' && activeSlot.status !== 'SAVED' && (
                            <td className="py-2.5 px-6">
                              <div className="flex justify-center items-center gap-1.5">
                                {/* Present Button */}
                                <button
                                  onClick={() => handleStatusChange(student.studentId, 'present')}
                                  disabled={activeSlot.date !== todayDate}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-extrabold text-xs transition-all active:scale-90 cursor-pointer ${
                                    student.status === 'present'
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  P
                                </button>
                                {/* Absent Button */}
                                <button
                                  onClick={() => handleStatusChange(student.studentId, 'absent')}
                                  disabled={activeSlot.date !== todayDate}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-extrabold text-xs transition-all active:scale-90 cursor-pointer ${
                                    student.status === 'absent'
                                      ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/10'
                                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  A
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={activeSlot.status !== 'completed' && activeSlot.status !== 'SAVED' ? 7 : 6} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-1 stroke-1 text-slate-350" />
                        <p className="font-bold text-xs text-slate-500">No students matching filters found</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Adjust your filters or try another search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-between bg-slate-50/70 border-t border-slate-150 px-6 py-3.5 text-[10px] font-extrabold text-slate-450">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
                </span>

                <div className="flex items-center gap-4">
                  {/* Select page size */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-650 cursor-pointer focus:outline-none"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>

                  {/* Previous / Next buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Layout Row: Summary and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-2">
            
            {/* SECTION 4: Attendance Summary */}
            <div className="md:col-span-8 bg-slate-50 border border-slate-150 p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-600 text-[10px] font-bold flex items-center justify-center">4</span>
                <h4 className="font-bold text-slate-800 text-xs">Attendance Summary</h4>
              </div>

              <div className="flex gap-4">
                <div className="bg-white border border-slate-200/50 p-3 rounded-xl flex-1 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Present</span>
                  <span className="text-lg font-extrabold text-emerald-700 mt-1">{presentCount}</span>
                </div>
                <div className="bg-white border border-slate-200/50 p-3 rounded-xl flex-1 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Absent</span>
                  <span className="text-lg font-extrabold text-rose-700 mt-1">{absentCount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>Attendance Rate</span>
                  <span className="text-slate-800 text-xs">{presentPercentage}%</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${presentPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* SECTION 5: Actions */}
            <div className="md:col-span-4 bg-slate-50 border border-slate-150 p-6 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-600 text-[10px] font-bold flex items-center justify-center">5</span>
                <h4 className="font-bold text-slate-800 text-xs">Actions</h4>
              </div>

              {activeSlot.status !== 'completed' && activeSlot.status !== 'SAVED' ? (
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance || activeSlot.date !== todayDate}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingAttendance ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <UserCheck2 className="w-4 h-4" /> Save Attendance
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full bg-slate-200 text-slate-400 font-bold py-3 px-4 rounded-xl text-center text-xs flex items-center justify-center gap-2 border border-slate-250">
                  <Check className="w-4 h-4 text-emerald-500" /> Attendance Saved
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-lg text-[10px] transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-lg text-[10px] transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Report
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
        </>
      )}

      {/* SECTION 4: Attendance History & Audit Logs View */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-6">
          {/* History Controls Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search student name, roll number, admission..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Date Range Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(['today', 'yesterday', '7days', 'monthly', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setHistoryRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      historyRange === r
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {r === '7days' ? 'Last 7 Days' : r}
                  </button>
                ))}
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="archived">Archived</option>
              </select>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* History Records Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Attendance Records History</h3>
              <span className="text-[11px] font-semibold text-slate-400">Total Records: {historyRecords.length}</span>
            </div>

            {isLoadingHistory ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500" />
                <span className="text-xs font-bold mt-2 block">Loading history records...</span>
              </div>
            ) : historyRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Marked By</th>
                      <th className="py-3 px-4">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {historyRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {r.student?.name}
                          <span className="block text-[10px] text-slate-400 font-semibold">Roll: {r.student?.rollNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          Class {r.student?.class} - {r.student?.section}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-500">
                          {r.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            r.status === 'present'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">
                          {r.markedByTeacher?.name || 'Teacher'}
                        </td>
                        <td className="py-3.5 px-4">
                          {r.isArchived ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-extrabold rounded-md">
                              Archived
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-200 text-[9px] font-extrabold rounded-md">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                No attendance history records match the selected filters.
              </div>
            )}
          </div>

          {/* Audit Log Stream Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Recent Attendance Audit Logs
            </h3>
            <div className="flex flex-col gap-2.5">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        log.action === 'Soft-Deleted'
                          ? 'bg-rose-100 text-rose-700'
                          : log.action === 'Restored'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-800">
                        Class {log.classId} - Section {log.sectionId} ({log.slotType})
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">By: {log.performedBy} ({log.role || 'Teacher'})</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-semibold py-4 text-center">No recent audit log activity.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modals */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-600 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">Save Attendance Registry</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Are you sure you want to save the register for <strong className="text-slate-800 font-extrabold">Class {activeSlot?.classId} - {activeSlot?.sectionId}</strong>?
                </p>
                <div className="mt-2.5 text-[10px] text-amber-600 font-bold bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                  Warning: Submitting will lock the slot and update databases in real-time.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Slot Confirmation Modal */}
      {showDeleteModal && slotToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {slotToDelete.status === 'SAVED' || slotToDelete.status === 'completed' ? 'Archive Attendance Slot?' : 'Delete Attendance Slot?'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  {slotToDelete.status === 'SAVED' || slotToDelete.status === 'completed'
                    ? 'Attendance has already been marked. Deleting this slot will archive the attendance. Student attendance history will remain safe. Continue?'
                    : 'Are you sure you want to delete this attendance slot?'}
                </p>
                <div className="mt-3 text-[10px] text-slate-600 font-bold bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                  Slot: Class {slotToDelete.classId} • Section {slotToDelete.sectionId} ({slotToDelete.type} Slot)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSlotToDelete(null);
                }}
                disabled={isDeletingSlotId !== null}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSlot}
                disabled={isDeletingSlotId !== null}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeletingSlotId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Archiving...
                  </>
                ) : (
                  slotToDelete.status === 'SAVED' || slotToDelete.status === 'completed' ? 'Archive' : 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
