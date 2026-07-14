'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check, X, Loader2, Calendar, UserCheck2, AlertCircle } from 'lucide-react';
import { markAttendanceAction } from '@/lib/actions/teacher';
import { useToast } from '@/context/ToastContext';
import { Student } from '@/lib/db/jsonDb';
import { StudentAttendanceState } from '@/lib/services/attendance';

interface AttendanceClientProps {
  assignedStudents: Student[];
  initialRecordsByClass: { [key: string]: StudentAttendanceState[] };
}

export default function AttendanceClient({ assignedStudents, initialRecordsByClass }: AttendanceClientProps) {
  // Get unique classes and sections from students assigned to this teacher
  const classesAndSections = assignedStudents.reduce((acc: { class: string; section: string }[], student) => {
    const exists = acc.some(item => item.class === student.class && item.section === student.section);
    if (!exists) {
      acc.push({ class: student.class, section: student.section });
    }
    return acc;
  }, []);

  const [selectedClass, setSelectedClass] = useState(classesAndSections[0]?.class || '');
  const [selectedSection, setSelectedSection] = useState(classesAndSections[0]?.section || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<StudentAttendanceState[]>([]);
  const { showToast } = useToast();

  // Load records for selected class/section/date
  // In a real application, we would call an API when date/class/section changes.
  // For our SQLite/JSON DB simulation, we can fetch them using a Client-Side route handler or pass as state.
  // Let's implement an endpoint or use client actions to fetch data on selection!
  // Yes, a simple client-side fetch: `fetch('/api/attendance?class=' + selectedClass + '&section=' + selectedSection + '&date=' + date)`
  // Or we can invoke a server action that reads the DB directly! That is extremely clean and requires no API endpoints!
  // Let's implement a Server Action `fetchAttendanceAction(class, section, date)` inside `src/app/teacher/attendance/actions.ts` or in our main action file!
  // But wait! We can just fetch it inside `src/app/teacher/attendance/page.tsx` as server component, and if the user changes selections, they can reload the page with searchParams, OR we can write a quick Server Action that fetches data!
  // A Server Action `fetchClassAttendance(class, section, date)` is incredibly fast, simple, and avoids full page refreshes!
  // Let's write `fetchClassAttendance` action directly in our teacher action file and import it here.
  // Let's make sure we declare it in `src/lib/actions/teacher.ts`.
  // First, let's look at the fetch logic we'll add.

  const loadAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/attendance?class=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        showToast('Failed to load register records.', 'error');
      }
    } catch (err) {
      showToast('Network error loading register.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedClass, selectedSection, date]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setRecords(prev => prev.map(record => {
      if (record.studentId === studentId) {
        return { ...record, status };
      }
      return record;
    }));
  };

  const handleToggleAll = (status: 'present' | 'absent') => {
    setRecords(prev => prev.map(record => ({ ...record, status })));
    showToast(`Marked all as ${status}.`, 'info');
  };

  const handleSave = async () => {
    const unmarked = records.some(r => r.status === 'unmarked');
    if (unmarked) {
      showToast('Please mark attendance for all students before saving.', 'error');
      return;
    }

    setIsLoading(true);
    const apiRecords = records.map(r => ({
      studentId: r.studentId,
      status: r.status as 'present' | 'absent'
    }));

    const result = await markAttendanceAction(apiRecords, date);
    setIsLoading(false);

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Attendance register saved successfully.', 'success');
      loadAttendance(); // Reload
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mark Attendance</h2>
        <p className="text-sm text-slate-500 mt-1">Select class parameters and check daily registers</p>
      </div>

      {/* Selectors Bar */}
      <div className="glass-card p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class</label>
          <select
            value={selectedClass}
            onChange={e => {
              setSelectedClass(e.target.value);
              // Auto select corresponding section if needed
              const match = classesAndSections.find(c => c.class === e.target.value);
              if (match) setSelectedSection(match.section);
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 text-sm focus:outline-none focus:border-sky-500"
          >
            {Array.from(new Set(classesAndSections.map(c => c.class))).map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Section</label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 text-sm focus:outline-none focus:border-sky-500"
          >
            {classesAndSections
              .filter(c => c.class === selectedClass)
              .map(c => (
                <option key={c.section} value={c.section}>Section {c.section}</option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleToggleAll('present')}
            className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold px-3 py-2.5 rounded-xl text-xs hover:bg-emerald-500/20 transition-all text-center cursor-pointer"
          >
            All Present
          </button>
          <button
            onClick={() => handleToggleAll('absent')}
            className="flex-1 bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold px-3 py-2.5 rounded-xl text-xs hover:bg-rose-500/20 transition-all text-center cursor-pointer"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Register List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Roll No</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Class/Sec</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6 text-center">Toggle Register</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.studentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{record.rollNumber}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{record.studentName}</td>
                    <td className="py-4 px-6 text-slate-500">{record.class} - {record.section}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                        record.status === 'present'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                          : record.status === 'absent'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(record.studentId, 'present')}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            record.status === 'present'
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/15'
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.studentId, 'absent')}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            record.status === 'absent'
                              ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/15'
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 stroke-1" />
                    <p className="font-semibold text-sm">No students assigned</p>
                    <p className="text-xs text-slate-400 mt-1">There are no students listed in the selected Class/Section.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      {records.length > 0 && (
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <UserCheck2 className="w-5 h-5" /> Save Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
