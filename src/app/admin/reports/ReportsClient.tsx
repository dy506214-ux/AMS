'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Copy, 
  Check, 
  Users, 
  UserSquare, 
  ShieldCheck, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  ArrowUpDown, 
  KeyRound,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  passwordHash: string;
}

interface ReportsClientProps {
  teachers: Teacher[];
  students: Student[];
}

interface ReportItem {
  id: string;
  role: 'Teacher' | 'Student';
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  classInfo: string;
  defaultPassword: string;
  passwordHash: string;
}

export default function ReportsClient({ teachers, students }: ReportsClientProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Teacher' | 'Student'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof ReportItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Track temporarily copied text IDs to show a Check icon instead of Copy
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Transform teachers and students into a unified list
  const allItems = useMemo<ReportItem[]>(() => {
    const list: ReportItem[] = [];
    
    // Add teachers
    teachers.forEach(t => {
      list.push({
        id: t.id,
        role: 'Teacher',
        uniqueId: t.employeeId,
        name: t.name,
        email: t.email,
        phone: t.phone || 'N/A',
        classInfo: 'N/A',
        defaultPassword: 'Teacher@2026',
        passwordHash: t.passwordHash
      });
    });

    // Add students
    students.forEach(s => {
      list.push({
        id: s.id,
        role: 'Student',
        uniqueId: s.rollNumber,
        name: s.name,
        email: s.email,
        phone: s.phone || 'N/A',
        classInfo: `Class ${s.class} - ${s.section}`,
        defaultPassword: 'Student@2026',
        passwordHash: s.passwordHash
      });
    });

    return list;
  }, [teachers, students]);

  // Filtering
  const filteredItems = useMemo(() => {
    return allItems
      .filter(item => {
        // Role filter
        if (roleFilter !== 'All' && item.role !== roleFilter) return false;
        
        // Search text
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.uniqueId.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.classInfo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allItems, search, roleFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    // Reset page if out of bounds
    const page = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
    const startIndex = (page - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage, totalPages]);

  // Sorting helper
  const handleSort = (field: keyof ReportItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all visible report items in markdown table format
  const handleCopyAllMarkdown = () => {
    if (filteredItems.length === 0) {
      showToast('No records to copy.', 'error');
      return;
    }

    let markdown = '| Role | ID/Roll No | Name | Email | Phone | Class/Section | Default Password | Password Hash |\n';
    markdown += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';
    
    filteredItems.forEach(item => {
      markdown += `| ${item.role} | ${item.uniqueId} | ${item.name} | ${item.email} | ${item.phone} | ${item.classInfo} | ${item.defaultPassword} | ${item.passwordHash} |\n`;
    });

    navigator.clipboard.writeText(markdown);
    showToast(`Copied ${filteredItems.length} records in Markdown format!`, 'success');
  };

  // Generate CSV and trigger browser download
  const handleDownloadCSV = () => {
    if (filteredItems.length === 0) {
      showToast('No data available to download.', 'error');
      return;
    }

    const headers = ['Role', 'ID/Roll Number', 'Name', 'Email', 'Phone', 'Class/Section', 'Default Password', 'Password Hash'];
    
    const rows = filteredItems.map(item => [
      item.role,
      item.uniqueId,
      item.name,
      item.email,
      item.phone,
      item.classInfo,
      item.defaultPassword,
      item.passwordHash
    ]);

    // Format rows correctly with CSV escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const str = val ? String(val) : '';
          // If the field contains quotes, commas, or newlines, escape quotes and wrap field in quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AMS_System_Credentials_${roleFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloaded CSV report containing ${filteredItems.length} records.`, 'success');
  };

  // Summary stats
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalStudents = students.length;
    return {
      total: totalTeachers + totalStudents,
      teachers: totalTeachers,
      students: totalStudents
    };
  }, [teachers, students]);

  return (
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Credentials & Accounts Report</h2>
          <p className="text-sm text-slate-500 mt-1">
            Query and download login accounts for teachers and students with default passwords and security hashes.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleCopyAllMarkdown}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all hover-lift active:scale-95 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy All (Markdown)
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-sky-600/10 transition-all hover-lift active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download CSV Report
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Active Accounts</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Teachers</span>
            <span className="text-3xl font-extrabold text-sky-600 tracking-tight">{stats.teachers}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Students</span>
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">{stats.students}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Control bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, roll/employee ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50/50"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto">
          {(['All', 'Teacher', 'Student'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {role === 'All' ? 'All Roles' : role + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-1">
                    Role <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('uniqueId')}>
                  <div className="flex items-center gap-1">
                    ID / Roll No <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Full Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">
                    Email Address <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6">Class/Sec</th>
                <th className="py-4 px-6">Default Password</th>
                <th className="py-4 px-6">Database Password Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              <AnimatePresence mode="popLayout">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, idx) => (
                    <motion.tr
                      key={item.role + '-' + item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, delay: idx * 0.02 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider leading-none ${
                          item.role === 'Teacher'
                            ? 'bg-sky-500/10 text-sky-700 border border-sky-500/20'
                            : 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20'
                        }`}>
                          {item.role === 'Teacher' ? (
                            <Briefcase className="w-3 h-3 inline" />
                          ) : (
                            <GraduationCap className="w-3 h-3 inline" />
                          )}
                          {item.role}
                        </span>
                      </td>

                      {/* Unique ID */}
                      <td className="py-4 px-6 font-mono font-bold text-slate-600 text-xs">
                        {item.uniqueId}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {item.name}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 group max-w-[200px] sm:max-w-none">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-600">{item.email}</span>
                          <button
                            onClick={() => handleCopy(item.email, item.id + '-email')}
                            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === item.id + '-email' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Class Info */}
                      <td className="py-4 px-6 text-xs font-semibold text-slate-500">
                        {item.classInfo !== 'N/A' ? (
                          <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200/50">
                            {item.classInfo}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Default Password */}
                      <td className="py-4 px-6 font-mono text-xs">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-100">
                            {item.defaultPassword}
                          </span>
                          <button
                            onClick={() => handleCopy(item.defaultPassword, item.id + '-pass')}
                            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                            title="Copy default password"
                          >
                            {copiedId === item.id + '-pass' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password Hash */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-between gap-1 max-w-[220px]">
                          <span className="font-mono text-[10px] text-slate-400 truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 select-all" title={item.passwordHash}>
                            {item.passwordHash}
                          </span>
                          <button
                            onClick={() => handleCopy(item.passwordHash, item.id + '-hash')}
                            className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 shrink-0 cursor-pointer"
                            title="Copy full hash"
                          >
                            {copiedId === item.id + '-hash' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-2 justify-center">
                        <Search className="w-8 h-8 text-slate-300" />
                        <span>No user credentials match your search.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table Footer - Pagination and rows per page controls */}
        {filteredItems.length > 0 && (
          <div className="border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
            {/* Range Indicator */}
            <div className="text-xs text-slate-500 font-medium">
              Showing{' '}
              <span className="text-slate-800 font-bold">
                {Math.min(filteredItems.length, (currentPage - 1) * itemsPerPage + 1)}
              </span>{' '}
              to{' '}
              <span className="text-slate-800 font-bold">
                {Math.min(filteredItems.length, currentPage * itemsPerPage)}
              </span>{' '}
              of <span className="text-slate-800 font-bold">{filteredItems.length}</span> entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Rows:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {[10, 25, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs text-slate-700 font-bold px-2">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
