'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Filter, Printer, BookOpen, Clock, Calendar, 
  MapPin, CheckCircle, AlertCircle, Info, Sparkles, X, ChevronRight, GraduationCap
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
  photoUrl: string;
}

interface DBMark {
  id: string;
  subject: string;
  examName: string;
  marksObtained: number;
  maxMarks: number;
  remarks: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  maxMarks: number;
  passingMarks: number;
  room: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  syllabus: string;
  obtainedMarks?: number;
  remarks?: string;
}

interface ExaminationsClientProps {
  student: Student;
  marks?: DBMark[];
}

export default function ExaminationsClient({ student, marks = [] }: ExaminationsClientProps) {
  const { showToast } = useToast();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showHallTicket, setShowHallTicket] = useState(false);

  // Static Exam Roster mapped to Student's Class (Class 10 - A)
  const examRoster: Exam[] = useMemo(() => [
    {
      id: 'ex-101',
      title: 'Half Yearly Examination',
      subject: 'Mathematics',
      date: '2026-07-22',
      time: '09:00 AM - 12:00 PM',
      duration: '3 Hours',
      maxMarks: 100,
      passingMarks: 33,
      room: 'Room 101',
      status: 'Upcoming',
      syllabus: 'Algebra, Calculus, Trigonometry, Matrices, Vectors, and Probability.'
    },
    {
      id: 'ex-102',
      title: 'Science Practical',
      subject: 'Physics',
      date: '2026-07-28',
      time: '10:00 AM - 01:00 PM',
      duration: '3 Hours',
      maxMarks: 50,
      passingMarks: 17,
      room: 'Room 103 (Lab)',
      status: 'Upcoming',
      syllabus: 'Optics experiment (refraction through prism), Circuit diagrams (Ohm\'s Law verification), and Pendulum readings.'
    },
    {
      id: 'ex-103',
      title: 'First Unit Test',
      subject: 'English',
      date: '2026-05-12',
      time: '08:30 AM - 10:00 AM',
      duration: '1.5 Hours',
      maxMarks: 25,
      passingMarks: 8,
      room: 'Room 102',
      status: 'Completed',
      syllabus: 'Comprehension passage, Grammar (Tenses & Prepositions), Letter writing, Literature Chapter 1-3.'
    },
    {
      id: 'ex-104',
      title: 'Second Unit Test',
      subject: 'Physics',
      date: '2026-06-15',
      time: '08:30 AM - 10:00 AM',
      duration: '1.5 Hours',
      maxMarks: 25,
      passingMarks: 8,
      room: 'Room 103',
      status: 'Completed',
      syllabus: 'Mechanics, Kinematics, Laws of Motion, and Gravitation principles.'
    }
  ], []);

  // Merge static roster with database marks
  const mergedExams = useMemo(() => {
    const matchedIds = new Set<string>();
    
    // Map static roster
    const mappedStatic = examRoster.map(exam => {
      const dbMark = marks?.find(
        m => m.subject.toLowerCase() === exam.subject.toLowerCase() && 
             m.examName.toLowerCase() === exam.title.toLowerCase()
      );

      if (dbMark) {
        matchedIds.add(dbMark.id);
        return {
          ...exam,
          status: 'Completed' as const,
          maxMarks: dbMark.maxMarks,
          obtainedMarks: dbMark.marksObtained,
          remarks: dbMark.remarks
        };
      }
      return exam;
    });

    // Add unmatched db marks
    const unmatched = (marks || [])
      .filter(m => !matchedIds.has(m.id))
      .map((m, idx) => ({
        id: `db-exam-${idx}`,
        title: m.examName,
        subject: m.subject,
        date: new Date().toISOString().split('T')[0],
        time: 'N/A',
        duration: 'N/A',
        maxMarks: m.maxMarks,
        passingMarks: Math.round(m.maxMarks * 0.33),
        room: 'Online/N/A',
        status: 'Completed' as const,
        syllabus: 'Academic performance review.',
        obtainedMarks: m.marksObtained,
        remarks: m.remarks
      }));

    return [...mappedStatic, ...unmatched];
  }, [examRoster, marks]);

  // Filtered roster
  const filteredExams = useMemo(() => {
    return mergedExams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mergedExams, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = mergedExams.length;
    const upcoming = mergedExams.filter(e => e.status === 'Upcoming').length;
    const completed = mergedExams.filter(e => e.status === 'Completed').length;
    return { total, upcoming, completed };
  }, [mergedExams]);

  // Print Hall Ticket trigger
  const handlePrintHallTicket = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 text-slate-800 animate-fadeIn">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Examinations Timetable
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-455 mt-1 text-slate-500">Check upcoming exam schedules, room assignments, and print your hall ticket</p>
        </div>

        <button
          onClick={() => {
            setShowHallTicket(true);
            showToast('Generated exam admission card.', 'success');
          }}
          className="px-4 py-2.5 bg-blue-650 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer bg-blue-600"
        >
          <Printer className="w-4 h-4" /> Print Hall Ticket
        </button>
      </div>

      {/* TOP STATISTICS ROW */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Exams */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Exams</span>
            <span className="text-lg font-black text-slate-950 mt-1">{stats.total}</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Upcoming</span>
            <span className="text-lg font-black text-slate-950 mt-1 text-amber-650">{stats.upcoming}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Completed</span>
            <span className="text-lg font-black text-slate-950 mt-1 text-emerald-650">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search exams by subject or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-xs font-bold text-slate-650 cursor-pointer w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* EXAMS ROSTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => {
            const dateStr = new Date(exam.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
            
            const isCompleted = exam.status === 'Completed';

            return (
              <div 
                key={exam.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{exam.title}</h4>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5 mt-1.5 uppercase tracking-wider inline-block w-fit">
                      {exam.subject}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                      : 'bg-amber-50 border-amber-150 text-amber-600'
                  }`}>
                    {exam.status}
                  </span>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {exam.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {exam.room}</span>
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> {exam.maxMarks} Marks</span>
                </div>

                {/* Database Marks details if available */}
                {exam.obtainedMarks !== undefined && (
                  <div className="flex flex-col gap-2 bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-extrabold text-slate-800">
                          Score: {exam.obtainedMarks} / {exam.maxMarks} Marks
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        Number(exam.obtainedMarks) >= exam.passingMarks 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {Number(exam.obtainedMarks) >= exam.passingMarks ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    {exam.remarks && (
                      <p className="text-[10px] text-slate-500 font-semibold italic mt-0.5 leading-snug">
                        Teacher Remarks: {exam.remarks}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <button
                    onClick={() => setSelectedExam(exam)}
                    className="text-[9px] font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                  >
                    View Exam Syllabus <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Passing: {exam.passingMarks} Marks</span>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 py-20 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white">
            <BookOpen className="w-10 h-10 text-slate-350 stroke-1" />
            <p className="font-bold text-xs text-slate-500">No Exams Scheduled</p>
            <p className="text-[10px] text-slate-400">There are no exams matching your search filters.</p>
          </div>
        )}
      </div>

      {/* SYLLABUS MODAL */}
      {selectedExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Exam Syllabus</h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedExam.subject}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedExam(null)}
                className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 my-1 text-xs">
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-800 text-sm">{selectedExam.title}</span>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">Class {student.class} - Section {student.section}</p>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Chapters Included</span>
                <p className="text-slate-650 leading-relaxed font-semibold text-xs">{selectedExam.syllabus}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-50 pt-3">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Timetable
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRINTABLE HALL TICKET OVERLAY */}
      {showHallTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn print:relative print:inset-auto print:bg-white print:p-0 print:z-0">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full border border-slate-150 shadow-2xl flex flex-col gap-6 animate-scaleUp print:border-none print:shadow-none print:max-w-none">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img src="/ams-logo-icon.png" alt="AMS Logo" className="w-10 h-10 object-contain shrink-0" />
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">BHARAT PUBLIC SCHOOL</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Annual Examination Hall Ticket (2026-2027)</span>
                </div>
              </div>

              <button 
                onClick={() => setShowHallTicket(false)}
                className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-all cursor-pointer print:hidden"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Student metadata */}
            <div className="flex items-start gap-4 flex-col sm:flex-row pb-4 border-b border-slate-100">
              <img 
                src={student.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                alt={student.name} 
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
              />

              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-semibold text-slate-500 flex-1">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Student Name</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{student.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Admission ID</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{student.id}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Class & Section</span>
                  <span className="font-extrabold text-slate-800 block mt-1">Class {student.class} - {student.section}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Roll Number</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{student.rollNumber}</span>
                </div>
              </div>
            </div>

            {/* Exams schedule list */}
            <div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-3">Exam Roster Schedule</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4">Exam Date</th>
                      <th className="py-2.5 px-4">Time Slot</th>
                      <th className="py-2.5 px-4">Room No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {examRoster.map(ex => (
                      <tr key={ex.id}>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{ex.subject}</td>
                        <td className="py-2.5 px-4">{ex.date}</td>
                        <td className="py-2.5 px-4">{ex.time}</td>
                        <td className="py-2.5 px-4">{ex.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print trigger footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 print:hidden">
              <button
                type="button"
                onClick={() => setShowHallTicket(false)}
                className="px-5 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Ticket
              </button>

              <button
                type="button"
                onClick={handlePrintHallTicket}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Confirm & Print</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
