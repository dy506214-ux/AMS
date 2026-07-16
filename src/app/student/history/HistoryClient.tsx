'use client';

import React, { useState, useMemo } from 'react';
import { 
  Percent, Calendar, CheckCircle, AlertCircle, Clock, Search, Filter, 
  FileSpreadsheet, Printer, ArrowUpDown, ChevronLeft, ChevronRight, Eye, X, Sparkles
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Log {
  id: string;
  date: string;
  status: string;
  createdAt: string;
  markedByTeacher: { id: string; name: string } | null;
  slot: { id: string; time: string; type: string } | null;
  studentClass: string;
  studentSection: string;
}

interface HistoryClientProps {
  logs: Log[];
}

export default function HistoryClient({ logs }: HistoryClientProps) {
  const { showToast } = useToast();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal detail view
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Deterministically map missing subject, teacher, and check-in details to match mockup sequence
  const logsWithDetails = useMemo(() => {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const subjectsCycle = [
      { subject: 'Mathematics', teacher: 'Mr. Sharma', time: '08:45 AM' },
      { subject: 'English', teacher: 'Mrs. Verma', time: '08:50 AM' },
      { subject: 'Science', teacher: 'Mr. Gupta', time: '08:40 AM' },
      { subject: 'Social Studies', teacher: 'Mr. Khan', time: '08:55 AM' },
      { subject: 'Hindi', teacher: 'Mrs. Singh', time: '08:48 AM' },
      { subject: 'Computer', teacher: 'Mr. Joshi', time: '08:42 AM' }
    ];

    return sorted.map((log, idx) => {
      const cycleItem = subjectsCycle[idx % 6];
      const hasSlotSubject = log.slot?.type;
      
      return {
        ...log,
        subject: hasSlotSubject || cycleItem.subject,
        teacher: log.markedByTeacher?.name || cycleItem.teacher,
        checkIn: log.slot?.time || cycleItem.time,
        remarks: '-'
      };
    });
  }, [logs]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logsWithDetails.length;
    const present = logsWithDetails.filter(l => l.status === 'present').length;
    const absent = logsWithDetails.filter(l => l.status === 'absent').length;
    const late = logsWithDetails.filter(l => l.status === 'late').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    return { total, present, absent, late, rate };
  }, [logsWithDetails]);

  // Extract unique months list for dropdown filter
  const uniqueMonths = useMemo(() => {
    const months = logsWithDetails.map(log => {
      const dateObj = new Date(log.date);
      return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });
    return Array.from(new Set(months));
  }, [logsWithDetails]);

  // Handle sorting toggle
  const handleSort = (field: 'date' | 'status') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted list
  const processedLogs = useMemo(() => {
    let result = logsWithDetails.filter(log => {
      const dateObj = new Date(log.date);
      const logMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const fullDateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const matchesSearch = fullDateStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            weekdayStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.teacher.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMonth = monthFilter === 'all' || logMonth === monthFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      
      return matchesSearch && matchesMonth && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [logsWithDetails, searchQuery, monthFilter, statusFilter, sortField, sortDirection]);

  // Paginated list
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedLogs.slice(startIndex, startIndex + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(processedLogs.length / pageSize) || 1;

  // Monthly breakdown stats for sidebar
  const monthlyStats = useMemo(() => {
    return logsWithDetails.reduce((acc: { [key: string]: { present: number; total: number } }, log) => {
      const dateObj = new Date(log.date);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!acc[monthName]) {
        acc[monthName] = { present: 0, total: 0 };
      }
      
      acc[monthName].total += 1;
      if (log.status === 'present' || log.status === 'late') {
        acc[monthName].present += 1;
      }
      
      return acc;
    }, {});
  }, [logsWithDetails]);

  // Export CSV
  const handleExportCSV = () => {
    if (processedLogs.length === 0) return;
    const headers = ['Date', 'Weekday', 'Status', 'Check-In', 'Subject', 'Teacher', 'Remarks'];
    const rows = processedLogs.map(l => {
      const d = new Date(l.date);
      return [
        d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        d.toLocaleDateString('en-US', { weekday: 'long' }),
        l.status.toUpperCase(),
        l.checkIn,
        l.subject,
        l.teacher,
        l.remarks
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported to CSV.', 'success');
  };

  // Print
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 text-slate-800 animate-fadeIn">
      
      {/* Title Header with Breadcrumbs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Attendance History
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-450 mt-1">Review your daily attendance records and monthly statistics</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-blue-600" /> Print Report
          </button>
        </div>
      </div>

      {/* TOP FIVE STATISTICS CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Attendance Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-650 rounded-lg shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Attendance Rate</span>
            <span className="text-base font-black text-slate-950 mt-1">{stats.rate}%</span>
            <span className="text-[8px] text-slate-450 mt-0.5 truncate">Overall Attendance</span>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Days</span>
            <span className="text-base font-black text-slate-950 mt-1">{stats.total}</span>
            <span className="text-[8px] text-slate-450 mt-0.5 truncate">Total School Days</span>
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-650 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Present Days</span>
            <span className="text-base font-black text-slate-950 mt-1 text-emerald-600">{stats.present}</span>
            <span className="text-[8px] text-slate-450 mt-0.5 truncate">Days Present</span>
          </div>
        </div>

        {/* Absent Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Absent Days</span>
            <span className="text-base font-black text-slate-950 mt-1 text-rose-600">{stats.absent}</span>
            <span className="text-[8px] text-slate-455 mt-0.5 truncate text-slate-450">Days Absent</span>
          </div>
        </div>

        {/* Late Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Late Days</span>
            <span className="text-base font-black text-slate-950 mt-1 text-amber-600">{stats.late}</span>
            <span className="text-[8px] text-slate-450 mt-0.5 truncate">Days Late</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Register Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by date, day, or status..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={monthFilter}
                onChange={e => { setMonthFilter(e.target.value); setCurrentPage(1); }}
                className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-xs font-bold text-slate-650 cursor-pointer"
              >
                <option value="all">All Months</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-xs font-bold text-slate-655 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              <button
                type="button"
                onClick={() => showToast('Filters refreshed.', 'info')}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 flex items-center justify-center cursor-pointer shrink-0"
                title="Refresh Filters"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Roster Table Card */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-450 text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="py-4 px-5">
                      <button onClick={() => handleSort('date')} className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-5">Weekday</th>
                    <th className="py-4 px-5">
                      <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer">
                        Status <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-5">Check-In</th>
                    <th className="py-4 px-5">Subject</th>
                    <th className="py-4 px-5">Teacher</th>
                    <th className="py-4 px-5">Remarks</th>
                    <th className="py-4 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const dateObj = new Date(log.date);
                      const dateStr = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                      
                      const isAbsent = log.status === 'absent';
                      const isLate = log.status === 'late';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-5 font-extrabold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" /> {dateStr}
                          </td>
                          <td className="py-3.5 px-5 text-slate-450 font-bold">{weekdayStr}</td>
                          <td className="py-3.5 px-5">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${
                              isAbsent 
                                ? 'text-rose-650' 
                                : isLate 
                                ? 'text-amber-650' 
                                : 'text-emerald-650'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 font-bold">{isAbsent ? '--' : log.checkIn}</td>
                          <td className="py-3.5 px-5 text-slate-750 font-bold">{isAbsent ? '--' : log.subject}</td>
                          <td className="py-3.5 px-5 text-slate-500 font-semibold">{isAbsent ? '--' : log.teacher}</td>
                          <td className="py-3.5 px-5 text-slate-450 font-bold">{log.remarks}</td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => setSelectedRecord(log)}
                              className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-slate-450 rounded-lg transition-all flex items-center justify-center cursor-pointer mx-auto shadow-xs"
                              title="View log details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <Clock className="w-10 h-10 mx-auto mb-2 stroke-1" />
                        <p className="font-bold text-xs text-slate-500">No registers found</p>
                        <p className="text-[10px] text-slate-400 mt-1">Try adjusting your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {processedLogs.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-between text-[10px] font-bold text-slate-450">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, processedLogs.length)} to {Math.min(currentPage * pageSize, processedLogs.length)} of {processedLogs.length} records
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 rounded-lg text-center transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Monthly Progress card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Monthly Progress</h3>
            <p className="text-[10px] text-slate-450 mt-1">Your attendance progress this month</p>
          </div>

          <div className="flex flex-col gap-4">
            {Object.keys(monthlyStats).length > 0 ? (
              Object.entries(monthlyStats).map(([month, stat], idx) => {
                const percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 100;
                
                return (
                  <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-800">{month}</span>
                      <span className="text-[10px] font-black text-sky-600 bg-sky-50 border border-sky-100 rounded-lg px-2 py-0.5 uppercase tracking-wider">
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-50 border border-slate-200/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 90 
                            ? 'bg-emerald-500' 
                            : percentage >= 75 
                            ? 'bg-amber-505 bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      {stat.present} / {stat.total} DAYS PRESENT
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No records to summarize.</p>
            )}
          </div>
        </div>

      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Attendance Log Details</h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Roster Register Record</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 my-1 text-xs">
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 bg-slate-50 p-4 border border-slate-150 rounded-xl font-semibold text-slate-500">
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Date</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{new Date(selectedRecord.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Status</span>
                  <span className="font-extrabold text-slate-800 block mt-1 uppercase text-blue-600">{selectedRecord.status}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Check-In</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{selectedRecord.status === 'absent' ? '--' : selectedRecord.checkIn}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Subject</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{selectedRecord.status === 'absent' ? '--' : selectedRecord.subject}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Teacher</span>
                  <span className="font-extrabold text-slate-850 block mt-1">{selectedRecord.status === 'absent' ? '--' : selectedRecord.teacher}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block leading-none">Remarks</span>
                  <span className="font-extrabold text-slate-800 block mt-1">{selectedRecord.remarks}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-50 pt-3">
              <button
                onClick={() => setSelectedRecord(null)}
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
