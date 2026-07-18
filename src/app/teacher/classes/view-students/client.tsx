'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, Check, X, Clock, GraduationCap, Search, Filter, 
  ChevronLeft, ChevronRight, Eye, Edit3, MessageSquare, 
  MoreVertical, FileSpreadsheet, Printer, Download, Sparkles, 
  MapPin, Phone, Heart, Calendar, Shield, CreditCard, BookOpen, QrCode
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  class: string;
  section: string;
  attendanceToday: string;
  attendancePercentage: number;
}

interface ViewStudentsClientProps {
  classId: string;
  sectionId: string;
  teacher: {
    name: string;
    photoUrl: string;
  };
  students: Student[];
  stats: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    totalSubjects: number;
    subjects: string[];
    roomNumber: string;
    dateLabel: string;
  };
}

export default function ViewStudentsClient({
  classId,
  sectionId,
  teacher,
  students,
  stats
}: ViewStudentsClientProps) {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'unmarked'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const pageSize = 8;

  // Helper to determine gender from name deterministically
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

  // Helper to generate details deterministically based on student ID
  const getStudentDetails = (s: Student) => {
    const idNum = parseInt(s.id.replace('ADM-', '')) || 1000;
    
    // DOB
    const dobYears = [2017, 2018, 2019];
    const dobYear = dobYears[idNum % 3];
    const dobMonthIdx = idNum % 12;
    const dobDay = (idNum % 28) + 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dob = `${dobDay} ${months[dobMonthIdx]} ${dobYear}`;

    // Blood group
    const bloods = ['A+', 'O+', 'B+', 'AB+', 'A-', 'O-'];
    const bloodGroup = bloods[idNum % bloods.length];

    // Parent details
    const lastName = s.name.split(' ').slice(1).join(' ') || 'Sharma';
    const fatherName = `Mr. Rajesh ${lastName}`;
    const motherName = `Mrs. Suman ${lastName}`;
    const guardianName = `${fatherName}`;

    // Address
    const cities = ['Sector 62, Noida', 'Indirapuram, Ghaziabad', 'Dwarka Sector 10, Delhi', 'Rohini Sector 15, Delhi', 'Sohna Road, Gurugram'];
    const address = `${idNum % 200 + 1}, Pocket B, ${cities[idNum % cities.length]}`;

    // Fee Status
    const feeStatus = idNum % 10 === 0 ? 'Pending' : 'Paid';

    return {
      dob,
      bloodGroup,
      fatherName,
      motherName,
      guardianName,
      address,
      feeStatus
    };
  };

  // Filtered and sorted students list
  const filteredStudents = useMemo(() => {
    let result = students.filter(s => {
      const gender = getGenderByName(s.name);
      
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.rollNumber.includes(searchQuery) || 
                            s.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGender = genderFilter === 'all' || gender === genderFilter;
      const matchesAttendance = attendanceFilter === 'all' || s.attendanceToday === attendanceFilter;

      return matchesSearch && matchesGender && matchesAttendance;
    });

    // Sort by roll number
    result.sort((a, b) => {
      const aRoll = parseInt(a.rollNumber) || 0;
      const bRoll = parseInt(b.rollNumber) || 0;
      return sortDir === 'asc' ? aRoll - bRoll : bRoll - aRoll;
    });

    return result;
  }, [students, searchQuery, genderFilter, attendanceFilter, sortDir]);

  // Paginated students list
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Percentage Calculations
  const presentPercentage = stats.totalStudents > 0 ? Math.round((stats.presentToday / stats.totalStudents) * 100) : 0;
  const absentPercentage = stats.totalStudents > 0 ? Math.round((stats.absentToday / stats.totalStudents) * 100) : 0;
  const latePercentage = stats.totalStudents > 0 ? Math.round((stats.lateToday / stats.totalStudents) * 100) : 0;

  // Actions
  const handleClearFilters = () => {
    setSearchQuery('');
    setGenderFilter('all');
    setAttendanceFilter('all');
    setSortDir('asc');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Admission No', 'Name', 'Gender', 'Email', 'Phone', 'Attendance Today'];
    const rows = filteredStudents.map(s => [
      s.rollNumber,
      s.id,
      s.name,
      getGenderByName(s.name),
      s.email,
      s.phone,
      s.attendanceToday.toUpperCase()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Class_${classId}-${sectionId}_Students_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24 text-slate-800 animate-fadeIn">
      
      {/* 1. Page Title Header & Breadcrumbs */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <Link href="/teacher" className="hover:text-slate-600 transition-colors">Teacher Portal</Link>
            <span>/</span>
            <Link href="/teacher/classes" className="hover:text-slate-600 transition-colors">Classes</Link>
            <span>/</span>
            <span className="text-slate-500">Class {classId} - Section {sectionId}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Class {classId} - Section {sectionId} Roster
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse animate-duration-1000" />
          </h2>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Students</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{stats.totalStudents}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">Students in class</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Present Today</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{stats.presentToday}</span>
            <span className="text-[9px] text-emerald-600 font-bold mt-1 truncate">{presentPercentage}% Present</span>
          </div>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
            <X className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Absent Today</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{stats.absentToday}</span>
            <span className="text-[9px] text-rose-600 font-bold mt-1 truncate">{absentPercentage}% Absent</span>
          </div>
        </div>

        {/* Late Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Late Today</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{stats.lateToday}</span>
            <span className="text-[9px] text-amber-600 font-bold mt-1 truncate">{latePercentage}% Late</span>
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Subjects</span>
            <span className="text-lg font-black text-slate-900 leading-none mt-1">{stats.totalSubjects}</span>
            <span className="text-[9px] text-slate-400 mt-1 truncate">Subjects assigned</span>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search & Action Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-colors"
          />
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-650 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-650 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print List
          </button>
        </div>
      </div>

      {/* Expanded Filters Drawer */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-wrap gap-4 items-end animate-slideDown">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
            <select
              value={genderFilter}
              onChange={e => { setGenderFilter(e.target.value as any); setCurrentPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attendance Today</label>
            <select
              value={attendanceFilter}
              onChange={e => { setAttendanceFilter(e.target.value as any); setCurrentPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="unmarked">Unmarked</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Roll Sort Order</label>
            <select
              value={sortDir}
              onChange={e => { setSortDir(e.target.value as any); setCurrentPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="asc">Ascending (1 - 25)</option>
              <option value="desc">Descending (25 - 1)</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-650 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 4. Left Table & Right Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Student Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6 text-center w-16">Roll No</th>
                  <th className="py-4 px-4">Student Name</th>
                  <th className="py-4 px-4 w-24">Gender</th>
                  <th className="py-4 px-4 w-32">Date of Birth</th>
                  <th className="py-4 px-4 w-36">Parent Contact</th>
                  <th className="py-4 px-4 text-center w-28">Attendance</th>
                  <th className="py-4 px-6 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s) => {
                    const gender = getGenderByName(s.name);
                    const details = getStudentDetails(s);
                    
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/30 transition-all">
                        {/* Roll number */}
                        <td className="py-3 px-6 text-center font-bold text-slate-500">
                          {parseInt(s.rollNumber)}
                        </td>
                        
                        {/* Photo & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.photoUrl}
                              alt={s.name}
                              className="w-8 h-8 rounded-full border border-slate-100 object-cover shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-800 leading-tight">{s.name}</span>
                              <span className="text-[9px] text-slate-455 mt-0.5 font-semibold uppercase tracking-wider">{s.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Gender */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                            gender === 'Female' 
                              ? 'bg-pink-50 text-pink-700 border border-pink-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {gender}
                          </span>
                        </td>

                        {/* DOB */}
                        <td className="py-3 px-4 text-slate-600 font-semibold">
                          {details.dob}
                        </td>

                        {/* Parent contact */}
                        <td className="py-3 px-4 text-slate-650 font-mono">
                          {s.phone}
                        </td>

                        {/* Attendance Today */}
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider border ${
                            s.attendanceToday === 'present'
                              ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                              : s.attendanceToday === 'absent'
                              ? 'bg-rose-50 border-rose-150 text-rose-600'
                              : s.attendanceToday === 'late'
                              ? 'bg-amber-50 border-amber-150 text-amber-600'
                              : 'bg-slate-100 border-slate-200 text-slate-450'
                          }`}>
                            {s.attendanceToday === 'present' ? 'Present' : s.attendanceToday === 'absent' ? 'Absent' : s.attendanceToday === 'late' ? 'Late' : 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-all cursor-pointer"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                      No students found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-455">
              Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border ${
                    currentPage === i + 1
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.max(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Class Information & Attendance Chart */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: Class Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Class Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
                <span className="font-extrabold text-slate-850 mt-1">Class {classId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Section</span>
                <span className="font-extrabold text-slate-850 mt-1">Section {sectionId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class Teacher</span>
                <span className="font-extrabold text-slate-800 mt-1">{teacher.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Room Number</span>
                <span className="font-extrabold text-slate-850 mt-1">{stats.roomNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
                <span className="font-extrabold text-slate-850 mt-1">{stats.totalStudents}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</span>
                <span className="font-extrabold text-slate-850 mt-1">2026</span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-3 flex flex-col text-xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class Timing</span>
              <span className="font-extrabold text-slate-750 mt-1">09:00 AM - 03:00 PM</span>
            </div>
          </div>

          {/* Card 2: Attendance Overview (Donut Chart) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Attendance Overview</h3>
            </div>

            <div className="flex flex-col items-center justify-center gap-5 py-4">
              {/* Circular SVG Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  
                  {/* Present Circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    stroke="#10b981" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={238.76} 
                    strokeDashoffset={238.76 - (238.76 * presentPercentage) / 100} 
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  
                  {/* Absent Circle (Offsetting Present) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    stroke="#f43f5e" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={238.76} 
                    strokeDashoffset={238.76 - (238.76 * absentPercentage) / 100} 
                    transform={`rotate(${360 * (presentPercentage / 100)}, 50, 50)`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* Late Circle (Offsetting Present + Absent) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    stroke="#f59e0b" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={238.76} 
                    strokeDashoffset={238.76 - (238.76 * latePercentage) / 100} 
                    transform={`rotate(${360 * ((presentPercentage + absentPercentage) / 100)}, 50, 50)`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{presentPercentage}%</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest mt-1">Present</span>
                </div>
              </div>

              {/* Legend details */}
              <div className="w-full flex flex-col gap-2.5 text-[11px] font-semibold text-slate-650 font-medium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Present Today</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{stats.presentToday} ({presentPercentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span>Absent Today</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{stats.absentToday} ({absentPercentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>Late Today</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{stats.lateToday} ({latePercentage}%)</span>
                </div>
                <div className="border-t border-slate-105 pt-2 flex items-center justify-between text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                  <span>Total Students</span>
                  <span>{stats.totalStudents}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 5. Detailed Student Profile Modal Overlay */}
      {selectedStudent && (() => {
        const details = getStudentDetails(selectedStudent);
        const gender = getGenderByName(selectedStudent.name);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh] my-8 animate-scaleUp">
              
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-black text-slate-800">Student Detailed Profile</span>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 hover:bg-slate-200 text-slate-455 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                
                {/* Section A: Header Info Card */}
                <div className="flex flex-col md:flex-row gap-5 items-center md:items-start border-b border-slate-100 pb-5">
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.name}
                    className="w-24 h-24 rounded-full border border-slate-200 object-cover shrink-0 shadow-xs"
                  />
                  <div className="flex-1 flex flex-col gap-2 text-center md:text-left">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedStudent.name}</h3>
                      <span className="text-[10px] font-bold text-slate-455 mt-1 inline-block uppercase tracking-wider">Admission No: {selectedStudent.id}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start text-[10px] font-extrabold uppercase tracking-wide">
                      <span className="bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded-md">Roll No: {parseInt(selectedStudent.rollNumber)}</span>
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">Class: {selectedStudent.class} - {selectedStudent.section}</span>
                      <span className={`px-2.5 py-0.5 rounded-md ${gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-sky-50 text-sky-700'}`}>{gender}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="border border-slate-150 p-2 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    <QrCode className="w-16 h-16 text-slate-750" />
                  </div>
                </div>

                {/* Section B: Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                  
                  {/* Card: Personal Details */}
                  <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                        <span className="font-extrabold text-slate-700 mt-1">{details.dob}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                        <span className="font-extrabold text-slate-700 mt-1">{details.bloodGroup}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                        <span className="font-extrabold text-slate-700 mt-1 font-mono">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fee Status</span>
                        <span className={`font-black mt-1 text-[10px] px-2 py-0.5 rounded-md inline-block text-center border uppercase tracking-wider w-fit ${
                          details.feeStatus === 'Paid' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>{details.feeStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card: Family Information */}
                  <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" /> Parent Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col col-span-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Father's Name</span>
                        <span className="font-extrabold text-slate-700 mt-1">{details.fatherName}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mother's Name</span>
                        <span className="font-extrabold text-slate-700 mt-1">{details.motherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Addresses */}
                  <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Contact & Address details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col col-span-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Home Address</span>
                        <span className="font-extrabold text-slate-750 mt-1 leading-relaxed">{details.address}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</span>
                        <span className="font-extrabold text-slate-700 mt-1 font-mono">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Email</span>
                        <span className="font-extrabold text-slate-700 mt-1 break-all">{selectedStudent.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card: Attendance Stats */}
                  <div className="flex flex-col gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                    <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Academic & Attendance History
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col items-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                        <span className="text-base font-black text-slate-850 mt-1.5">{selectedStudent.attendancePercentage}%</span>
                      </div>
                      <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col items-center">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Today status</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md ${
                          selectedStudent.attendanceToday === 'present' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : selectedStudent.attendanceToday === 'absent'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-slate-100 text-slate-450'
                        }`}>{selectedStudent.attendanceToday === 'present' ? 'Present' : selectedStudent.attendanceToday === 'absent' ? 'Absent' : 'Pending'}</span>
                      </div>
                      <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col items-center col-span-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Subjects</span>
                        <span className="text-[9px] font-extrabold text-slate-650 mt-1.5 truncate max-w-full leading-normal">
                          {stats.subjects.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-650 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
