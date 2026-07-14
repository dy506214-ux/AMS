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
  X
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

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
          { name: 'My Profile', href: '/teacher/profile', icon: UserCheck }
        ];
      case 'student':
        return [
          { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
          { name: 'Attendance History', href: '/student/history', icon: History },
          { name: 'My Profile', href: '/student/profile', icon: UserCheck }
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
      <aside className={`fixed top-0 bottom-0 left-0 z-45 w-64 border-r border-slate-200/80 bg-slate-900 text-slate-300 flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col gap-8">
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 px-3 mt-4 md:mt-0">
            <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">AttendancePro</span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-widest uppercase mt-1 block">
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
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold relative transition-all group ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-sky-500 rounded-xl shadow-md shadow-sky-500/10"
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

        {/* Footer with user info & logout */}
        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6 px-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged In As</span>
            <span className="text-sm font-bold text-white truncate mt-1">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
