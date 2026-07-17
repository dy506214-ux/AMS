'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Loader2, Save, Search, AlertCircle, RefreshCw,
  Award, GraduationCap, CheckCircle2, User
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
}

interface StudentMarkRow {
  studentId: string;
  name: string;
  rollNumber: string;
  marksObtained: number | string;
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
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Half Yearly Examination');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<StudentMarkRow[]>([]);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
  const exams = ['Unit Test 1', 'Unit Test 2', 'Half Yearly Examination', 'Final Examination'];

  // Load students and their existing marks
  const loadStudentsAndMarks = useCallback(async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) return;
    setIsLoading(true);
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
            marksObtained: existingMark ? existingMark.marksObtained : '',
            remarks: existingMark ? (existingMark.remarks || '') : ''
          };
        });
        setStudents(mapped);
        if (res.marks && res.marks.length > 0) {
          setMaxMarks(res.marks[0].maxMarks);
        } else {
          setMaxMarks(100);
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

  // Handle Mark Change
  const handleMarkChange = (studentId: string, value: string) => {
    // Basic validation: allow numbers or empty string
    if (value !== '' && isNaN(Number(value))) return;
    
    // Check if value exceeds maxMarks
    if (value !== '' && Number(value) > maxMarks) {
      showToast(`Marks obtained cannot exceed Maximum Marks (${maxMarks})`, 'info');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, marksObtained: value };
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

    // Validate that all marks entered are numbers and do not exceed maxMarks
    const invalidRecord = students.find(s => {
      if (s.marksObtained !== '') {
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
      const records = students
        .filter(s => s.marksObtained !== '')
        .map(s => ({
          studentId: s.studentId,
          marksObtained: Number(s.marksObtained),
          remarks: s.remarks
        }));

      if (records.length === 0) {
        showToast('Please enter marks for at least one student.', 'info');
        setIsSaving(false);
        return;
      }

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
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Student Marks Entry</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Input and save academic grades for your assigned classes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={loadStudentsAndMarks}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || students.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Marks</span>
          </button>
        </div>
      </div>

      {/* Selectors and Filters Card */}
      <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Class Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setStudents([]); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            >
              {classesAndSections.map((item, idx) => (
                <option key={`class-${idx}`} value={item.class}>Class {item.class}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setStudents([]); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            >
              {classesAndSections
                .filter(item => item.class === selectedClass)
                .map((item, idx) => (
                  <option key={`sec-${idx}`} value={item.section}>Section {item.section}</option>
                ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setStudents([]); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            >
              {subjects.map((sub, idx) => (
                <option key={`sub-${idx}`} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Exam Name Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Examination</label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setStudents([]); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            >
              {exams.map((ex, idx) => (
                <option key={`ex-${idx}`} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* Max Marks Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Max Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 100))}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
              min={1}
            />
          </div>
        </div>

        {/* Search Filter */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            />
          </div>
        </div>
      </div>

      {/* Student Marks Registry Table */}
      <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs relative min-h-[250px] bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Loading student registers...</span>
          </div>
        )}

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 w-24">Roll No</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6 w-48 text-center">Marks Obtained (Max: {maxMarks})</th>
                  <th className="py-4 px-6">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-xs font-black text-blue-600 uppercase tracking-wider">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="text"
                          value={student.marksObtained}
                          onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                          placeholder="-"
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-800 bg-slate-50/50 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                        placeholder="Add performance remarks..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-slate-800">No Students Found</span>
            <span className="text-xs text-slate-450 mt-1 max-w-sm">
              We couldn't find any students assigned to you in Class {selectedClass} Section {selectedSection}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
