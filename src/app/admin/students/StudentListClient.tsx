'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  X, 
  UserCircle, 
  Phone, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  Loader2, 
  AlertCircle,
  Eye,
  UserCheck
} from 'lucide-react';
import { createStudentAction, updateStudentAction, deleteStudentAction } from '@/lib/actions/admin';
import { useToast } from '@/context/ToastContext';
import { Student, Teacher } from '@/lib/db/jsonDb';

interface StudentListClientProps {
  initialStudents: Student[];
  teachers: Teacher[];
}

export default function StudentListClient({ initialStudents, teachers }: StudentListClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { showToast } = useToast();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');

  // Filtering
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open modals handlers
  const openCreate = () => {
    setRollNumber('');
    setName('');
    setEmail('');
    setPhone('');
    setClassName('Grade 10');
    setSection('A');
    setTeacherId(teachers[0]?.id || '');
    setPhotoUrl('');
    setPassword('');
    setIsCreateOpen(true);
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setRollNumber(student.rollNumber);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setClassName(student.class);
    setSection(student.section);
    setTeacherId(student.teacherId || '');
    setPhotoUrl(student.photoUrl);
    setPassword(''); // Leave blank unless changing
    setIsEditOpen(true);
  };

  const openDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const openProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  // Helper to find teacher name by ID
  const getTeacherName = (tId: string) => {
    const teacher = teachers.find(t => t.id === tId);
    return teacher ? teacher.name : 'Unassigned';
  };

  // Submit operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber || !name || !email || !phone || !className || !section || !teacherId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    const result = await createStudentAction({
      rollNumber,
      name,
      email,
      phone,
      class: className,
      section,
      teacherId,
      photoUrl: photoUrl || undefined,
      password: password || undefined
    });

    setIsLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
    } else if (result.success && result.student) {
      showToast('Student enrolled successfully.', 'success');
      setStudents(prev => [...prev, result.student as Student]);
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!rollNumber || !name || !email || !phone || !className || !section || !teacherId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    const result = await updateStudentAction(selectedStudent.id, {
      rollNumber,
      name,
      email,
      phone,
      class: className,
      section,
      teacherId,
      photoUrl,
      password: password || undefined
    });

    setIsLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
    } else if (result.success && result.student) {
      showToast('Student details updated successfully.', 'success');
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? (result.student as Student) : s));
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    const result = await deleteStudentAction(selectedStudent.id);
    setIsLoading(false);

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Student record deleted successfully.', 'success');
      setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
      setIsDeleteOpen(false);
      setSelectedStudent(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h2>
          <p className="text-sm text-slate-500 mt-1">Enroll, update, and manage student directories</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-sky-500/10 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Enroll Student</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search by name, roll number, email, or class..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all shadow-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Avatar</th>
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Class/Sec</th>
                <th className="py-4 px-6">Assigned Teacher</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{student.rollNumber}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/50">
                        {student.class} - {student.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {getTeacherName(student.teacherId || '')}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openProfile(student)}
                          title="View Profile"
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(student)}
                          title="Edit"
                          className="p-2 hover:bg-sky-500/10 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(student)}
                          title="Delete"
                          className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserCircle className="w-12 h-12 mx-auto mb-2 stroke-1" />
                    <p className="font-semibold text-sm">No students found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or enroll a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modals overlay */}
      <AnimatePresence>
        {/* Create Student Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Enroll Student</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROLL104"
                    value={rollNumber}
                    onChange={e => setRollNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student.name@school.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1-555-xxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class *</label>
                    <select
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section *</label>
                    <select
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Tutor (Teacher) *</label>
                  <select
                    value={teacherId}
                    onChange={e => setTeacherId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://unsplash.com/..."
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Default is password123"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Edit Student</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={e => setRollNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class *</label>
                    <select
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section *</label>
                    <select
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Tutor (Teacher) *</label>
                  <select
                    value={teacherId}
                    onChange={e => setTeacherId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Change Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Update</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 flex flex-col items-center text-center gap-4"
            >
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-full w-fit">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Delete Student?</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Are you sure you want to delete student <span className="font-bold text-slate-800">{selectedStudent.name}</span>? This action will remove the student profile and erase all their attendance history. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1 shadow-md shadow-rose-500/10"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Profile Modal */}
        {isProfileOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Student Profile</h3>
                <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-md">
                  {selectedStudent.photoUrl ? (
                    <img src={selectedStudent.photoUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h4>
                  <span className="text-xs text-sky-600 font-bold bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 mt-1 inline-block uppercase tracking-wider">Student</span>
                </div>

                <div className="w-full border-t border-slate-100 pt-5 flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Class & Section</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.class} - {selectedStudent.section}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Roll Number</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.rollNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Tutor</span>
                      <span className="font-semibold text-slate-800">{getTeacherName(selectedStudent.teacherId || '')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
