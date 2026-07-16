'use client';

import React from 'react';
import { Calendar, User, Search, Bell } from 'lucide-react';

interface NavbarProps {
  title: string;
  userName: string;
  photoUrl?: string;
}

export default function Navbar({ title, userName, photoUrl }: NavbarProps) {
  // Use July 16, 2026 for display if the current system date matches the mockup's target date context, otherwise show real current date.
  // The system date in metadata is July 16, 2026.
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between gap-4">
      {/* Title & Welcome Message */}
      <div className="pl-12 md:pl-0 flex flex-col min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <span className="text-xs text-slate-500 font-medium truncate mt-0.5">
          {title.toLowerCase() === 'dashboard' 
            ? `Welcome back, ${userName}! 👋` 
            : `Teacher Portal - ${title}`}
        </span>
      </div>

      {/* Middle Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        <input 
          type="text" 
          placeholder="Search students, classes..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-100/60 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-slate-200 rounded-full text-sm text-slate-700 placeholder-slate-400 outline-none transition-all"
        />
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification bell with active red badge */}
        <button className="relative p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border border-white">
            3
          </span>
        </button>

        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold border border-slate-200/40">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{today}</span>
        </div>

        {/* Profile Circle Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
          {photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
    </header>
  );
}
