'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  UserSquare, 
  ClipboardCheck, 
  UserCheck, 
  History, 
  LogOut,
  Menu,
  X,
  BookOpen,
  Megaphone,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  FileText
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
  userName: string;
  photoUrl?: string;
}

export default function Sidebar({ role, userName, photoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { name: 'Teachers', href: '/admin/teachers', icon: Users },
          { name: 'Students', href: '/admin/students', icon: UserSquare }
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
          { name: 'Mark Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
          { name: 'Marks Entry', href: '/teacher/marks', icon: FileText },
          { name: 'Classes', href: '/teacher/classes', icon: BookOpen },
          { name: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
          { name: 'Calendar', href: '/teacher/calendar', icon: Calendar },
          { name: 'My Profile', href: '/teacher/profile', icon: User }
        ];
      case 'student':
        return [
          { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
          { name: 'Attendance History', href: '/student/history', icon: History },
          { name: 'Examinations', href: '/student/examinations', icon: FileText },
          { name: 'Announcements', href: '/student/announcements', icon: Megaphone },
          { name: 'My Profile', href: '/student/profile', icon: User }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logoutAction();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900 text-white shadow-lg md:hidden hover:bg-slate-800 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-45 w-64 border-r border-slate-800 bg-slate-900 text-slate-300 flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col gap-8">
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 px-3 mt-4 md:mt-0">
            <img 
              src="/ams-logo-icon.png" 
              alt="AMS Logo" 
              className="w-10 h-10 object-contain shrink-0" 
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">AMS</span>
              <span className="text-[10px] text-sky-400 font-bold tracking-wider uppercase mt-1 block">
                {role} portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold relative transition-all group ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with interactive user profile card */}
        <div className="border-t border-slate-800 pt-5 px-1 mt-auto relative">
          {/* Floating Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-1 right-1 mb-2 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 backdrop-blur-md">
              <Link
                href={role === 'teacher' ? '/teacher/profile' : role === 'student' ? '/student/profile' : '/admin'}
                onClick={() => { setShowUserMenu(false); setIsOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={() => { setShowUserMenu(false); handleLogout(); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all text-left w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/30 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Circle Avatar with green online dot */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              
              {/* User names & info */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate leading-tight">{userName}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold truncate leading-none">
                    {role === 'teacher' ? 'Class Teacher' : role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider leading-none">Online</span>
                </div>
              </div>
            </div>

            {/* Dropdown Chevron */}
            <div className="text-slate-400 group-hover:text-white transition-colors">
              {showUserMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
