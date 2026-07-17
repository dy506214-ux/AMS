'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Loader2, Save, Search, AlertCircle, RefreshCw,
  Award, User, Mail, MoreVertical, ChevronLeft, 
  ChevronRight, X, Check, Circle, ShieldAlert
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getStudentsForMarksAction, saveMarksAction } from '@/lib/actions/teacher';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  photoUrl: string;
  class: string;
  section: string;
  email?: string;
}

interface StudentMarkRow {
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  marksObtained: number | string;
  attendanceStatus: 'present' | 'absent';
  remarks: string;
}

interface MarksEntryClientProps {
  assignedStudents: Student[];
}

export default function MarksEntryClient({ assignedStudents }: MarksEntryClientProps) {
  const { showToast } = useToast();

  // Unique classes and sections assigned to this teacher
  const classesAndSections = useMemo(() => {
    return assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
      const exists = acc.some(item => item.class === student.class && item.section === student.section);
      if (!exists) {
        acc.push({ class: student.class, section: student.section });
      }
      return acc;
    }, []);
  }, [assignedStudents]);

  // Filters State
  const [selectedClass, setSelectedClass] = useState(classesAndSections[0]?.class || '');
  const [selectedSection, setSelectedSection] = useState(classesAndSections[0]?.section || '');
  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [selectedExam, setSelectedExam] = useState('Unit Test 1');
  const [maxMarks, setMaxMarks] = useState<number>(70);

  // Search & Pagination query
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<StudentMarkRow[]>([]);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
  const exams = ['Unit Test 1', 'Unit Test 2', 'Half Yearly Examination', 'Final Examination'];

  // Helper to generate initials from names
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper for dynamic pastel avatar styling
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-50 text-blue-600 border-blue-100',
      'bg-emerald-50 text-emerald-600 border-emerald-100',
      'bg-purple-50 text-purple-600 border-purple-100',
      'bg-amber-50 text-amber-600 border-amber-100',
      'bg-rose-50 text-rose-600 border-rose-100',
      'bg-indigo-50 text-indigo-600 border-indigo-100',
      'bg-pink-50 text-pink-600 border-pink-100',
      'bg-cyan-50 text-cyan-600 border-cyan-100'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Load students and their existing marks
  const loadStudentsAndMarks = useCallback(async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) return;
    setIsLoading(true);
    setCurrentPage(1);
    try {
      const res = await getStudentsForMarksAction({
        classId: selectedClass,
        sectionId: selectedSection,
        subject: selectedSubject,
        examName: selectedExam
      });

      if ('error' in res) {
        showToast(res.error || 'Failed to load students.', 'error');
        setStudents([]);
      } else if (res.success && res.students) {
        // Map students and merge existing marks
        const mapped = res.students.map((student: any) => {
          const existingMark = res.marks?.find((m: any) => m.studentId === student.id);
          return {
            studentId: student.id,
            name: student.name,
            rollNumber: student.rollNumber,
            email: student.email || `${student.name.toLowerCase().replace(' ', '.')}@example.com`,
            marksObtained: existingMark ? (existingMark.attendanceStatus === 'absent' ? '' : existingMark.marksObtained) : '',
            attendanceStatus: existingMark ? (existingMark.attendanceStatus as 'present' | 'absent') : 'present',
            remarks: existingMark ? (existingMark.remarks || '') : ''
          };
        });
        setStudents(mapped);
        if (res.marks && res.marks.length > 0) {
          setMaxMarks(res.marks[0].maxMarks);
        } else {
          // If no existing marks, set default matching the exam
          setMaxMarks(selectedExam.startsWith('Unit Test') ? 25 : 70);
        }
      }
    } catch {
      showToast('Failed to load marks data.', 'error');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedSection, selectedSubject, selectedExam, showToast]);

  // Load on filter change
  useEffect(() => {
    loadStudentsAndMarks();
  }, [loadStudentsAndMarks]);

  // Reset filters
  const handleClearFilters = () => {
    setSelectedClass(classesAndSections[0]?.class || '');
    setSelectedSection(classesAndSections[0]?.section || '');
    setSelectedSubject('Science');
    setSelectedExam('Unit Test 1');
    setMaxMarks(70);
    setSearchQuery('');
    setCurrentPage(1);
    showToast('Filters cleared successfully.', 'info');
  };

  // Handle Mark Change
  const handleMarkChange = (studentId: string, value: string) => {
    // Check if the student is absent
    const student = students.find(s => s.studentId === studentId);
    if (student?.attendanceStatus === 'absent') return;

    // Basic validation: allow numbers or empty string
    if (value !== '' && isNaN(Number(value))) return;
    
    // Check if value exceeds maxMarks
    if (value !== '' && Number(value) > maxMarks) {
      showToast(`Marks obtained cannot exceed Maximum Marks (${maxMarks})`, 'info');
      return;
    }

    // Check negative value
    if (value !== '' && Number(value) < 0) {
      showToast('Marks obtained cannot be negative', 'info');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, marksObtained: value };
      }
      return s;
    }));
  };

  // Handle Status (Present / Absent) toggle
  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { 
          ...s, 
          attendanceStatus: status,
          // Reset marks to empty if absent according to business rules
          marksObtained: status === 'absent' ? '' : s.marksObtained
        };
      }
      return s;
    }));
  };


  // Handle Remarks Change
  const handleRemarksChange = (studentId: string, value: string) => {
    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, remarks: value };
      }
      return s;
    }));
  };

  // Save marks
  const handleSave = async () => {
    if (students.length === 0) {
      showToast('No students loaded to save.', 'error');
      return;
    }

    // Validate present students have valid marks
    const invalidRecord = students.find(s => {
      if (s.attendanceStatus === 'present' && s.marksObtained !== '') {
        const score = Number(s.marksObtained);
        return score < 0 || score > maxMarks;
      }
      return false;
    });

    if (invalidRecord) {
      showToast(`Invalid score for ${invalidRecord.name}. Must be between 0 and ${maxMarks}.`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.studentId,
        marksObtained: s.attendanceStatus === 'absent' ? 0 : (s.marksObtained !== '' ? Number(s.marksObtained) : 0),
        attendanceStatus: s.attendanceStatus,
        remarks: s.remarks || undefined
      }));

      const res = await saveMarksAction({
        subject: selectedSubject,
        examName: selectedExam,
        maxMarks,
        records
      });

      if ('error' in res) {
        showToast(res.error || 'Failed to save marks.', 'error');
      } else {
        showToast(`Successfully saved marks for ${records.length} students!`, 'success');
        loadStudentsAndMarks(); // Reload to refresh fields
      }
    } catch {
      showToast('Failed to save marks due to server error.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered student list by search
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Paginated students list
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Generate page numbers array with dots
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Marks Entry</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Input and save academic grades for your assigned classes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={loadStudentsAndMarks}
            disabled={isLoading}
            className="p-3 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || students.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer tracking-wide"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save All Marks</span>
          </button>
        </div>
      </div>

      {/* Selectors and Filters Card */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Class Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setStudents([]); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
            >
              {classesAndSections.map((item, idx) => (
                <option key={`class-${idx}`} value={item.class}>Class {item.class}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setStudents([]); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
            >
              {classesAndSections
                .filter(item => item.class === selectedClass)
                .map((item, idx) => (
                  <option key={`sec-${idx}`} value={item.section}>Section {item.section}</option>
                ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setStudents([]); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
            >
              {subjects.map((sub, idx) => (
                <option key={`sub-${idx}`} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Exam Name Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Examination</label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setStudents([]); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
            >
              {exams.map((ex, idx) => (
                <option key={`ex-${idx}`} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* Max Marks Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Max Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 70))}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
              min={1}
            />
          </div>
        </div>

        {/* Search and Clear Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 w-full transition-all"
            />
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-550 hover:text-slate-900 rounded-xl text-xs font-black transition-all hover:bg-slate-100 cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Student Marks Registry Table */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative min-h-[300px] bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Loading student registers...</span>
          </div>
        )}

        {paginatedStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="py-4 px-6 w-24">Roll No.</th>
                  <th className="py-4 px-6 min-w-[200px]">Student Name</th>
                  <th className="py-4 px-6 min-w-[220px]">Email ID</th>
                  <th className="py-4 px-6 w-44 text-center">Marks Obtained (Max: {maxMarks})</th>
                  <th className="py-4 px-6 w-56 text-center">Status</th>
                  <th className="py-4 px-6 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student) => {
                  const isAbsent = student.attendanceStatus === 'absent';
                  const isPresent = student.attendanceStatus === 'present';
                  const initials = getInitials(student.name);
                  const avatarStyle = getAvatarColor(student.name);

                  return (
                    <tr key={student.studentId} className="hover:bg-slate-50/40 transition-colors">
                      {/* Roll Number Column */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100/50 text-blue-600 text-[10.5px] font-black tracking-widest shadow-2xs">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Student Name Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10.5px] font-black shrink-0 ${avatarStyle}`}>
                            {initials}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">{student.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Roll No: {student.rollNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email ID Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-550 hover:text-blue-600 transition-colors">
                          <Mail className="w-3.5 h-3.5 opacity-70 shrink-0 text-slate-400" />
                          <a href={`mailto:${student.email}`} className="text-xs font-medium tracking-tight truncate max-w-[180px] sm:max-w-none">
                            {student.email}
                          </a>
                        </div>
                      </td>

                      {/* Marks Obtained Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={isAbsent ? '-' : student.marksObtained}
                              onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                              disabled={isAbsent}
                              placeholder="-"
                              className={`w-16 px-2 py-1.5 rounded-lg border text-xs font-black text-center focus:outline-none focus:ring-2 transition-all leading-none ${
                                isAbsent 
                                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'border-slate-200 text-slate-800 bg-slate-50/50 focus:bg-white focus:ring-blue-500/20'
                              }`}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold leading-none">/ {maxMarks}</span>
                        </div>
                      </td>

                      {/* Status Column (Segmented Selector) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Present Button */}
                          <button
                            onClick={() => handleStatusChange(student.studentId, 'present')}
                            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 active:translate-y-0 ${
                              isPresent
                                ? 'bg-emerald-50 border-emerald-500/80 text-emerald-700 font-black shadow-inner shadow-emerald-500/5'
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${isPresent ? 'stroke-[3px]' : 'opacity-40'}`} />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            onClick={() => handleStatusChange(student.studentId, 'absent')}
                            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 active:translate-y-0 ${
                              isAbsent
                                ? 'bg-rose-50 border-rose-500/80 text-rose-700 font-black shadow-inner shadow-rose-500/5'
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                          >
                            <Circle className={`w-3 h-3 ${isAbsent ? 'fill-rose-700 text-rose-700' : 'opacity-40'}`} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-center relative">
                        <div className="inline-block">
                          <button
                            onClick={() => setActiveMenuStudentId(activeMenuStudentId === student.studentId ? null : student.studentId)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuStudentId === student.studentId && (
                            <>
                              {/* Backdrop to close menu */}
                              <div 
                                className="fixed inset-0 z-20 cursor-default" 
                                onClick={() => setActiveMenuStudentId(null)}
                              />
                              
                              {/* Menu Dropdown */}
                              <div className="absolute right-6 top-10 w-44 py-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col text-left animate-fadeIn">
                                <button
                                  onClick={() => {
                                    handleRemarksChange(student.studentId, '');
                                    setActiveMenuStudentId(null);
                                    showToast(`Remarks reset for ${student.name}`, 'info');
                                  }}
                                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer w-full text-left"
                                >
                                  <X className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Clear Remarks</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleStatusChange(student.studentId, 'present');
                                    handleMarkChange(student.studentId, '');
                                    setActiveMenuStudentId(null);
                                    showToast(`Marks reset for ${student.name}`, 'info');
                                  }}
                                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer w-full text-left"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Reset Grades</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3 stroke-1 animate-pulse" />
            <span className="text-sm font-extrabold text-slate-800">No Students Found</span>
            <span className="text-xs text-slate-450 mt-1 max-w-sm">
              We couldn't find any students matching your search query in Class {selectedClass} Section {selectedSection}.
            </span>
          </div>
        )}

        {/* Dynamic Pagination Footer matching screenshot exact styles */}
        {filteredStudents.length > 0 && (
          <div className="bg-white border-t border-slate-150 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
            </span>

            <div className="flex items-center gap-3">
              {/* Pagination controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {pageNumbers.map((num, idx) => {
                  const isCurrent = currentPage === num;
                  if (num === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${num}`}
                      onClick={() => setCurrentPage(num as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/20'
                          : 'border border-slate-200 text-slate-650 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>

              {/* Page size selector */}
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-xs font-bold text-slate-650 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={55}>55 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
