'use client';

import React from 'react';
import { Calendar, User } from 'lucide-react';

interface NavbarProps {
  title: string;
  userName: string;
  photoUrl?: string;
}

export default function Navbar({ title, userName, photoUrl }: NavbarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between">
      {/* Title */}
      <div className="pl-12 md:pl-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{today}</span>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden xs:flex flex-col">
            <span className="text-sm font-bold text-slate-800">{userName}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block text-right">Authorized Account</span>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
