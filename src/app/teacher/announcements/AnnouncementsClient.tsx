'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, Calendar, Clock, Loader2, Tag, BookOpen } from 'lucide-react';
import { createAnnouncementAction } from '@/lib/actions/teacher';
import { useToast } from '@/context/ToastContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  dateInfo: string;
  createdAt: Date | string;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
}

export default function AnnouncementsClient({ announcements }: AnnouncementsClientProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('PTM');
  
  // Default to today's date formatted nicely for the event date field
  const defaultDateInfo = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const [dateInfo, setDateInfo] = useState<string>(defaultDateInfo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !dateInfo.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createAnnouncementAction({
        title,
        content,
        category,
        dateInfo
      });

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Announcement posted successfully!', 'success');
        setTitle('');
        setContent('');
        setCategory('PTM');
        setDateInfo(defaultDateInfo);
      }
    } catch {
      showToast('Network error posting announcement.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for time ago relative to July 16, 2026
  const formatTimeAgo = (createdAt: Date | string) => {
    const created = new Date(createdAt);
    const diff = new Date('2026-07-16T21:48:30').getTime() - created.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">School Announcements</h2>
        <p className="text-sm text-slate-500 mt-1">Publish notices for parents and students, or review current boards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create Announcement Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Post Announcement</h3>
            <p className="text-xs text-slate-400 mt-1">Create notices that will show up on students' feed</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Science Exhibition 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              >
                <option value="PTM">PTM Meeting</option>
                <option value="Holiday">Holiday Notice</option>
                <option value="Event">School Event</option>
              </select>
            </div>

            {/* Target Date Info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Information</label>
              <input
                type="text"
                placeholder="e.g. July 25, 2026"
                value={dateInfo}
                onChange={(e) => setDateInfo(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice content</label>
              <textarea
                placeholder="Write detailed announcements here..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Announcement</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Announcements Feed List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Notices Board ({announcements.length})</span>
          
          <div className="flex flex-col gap-4">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        ann.category === 'Holiday' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : ann.category === 'PTM'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                      }`}>
                        <Megaphone className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-900 leading-tight">{ann.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider leading-none">
                            {ann.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/50 border border-slate-200/60 rounded-lg text-slate-600 text-[10px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ann.dateInfo}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-1.5 text-slate-450 text-[10px] font-bold mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted {formatTimeAgo(ann.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center text-slate-400 text-xs font-bold flex flex-col gap-2.5 items-center">
                <Megaphone className="w-9 h-9 text-slate-300" />
                <span>No announcements published yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
