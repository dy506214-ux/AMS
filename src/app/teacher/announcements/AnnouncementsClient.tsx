'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Megaphone, Plus, Calendar, Clock, Loader2, Tag, BookOpen, AlertCircle, 
  Trash2, Edit3, Eye, Copy, Share2, CheckCircle2, RefreshCw, X, Sparkles, 
  ArrowRight, Filter, ChevronLeft, ChevronRight, HelpCircle, Layers,
  ChevronDown, CalendarCheck, FileText, Globe, GraduationCap, Search,
  Bold, Italic, Underline, List, ListOrdered, Link2, Image, Send
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { 
  createAnnouncementAction, 
  updateAnnouncementAction, 
  deleteAnnouncementAction 
} from '@/lib/actions/teacher';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  priority: string;
  status: string;
  publishDate?: string | null;
  expiryDate?: string | null;
  audienceType: string;
  classId?: string | null;
  sectionId?: string | null;
  studentIds?: string | null;
  attachmentUrl?: string | null;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
  classesAndSections: { class: string; section: string }[];
  assignedStudents: Student[];
}

export default function AnnouncementsClient({ 
  announcements: initialAnnouncements, 
  classesAndSections,
  assignedStudents
}: AnnouncementsClientProps) {
  const { showToast } = useToast();
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'scheduled' | 'drafts'>('all');
  
  // Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('PTM Meeting');
  const [priority, setPriority] = useState('Normal');
  const [audienceType, setAudienceType] = useState('All Students');
  const [targetClass, setTargetClass] = useState(classesAndSections[0]?.class || '');
  const [targetSection, setTargetSection] = useState(classesAndSections[0]?.section || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('published'); // draft, published, scheduled
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);

  // Default to today's date formatted nicely for dateInfo
  const getFormattedDateInfo = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Timeline Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals & Previews
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rich Text simulated styles (inserted into description textarea)
  const handleEditorStyle = (style: string) => {
    let tagOpen = '';
    let tagClose = '';
    if (style === 'bold') { tagOpen = '<b>'; tagClose = '</b>'; }
    if (style === 'italic') { tagOpen = '<i>'; tagClose = '</i>'; }
    if (style === 'underline') { tagOpen = '<u>'; tagClose = '</u>'; }
    if (style === 'bullet') { tagOpen = '\n• '; tagClose = ''; }
    if (style === 'number') { tagOpen = '\n1. '; tagClose = ''; }
    if (style === 'link') { tagOpen = '<a href="#">'; tagClose = '</a>'; }
    if (style === 'image') { tagOpen = '[Image]'; tagClose = ''; }
    
    const textarea = document.getElementById('announcement-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = text.substring(0, start) + tagOpen + selected + tagClose + text.substring(end);
    setContent(replacement);
    textarea.focus();
  };

  // Sync / Simulated WebSocket Broadcast using LocalStorage
  const triggerSync = useCallback(() => {
    localStorage.setItem('announcements_sync', Date.now().toString());
  }, []);

  const handleSyncEvent = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to sync announcements:", err);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', (e) => {
      if (e.key === 'announcements_sync') {
        handleSyncEvent();
      }
    });
  }, [handleSyncEvent]);

  // Form Reset
  const handleResetForm = () => {
    setFormMode('create');
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('PTM Meeting');
    setPriority('Normal');
    setAudienceType('All Students');
    setTargetClass(classesAndSections[0]?.class || '');
    setTargetSection(classesAndSections[0]?.section || '');
    setSelectedStudentId('');
    setExpiryDate('');
    setStatus('published');
    setPublishDate(new Date().toISOString().split('T')[0]);
  };

  // Edit action
  const handleEditClick = (ann: Announcement) => {
    setFormMode('edit');
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setCategory(ann.category);
    setPriority(ann.priority);
    setAudienceType(ann.audienceType);
    let cls = ann.classId || '';
    let sec = ann.sectionId || '';
    if (ann.audienceType === 'Specific Students' && ann.studentIds && (!cls || !sec)) {
      const student = assignedStudents.find(s => s.id === ann.studentIds);
      if (student) {
        cls = student.class;
        sec = student.section;
      }
    }
    setTargetClass(cls || classesAndSections[0]?.class || '');
    setTargetSection(sec || classesAndSections[0]?.section || '');
    setSelectedStudentId(ann.studentIds || '');
    setExpiryDate(ann.expiryDate || '');
    setStatus(ann.status);
    setPublishDate(ann.publishDate || new Date().toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    setIsLoading(true);
    
    const dateInfoStr = status === 'scheduled'
      ? getFormattedDateInfo(publishDate)
      : getFormattedDateInfo(new Date().toISOString().split('T')[0]);

    const payload = {
      title,
      content,
      category,
      dateInfo: dateInfoStr,
      priority,
      status,
      publishDate: status === 'scheduled' ? publishDate : new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || undefined,
      audienceType,
      classId: audienceType === 'Specific Class' || audienceType === 'Specific Section' || audienceType === 'Specific Students' ? targetClass : undefined,
      sectionId: audienceType === 'Specific Section' || audienceType === 'Specific Students' ? targetSection : undefined,
      studentIds: audienceType === 'Specific Students' ? selectedStudentId : undefined
    };

    try {
      let res;
      if (formMode === 'create') {
        res = await createAnnouncementAction(payload);
      } else {
        if (!editingId) return;
        res = await updateAnnouncementAction(editingId, payload);
      }

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast(
          formMode === 'create' 
            ? 'Announcement published successfully!' 
            : 'Announcement updated successfully!', 
          'success'
        );
        handleResetForm();
        triggerSync();
        handleSyncEvent();
      }
    } catch {
      showToast('Network error processing request.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action Soft-delete
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deleteAnnouncementAction(deleteTargetId);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Announcement deleted successfully.', 'success');
        setDeleteTargetId(null);
        triggerSync();
        handleSyncEvent();
      }
    } catch {
      showToast('Network error deleting announcement.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplicate Action
  const handleDuplicate = async (ann: Announcement) => {
    setIsLoading(true);
    try {
      const res = await createAnnouncementAction({
        title: `${ann.title} (Copy)`,
        content: ann.content,
        category: ann.category,
        dateInfo: ann.dateInfo,
        priority: ann.priority,
        status: ann.status,
        publishDate: ann.publishDate || undefined,
        expiryDate: ann.expiryDate || undefined,
        audienceType: ann.audienceType,
        classId: ann.classId || undefined,
        sectionId: ann.sectionId || undefined,
        studentIds: ann.studentIds || undefined
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Announcement duplicated.', 'success');
        triggerSync();
        handleSyncEvent();
      }
    } catch {
      showToast('Network error duplicating.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy share link
  const handleShare = (ann: Announcement) => {
    if (typeof navigator !== 'undefined') {
      const link = `${window.location.origin}/student/announcements?id=${ann.id}`;
      navigator.clipboard.writeText(link);
      showToast('Shareable link copied to clipboard!', 'success');
    }
  };

  // Derived filter logic
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ann.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'published' && ann.status === 'published') ||
                         (activeTab === 'scheduled' && ann.status === 'scheduled') ||
                         (activeTab === 'drafts' && ann.status === 'draft');

      const matchesCategory = filterCategory === 'all' || ann.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || ann.priority === filterPriority;

      return matchesSearch && matchesTab && matchesCategory && matchesPriority;
    });
  }, [announcements, searchQuery, activeTab, filterCategory, filterPriority]);

  // Paginated Announcements
  const paginatedAnnouncements = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(startIndex, startIndex + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize) || 1;

  // Overview statistics
  const stats = useMemo(() => {
    return {
      total: announcements.length,
      published: announcements.filter(a => a.status === 'published').length,
      scheduled: announcements.filter(a => a.status === 'scheduled').length,
      drafts: announcements.filter(a => a.status === 'draft').length
    };
  }, [announcements]);

  // Activity Feed logs (deriving from last 5 edits/creates)
  const activityFeed = useMemo(() => {
    return announcements.slice(0, 5).map(ann => {
      let iconColor = 'bg-sky-500/10 text-sky-600';
      if (ann.status === 'published') iconColor = 'bg-emerald-500/10 text-emerald-600';
      if (ann.status === 'scheduled') iconColor = 'bg-amber-500/10 text-amber-600';
      if (ann.status === 'draft') iconColor = 'bg-rose-500/10 text-rose-600';

      return {
        id: ann.id,
        title: ann.title,
        status: ann.status,
        dateStr: formatTimeAgo(ann.createdAt),
        iconColor
      };
    });
  }, [announcements]);

  // Timeago helper
  function formatTimeAgo(createdAtStr: string) {
    try {
      const created = new Date(createdAtStr);
      const diff = Date.now() - created.getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} mins ago`;
      const hours = Math.floor(mins / 60);
      if (hours === 1) return '1 hour ago';
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return '1 day ago';
      return `${days} days ago`;
    } catch {
      return 'Recent';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-slate-800 animate-fadeIn">
      
      {/* LEFT PANEL: Create / Edit Announcement Form */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Creator Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
            <div className="p-3 bg-blue-600 text-white rounded-full">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {formMode === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Share important updates with students and parents</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Title *</label>
              <input
                type="text"
                placeholder="Enter announcement title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isLoading}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* Category and Priority row side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                >
                  <option value="PTM Meeting">PTM Meeting</option>
                  <option value="Holiday Notice">Holiday Notice</option>
                  <option value="School Event">School Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Content *</label>
              <div className="border border-slate-150 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all">
                {/* editor Toolbar */}
                <div className="bg-slate-50 border-b border-slate-150 px-3 py-2 flex items-center gap-1 text-slate-500">
                  <button type="button" onClick={() => handleEditorStyle('bold')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleEditorStyle('italic')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleEditorStyle('underline')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <button type="button" onClick={() => handleEditorStyle('bullet')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleEditorStyle('number')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <button type="button" onClick={() => handleEditorStyle('link')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Link"><Link2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleEditorStyle('image')} className="p-1.5 hover:bg-slate-200 rounded transition-all flex items-center justify-center cursor-pointer" title="Image"><Image className="w-3.5 h-3.5" /></button>
                </div>

                <textarea
                  id="announcement-editor"
                  placeholder="Write detailed announcement here..."
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full px-3.5 py-3 bg-white text-xs font-semibold focus:outline-none resize-none border-0"
                />
              </div>
            </div>

            {/* Audience selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Audience</label>
              <div className="grid grid-cols-4 gap-1">
                {['All Students', 'Specific Class', 'Specific Section', 'Specific Students'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAudienceType(type)}
                    className={`py-2 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                      audienceType === type
                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold shadow-inner'
                        : 'bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {type.split(' ')[1] ? type.split(' ')[1] : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Class/Section selection depending on audience selection */}
            {(audienceType === 'Specific Class' || audienceType === 'Specific Section') && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
                  <select
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-bold"
                  >
                    {Array.from(new Set(classesAndSections.map(c => c.class))).map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                {audienceType === 'Specific Section' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
                    <select
                      value={targetSection}
                      onChange={e => setTargetSection(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-bold"
                    >
                      {classesAndSections
                        .filter(c => c.class === targetClass)
                        .map(c => (
                          <option key={c.section} value={c.section}>Section {c.section}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Specific Student Select */}
            {audienceType === 'Specific Students' && (
              <div className="flex flex-col gap-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
                    <select
                      value={targetClass}
                      onChange={e => {
                        setTargetClass(e.target.value);
                        setSelectedStudentId('');
                      }}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-bold bg-slate-50 cursor-pointer"
                    >
                      {Array.from(new Set(classesAndSections.map(c => c.class))).map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
                    <select
                      value={targetSection}
                      onChange={e => {
                        setTargetSection(e.target.value);
                        setSelectedStudentId('');
                      }}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-bold bg-slate-50 cursor-pointer"
                    >
                      {classesAndSections
                        .filter(c => c.class === targetClass)
                        .map(c => (
                          <option key={c.section} value={c.section}>Section {c.section}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-bold bg-slate-50 cursor-pointer"
                  >
                    <option value="">Choose Student</option>
                    {assignedStudents
                      .filter(s => s.class === targetClass && s.section === targetSection)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Publishing Mode: Segmented Buttons */}
            <div className="border-t border-slate-100 pt-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500">Publishing Mode</label>
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => { setStatus('published'); }}
                    className={`px-3.5 py-1.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                      status === 'published' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatus('scheduled'); }}
                    className={`px-3.5 py-1.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                      status === 'scheduled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatus('draft'); }}
                    className={`px-3.5 py-1.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                      status === 'draft' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>

              {/* Schedule Date picker */}
              {status === 'scheduled' && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Schedule Date *</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={e => setPublishDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3 border-t border-slate-50 pt-4 mt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : formMode === 'create' ? (
                  <>
                    <Send className="w-3.5 h-3.5" /> Publish Announcement
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Update Announcement
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Recent Announcement Activity Feed */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Recent Announcement Activity</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {activityFeed.length > 0 ? (
              activityFeed.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${act.iconColor}`}>
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">{act.title}</span>
                      <span className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase">
                        {act.status}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-bold shrink-0 pl-2">
                    {act.dateStr}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 text-center py-4">No recent activity.</p>
            )}
          </div>

          <button 
            type="button" 
            onClick={() => setActiveTab('all')}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-500 mt-2 flex items-center justify-center gap-1 cursor-pointer w-full"
          >
            View All Activity <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* RIGHT PANEL: Stats Overview & Announcement List Timeline */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Overview Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4.5">
            <div className="p-3.5 bg-blue-600 text-white rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
              <span className="text-xl font-black text-slate-950 mt-1 leading-none">{stats.total}</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-1">Announcements</span>
            </div>
          </div>

          {/* Published */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4.5">
            <div className="p-3.5 bg-emerald-500 text-white rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Published</span>
              <span className="text-xl font-black text-slate-950 mt-1 leading-none">{stats.published}</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-1">Announcements</span>
            </div>
          </div>

          {/* Scheduled */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4.5">
            <div className="p-3.5 bg-amber-500 text-white rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Scheduled</span>
              <span className="text-xl font-black text-slate-950 mt-1 leading-none">{stats.scheduled}</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-1">Announcements</span>
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4.5">
            <div className="p-3.5 bg-pink-500 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Drafts</span>
              <span className="text-xl font-black text-slate-950 mt-1 leading-none">{stats.drafts}</span>
              <span className="text-[8px] text-slate-400 font-semibold mt-1">Announcements</span>
            </div>
          </div>
        </div>

        {/* All Announcements List Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">All Announcements</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage and track all your announcements</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8.5 pr-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold bg-slate-50 focus:bg-white outline-none w-48 transition-all"
                />
              </div>

              {/* Advanced Filter popover button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterPopover(!showFilterPopover)}
                  className={`px-3 py-2 border rounded-lg flex items-center gap-1.5 cursor-pointer transition-all text-[10px] font-bold ${
                    filterCategory !== 'all' || filterPriority !== 'all'
                      ? 'bg-sky-50 border-sky-300 text-sky-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>

                {showFilterPopover && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-xl shadow-lg p-3 z-30 flex flex-col gap-3 animate-scaleUp">
                    <div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Category</span>
                      <select
                        value={filterCategory}
                        onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="w-full p-1.5 border border-slate-200 rounded-md text-[10px] font-bold"
                      >
                        <option value="all">All Categories</option>
                        <option value="PTM Meeting">PTM Meeting</option>
                        <option value="Holiday Notice">Holiday Notice</option>
                        <option value="School Event">School Event</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Priority</span>
                      <select
                        value={filterPriority}
                        onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                        className="w-full p-1.5 border border-slate-200 rounded-md text-[10px] font-bold"
                      >
                        <option value="all">All Priorities</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Tabs Toggles */}
          <div className="flex gap-1.5 border-b border-slate-50 pb-2">
            {[
              { id: 'all', label: `All (${stats.total})`, count: stats.total },
              { id: 'published', label: `Published (${stats.published})`, count: stats.published },
              { id: 'scheduled', label: `Scheduled (${stats.scheduled})`, count: stats.scheduled },
              { id: 'drafts', label: `Drafts (${stats.drafts})`, count: stats.drafts }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === tab.id
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold shadow-inner'
                    : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none ${
                  activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-400'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Timeline list Cards */}
          <div className="flex flex-col gap-4 min-h-[300px]">
            {paginatedAnnouncements.length > 0 ? (
              paginatedAnnouncements.map((ann) => {
                const isHigh = ann.priority === 'High';
                const isLow = ann.priority === 'Low';
                
                // Color badges
                let priorityBorder = 'border-slate-100';
                if (isHigh) priorityBorder = 'border-rose-200';
                if (isLow) priorityBorder = 'border-blue-200';

                let circleIconColor = 'bg-blue-50 text-blue-500';
                if (ann.status === 'published') circleIconColor = 'bg-emerald-50 text-emerald-500';
                if (ann.status === 'scheduled') circleIconColor = 'bg-amber-50 text-amber-500';

                return (
                  <div
                    key={ann.id}
                    className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow relative ${priorityBorder}`}
                  >
                    {/* Left: Circle Icon + Content Details */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center ${circleIconColor}`}>
                        <Megaphone className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-xs leading-tight">{ann.title}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${
                            ann.status === 'published'
                              ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                              : ann.status === 'scheduled'
                              ? 'bg-amber-50 border-amber-150 text-amber-600'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {ann.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1.5 text-[9px] font-bold text-slate-400 uppercase leading-none">
                          <span className="text-slate-500">{ann.category}</span>
                          <span>•</span>
                          <span className="text-slate-500">{ann.audienceType}</span>
                        </div>

                        <p 
                          className="text-slate-600 text-xs leading-relaxed font-medium mt-2"
                          dangerouslySetInnerHTML={{ __html: ann.content }}
                        />
                      </div>
                    </div>

                    {/* Right: Date info + Quick Action Buttons Row */}
                    <div className="flex flex-col items-end gap-3.5 shrink-0 pl-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] text-slate-500 font-extrabold flex items-center gap-1 leading-none">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ann.dateInfo}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 leading-none mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-350" /> Posted {formatTimeAgo(ann.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewAnnouncement(ann)}
                          title="Preview notice"
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(ann)}
                          title="Edit announcement"
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(ann.id)}
                          title="Delete announcement"
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Option details menu trigger */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(ann);
                            }}
                            title="Share notice"
                            className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-20 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-350 stroke-1" />
                <p className="font-bold text-xs text-slate-500">No Announcements Found</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the creator panel on the left to write your first board note.</p>
              </div>
            )}
          </div>

          {/* Pagination bar */}
          {filteredAnnouncements.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-50 px-2 py-3.5 text-[10px] font-bold text-slate-450 mt-1">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredAnnouncements.length)} to {Math.min(currentPage * pageSize, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
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
                          : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-slate-250 rounded-lg px-2 py-1 text-[10px] font-bold bg-white text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* LIVE PREVIEW MODAL OVERLAY */}
      {previewAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Announcement Live Preview</h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Audience: {previewAnnouncement.audienceType}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setPreviewAnnouncement(null)}
                className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4.5 my-1 text-xs">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 text-sm">{previewAnnouncement.title}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{previewAnnouncement.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shrink-0 ${
                  previewAnnouncement.status === 'published'
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-600'
                    : previewAnnouncement.status === 'scheduled'
                    ? 'bg-amber-50 border-amber-150 text-amber-600'
                    : 'bg-slate-100 border-slate-205 text-slate-500'
                }`}>
                  {previewAnnouncement.status}
                </span>
              </div>

              {/* Rich text container */}
              <div 
                className="text-slate-650 leading-relaxed font-medium bg-slate-50 p-4 border border-slate-150 rounded-xl"
                dangerouslySetInnerHTML={{ __html: previewAnnouncement.content }}
              />

              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-50 pt-2.5">
                <span>Priority: <strong className={previewAnnouncement.priority === 'High' ? 'text-rose-600' : 'text-slate-600'}>{previewAnnouncement.priority}</strong></span>
                <span>Date: {previewAnnouncement.dateInfo}</span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-50 pt-3">
              <button
                onClick={() => setPreviewAnnouncement(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm">Delete Notice</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Are you sure you want to delete this announcement? This action will immediately remove the notice from all student dashboards.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
