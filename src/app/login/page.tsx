'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft, KeyRound, UserSquare } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import { useToast } from '@/context/ToastContext';

type Role = 'admin' | 'teacher' | 'student';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter both identifier and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('identifier', identifier);
      formData.append('password', password);
      formData.append('role', role);

      const result = await loginAction(null, formData);

      if (result.error) {
        showToast(result.error, 'error');
        setIsLoading(false);
      } else if (result.success && result.role) {
        showToast(`Welcome back, ${role}!`, 'success');
        router.push(`/${result.role}`);
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0b1528] text-white">
      {/* Background Image with Dark Blue Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'url("/bg-login.jpg")' }}
      />
      <div className="absolute inset-0 bg-[#0b1528]/85 pointer-events-none z-0" />

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <div className="max-w-md w-full mx-auto relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>
      </div>

      {/* Main card */}
      <div className="max-w-md w-full mx-auto relative z-10 flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-sky-500 rounded-2xl shadow-xl shadow-sky-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white leading-none">AttendancePro</h2>
            <p className="text-xs text-sky-400 font-semibold tracking-widest uppercase mt-1">Portal Login</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="w-full bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-1 mb-6">
          {(['admin', 'teacher', 'student'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl capitalize transition-all relative ${
                role === r 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === r && (
                <motion.div 
                  layoutId="activeRoleTab"
                  className="absolute inset-0 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/25"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="w-full glass-card-dark p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6">
            Log in as <span className="text-sky-400 capitalize">{role}</span>
          </h3>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {role === 'admin' && 'Username or Email'}
                {role === 'teacher' && 'Employee ID or Email'}
                {role === 'student' && 'Roll Number or Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  {role === 'admin' ? <UserSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    role === 'admin' ? 'e.g. admin' :
                    role === 'teacher' ? 'e.g. EMP001' : 'e.g. ROLL101'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Demo Access Credentials</span>
            <div className="bg-slate-950/30 border border-white/5 p-4 rounded-xl flex items-start gap-3">
              <KeyRound className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400">
                {role === 'admin' && (
                  <p>Username: <code className="text-white bg-white/5 px-1 py-0.5 rounded">admin</code><br />Password: <code className="text-white bg-white/5 px-1 py-0.5 rounded">password123</code></p>
                )}
                {role === 'teacher' && (
                  <p>Employee ID: <code className="text-white bg-white/5 px-1 py-0.5 rounded">EMP001</code><br />Password: <code className="text-white bg-white/5 px-1 py-0.5 rounded">password123</code></p>
                )}
                {role === 'student' && (
                  <p>Roll Number: <code className="text-white bg-white/5 px-1 py-0.5 rounded">ROLL101</code><br />Password: <code className="text-white bg-white/5 px-1 py-0.5 rounded">password123</code></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center relative z-10 mt-8">
        <p className="text-xs text-slate-600">
          AttendancePro &copy; {new Date().getFullYear()}. Secure JWT portal.
        </p>
      </div>
    </div>
  );
}
