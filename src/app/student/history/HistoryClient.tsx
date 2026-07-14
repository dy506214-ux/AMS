'use client';

import React, { useState } from 'react';
import { Calendar, Search, Filter, CalendarDays, Award, AlertCircle, Clock } from 'lucide-react';
import { Attendance } from '@/lib/db/jsonDb';

interface HistoryClientProps {
  logs: Attendance[];
}

export default function HistoryClient({ logs }: HistoryClientProps) {
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Parse logs to calculate monthly averages
  const monthlyStats = logs.reduce((acc: { [key: string]: { present: number; total: number } }, log) => {
    const dateObj = new Date(log.date);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthName]) {
      acc[monthName] = { present: 0, total: 0 };
    }
    
    acc[monthName].total += 1;
    if (log.status === 'present') {
      acc[monthName].present += 1;
    }
    
    return acc;
  }, {});

  // Extract unique months for the dropdown filter
  const uniqueMonths = Array.from(new Set(logs.map(log => {
    const dateObj = new Date(log.date);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })));

  // Apply filters
  const filteredLogs = logs.filter(log => {
    const dateObj = new Date(log.date);
    const logMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const matchesMonth = monthFilter === 'all' || logMonth === monthFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesMonth && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Register Table */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance History</h2>
          <p className="text-sm text-slate-500 mt-1">Review all your daily registers and filter by months</p>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center w-full">
            <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[150px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</label>
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Months</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[120px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/85 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Weekday</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const dateObj = new Date(log.date);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {dateObj.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-semibold">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase border ${
                            log.status === 'present'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      <Clock className="w-12 h-12 mx-auto mb-2 stroke-1" />
                      <p className="font-semibold text-sm">No registers found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Monthly Summary Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Monthly Summary</h3>
          <p className="text-xs text-slate-500 mt-1">Your progress month-by-month</p>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(monthlyStats).length > 0 ? (
            Object.entries(monthlyStats).map(([month, stat], idx) => {
              const percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 100;
              return (
                <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">{month}</span>
                    <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-lg">
                      {percentage}%
                    </span>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className={`h-full rounded-full transition-all duration-550 ${
                        percentage >= 90 
                          ? 'bg-emerald-500' 
                          : percentage >= 75 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>{stat.present} / {stat.total} Sessions present</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No records to summarize.</p>
          )}
        </div>
      </div>
    </div>
  );
}
