'use client';

import React, { useState } from 'react';
import { Mail, Phone, User, Search, BookOpen, GraduationCap } from 'lucide-react';

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

interface ClassesClientProps {
  assignedStudents: Student[];
  classesAndSections: { class: string; section: string }[];
}

export default function ClassesClient({ assignedStudents, classesAndSections }: ClassesClientProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classesAndSections[0]?.class || '');
  const [selectedSection, setSelectedSection] = useState<string>(classesAndSections[0]?.section || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeStudents = assignedStudents.filter(
    s => s.class === selectedClass && s.section === selectedSection
  );

  const filteredStudents = activeStudents.filter(
    s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.rollNumber.includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">Assigned Classes</h2>
        <p className="text-sm text-slate-500 mt-1">Select an assigned class to view student directories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Classes List */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Allocations</span>
          <div className="flex flex-col gap-2.5">
            {classesAndSections.length > 0 ? (
              classesAndSections.map((item, idx) => {
                const isSelected = item.class === selectedClass && item.section === selectedSection;
                const count = assignedStudents.filter(s => s.class === item.class && s.section === item.section).length;
                return (
                  <button
                    key={`${item.class}-${item.section}`}
                    onClick={() => {
                      setSelectedClass(item.class);
                      setSelectedSection(item.section);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-blue-50'}`}>
                        <GraduationCap className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-tight">Class {item.class}</span>
                        <span className={`text-[10px] uppercase font-bold mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          Section {item.section}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      isSelected 
                        ? 'bg-white/15 border-white/10 text-white' 
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {count} Students
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No assigned classes found.</p>
            )}
          </div>
        </div>

        {/* Right Side: Student Directory Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Search bar inside student list */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-extrabold text-slate-800">
              Students in Class {selectedClass}{selectedSection} <span className="text-slate-400 text-xs font-medium">({filteredStudents.length})</span>
            </span>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 placeholder-slate-400 outline-none focus:bg-white focus:border-slate-200 transition-colors"
              />
            </div>
          </div>

          {/* Grid of Student Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                        Roll No: {student.rollNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 font-medium">
                    <a 
                      href={`mailto:${student.email}`}
                      className="flex items-center gap-2.5 text-slate-500 hover:text-blue-600 transition-colors py-0.5 truncate"
                    >
                      <Mail className="w-4 h-4 text-slate-450 shrink-0" />
                      <span>{student.email}</span>
                    </a>
                    <a 
                      href={`tel:${student.phone}`}
                      className="flex items-center gap-2.5 text-slate-500 hover:text-blue-600 transition-colors py-0.5 truncate"
                    >
                      <Phone className="w-4 h-4 text-slate-450 shrink-0" />
                      <span>{student.phone}</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-200/80 rounded-2xl py-12 text-center text-slate-400 text-xs font-bold flex flex-col gap-2 items-center">
                <Search className="w-8 h-8 text-slate-300" />
                <span>No students match the search criteria.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
