'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, Search, Filter, BookMarked, Eye, X, Sparkles, Clock, 
  Tag, Calendar, Bookmark, CheckCircle, ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  priority: string;
  status: string;
  audienceType: string;
  createdAt: string;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
}

export default function AnnouncementsClient({ announcements }: AnnouncementsClientProps) {
  const { showToast } = useToast();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'bookmarked'>('all');
  
  // Bookmarks & Read States in LocalStorage
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readNotices, setReadNotices] = useState<string[]>([]);
  
  // Modals & Pagination
  const [activeNotice, setActiveNotice] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Load flags from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBookmarks = localStorage.getItem('student_bookmarks');
      const savedRead = localStorage.getItem('student_read_notices');
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (savedRead) setReadNotices(JSON.parse(savedRead));
    }
  }, []);

  // Save Bookmarks
  const toggleBookmark = (id: string) => {
    let updated;
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter(b => b !== id);
      showToast('Announcement removed from bookmarks.', 'info');
    } else {
      updated = [...bookmarks, id];
      showToast('Announcement bookmarked successfully!', 'success');
    }
    setBookmarks(updated);
    localStorage.setItem('student_bookmarks', JSON.stringify(updated));
  };

  // Mark Read
  const toggleRead = (id: string) => {
    let updated;
    if (readNotices.includes(id)) {
      updated = readNotices.filter(r => r !== id);
    } else {
      updated = [...readNotices, id];
      showToast('Announcement marked as read.', 'success');
    }
    setReadNotices(updated);
    localStorage.setItem('student_read_notices', JSON.stringify(updated));
  };

  // Filtered & Searched list
  const filteredNotices = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ann.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || ann.category === categoryFilter;
      
      const isUnread = !readNotices.includes(ann.id);
      const isBookmarked = bookmarks.includes(ann.id);

      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'unread' && isUnread) ||
                         (activeTab === 'bookmarked' && isBookmarked);

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [announcements, searchQuery, categoryFilter, activeTab, bookmarks, readNotices]);

  // Paginated list
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotices.slice(start, start + pageSize);
  }, [filteredNotices, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotices.length / pageSize) || 1;

  // Unread notice count
  const unreadCount = useMemo(() => {
    return announcements.filter(a => !readNotices.includes(a.id)).length;
  }, [announcements, readNotices]);

  // Relative Timeago
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} mins ago`;
      const hours = Math.floor(mins / 60);
      if (hours === 1) return '1 hour ago';
      if (hours < 24) return `${hours} hours ago`;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 text-slate-800 animate-fadeIn">
      
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Announcements
            <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-450 mt-1">Stay updated with official bulletins, holiday lists, and events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col gap-5">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Bulletins Directory</h3>
          
          {/* Quick Filters */}
          <div className="flex flex-col gap-2">
            {[
              { id: 'all', label: 'All Notices', count: announcements.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'bookmarked', label: 'Bookmarks', count: bookmarks.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                  activeTab === tab.id
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold'
                    : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                  activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-400'
                }`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Category Dropdown Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Select Category</label>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="PTM Meeting">PTM Meeting</option>
              <option value="Holiday Notice">Holiday Notice</option>
              <option value="School Event">School Event</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Right Notices List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search notices by title, contents..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-slate-350 transition-colors"
              />
            </div>
          </div>

          {/* Notice cards list */}
          <div className="flex flex-col gap-4 min-h-[300px]">
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((ann) => {
                const isBookmarked = bookmarks.includes(ann.id);
                const isRead = readNotices.includes(ann.id);

                return (
                  <div
                    key={ann.id}
                    className={`bg-white border border-slate-100 rounded-2xl p-4.5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-md transition-shadow relative ${
                      !isRead ? 'border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
                        <Megaphone className="w-4.5 h-4.5" />
                      </div>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-xs leading-tight">{ann.title}</h4>
                          {!isRead && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-450 uppercase leading-none">
                          <span className="flex items-center gap-0.5 text-slate-500"><Tag className="w-2.5 h-2.5 shrink-0" /> {ann.category}</span>
                          <span>•</span>
                          <span className="text-blue-600">{ann.audienceType}</span>
                        </div>

                        <p 
                          className="text-slate-600 text-xs leading-relaxed font-medium mt-2.5"
                          dangerouslySetInnerHTML={{ __html: ann.content }}
                        />
                      </div>
                    </div>

                    {/* Actions & Dates */}
                    <div className="flex flex-col items-end gap-3.5 shrink-0 pl-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] text-slate-500 font-extrabold flex items-center gap-1 leading-none">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ann.dateInfo}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 leading-none mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-350" /> {formatTimeAgo(ann.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveNotice(ann);
                            if (!isRead) toggleRead(ann.id);
                          }}
                          className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          title="Open notice details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleBookmark(ann.id)}
                          className={`w-7 h-7 border rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                            isBookmarked 
                              ? 'bg-blue-50 border-blue-300 text-blue-600' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650'
                          }`}
                          title="Bookmark announcement"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleRead(ann.id)}
                          className={`w-7 h-7 border rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                            isRead 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650'
                          }`}
                          title={isRead ? "Mark as unread" : "Mark as read"}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-20 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white">
                <Megaphone className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="font-bold text-xs text-slate-500">No Announcements Found</p>
                <p className="text-[10px] text-slate-400 mt-0.5">There are no bulletins currently matches the select options.</p>
              </div>
            )}
          </div>

          {/* Pagination bar */}
          {filteredNotices.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-50 px-2 py-3.5 text-[10px] font-bold text-slate-450 mt-1 bg-white rounded-xl border border-slate-100 p-4">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredNotices.length)} to {Math.min(currentPage * pageSize, filteredNotices.length)} of {filteredNotices.length} notices
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:pointer-events-none"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* NOTICE PREVIEW MODAL OVERLAY */}
      {activeNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-150 shadow-2xl flex flex-col gap-4 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Bulletin Announcement</h4>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Category: {activeNotice.category}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveNotice(null)}
                className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4.5 my-1 text-xs">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-900 text-sm">{activeNotice.title}</span>
                  <span className="text-[9px] text-slate-450 font-bold mt-1 uppercase tracking-wider">{activeNotice.category}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => toggleBookmark(activeNotice.id)}
                  className={`p-1.5 border rounded-lg transition-all ${
                    bookmarks.includes(activeNotice.id)
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-450'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* description */}
              <div 
                className="text-slate-650 leading-relaxed font-medium bg-slate-50 p-4 border border-slate-150 rounded-xl"
                dangerouslySetInnerHTML={{ __html: activeNotice.content }}
              />

              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-55 pt-2.5">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {activeNotice.dateInfo}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTimeAgo(activeNotice.createdAt)}</span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-50 pt-3">
              <button
                onClick={() => setActiveNotice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Notice
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
