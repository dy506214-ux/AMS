'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      const result = await loginAction(null, formData);

      if (result.error) {
        showToast(result.error, 'error');
        setIsLoading(false);
      } else if (result.success && result.role) {
        showToast(`Welcome back! Logged in successfully.`, 'success');
        router.push(`/${result.role}`);
        router.refresh();
      }
    } catch (err) {
      const error = err as Error;
      showToast(error.message || 'Authentication failed. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#071526] text-white select-none">
      {/* Dynamic Background Image Layer with Clean Tint Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none bg-fixed"
        style={{ backgroundImage: 'url("/bg-waves.jpg")' }}
      />
      {/* Light overlay to maintain text legibility while keeping the background clear and clean */}
      <div className="absolute inset-0 bg-[#071526]/35 z-0 pointer-events-none" />

      {/* Geometric background shapes to match the 1st image */}
      <div className="absolute bottom-[-120px] left-[-120px] w-[350px] h-[350px] bg-gradient-to-tr from-sky-950/40 to-transparent rotate-45 pointer-events-none z-0 border border-white/5 rounded-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-gradient-to-tl from-sky-900/20 to-transparent rotate-45 pointer-events-none z-0 border border-white/5 rounded-3xl" />

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
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3.5 bg-sky-500 rounded-[22px] shadow-2xl shadow-sky-500/25 border border-sky-400/20 hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">AttendancePro</h2>
            <p className="text-[10px] text-sky-400 font-extrabold tracking-[0.25em] uppercase mt-2">Portal Login</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full bg-[#0a1322]/90 backdrop-blur-xl p-8 rounded-[28px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Welcome back</h3>
            <p className="text-sm text-slate-400 mt-1.5 font-medium">Sign in to continue to your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-2.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-2.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-sm mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  defaultChecked
                  className="w-[18px] h-[18px] rounded border-white/10 bg-slate-950/40 text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 transition-all cursor-pointer accent-sky-500" 
                />
                <span className="text-slate-350 select-none group-hover:text-slate-200 transition-colors font-medium">Remember me</span>
              </label>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  showToast('Password recovery is managed by school administration.', 'info'); 
                }} 
                className="text-sky-400 hover:text-sky-300 hover:underline transition-colors font-semibold"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex py-5 items-center mt-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-xs font-bold tracking-widest text-slate-500">OR</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Social Sign in */}
          <button
            type="button"
            onClick={() => showToast('Google Authentication is not configured for this school portal.', 'info')}
            className="w-full py-4 bg-slate-950/30 hover:bg-slate-950/50 text-slate-200 font-semibold rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer text-sm"
          >
            {/* Google Multi-colored SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          {/* Quick Demo Credentials Info */}
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Demo Access Credentials</span>
            </div>
            <div className="bg-slate-950/30 border border-white/5 p-4 rounded-xl flex flex-col gap-2 text-[11px] text-slate-400 font-medium">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Admin (Principal):</span>
                <div>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded mr-1">principal@attendence.com</code>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded">Dhirendra@2026</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Teacher:</span>
                <div>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded mr-1">teacher1@attendence.com</code>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded">Teacher@2026</code>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Student:</span>
                <div>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded mr-1">student1@attendence.com</code>
                  <code className="text-white bg-white/5 px-1 py-0.5 rounded">Student@2026</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center relative z-10 mt-8">
        <p className="text-xs text-slate-500 font-medium">
          AttendancePro &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
