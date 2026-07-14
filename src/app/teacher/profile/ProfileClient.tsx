'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Lock, Loader2, Save, KeyRound } from 'lucide-react';
import { updateTeacherProfileAction } from '@/lib/actions/teacher';
import { useToast } from '@/context/ToastContext';
import { Teacher } from '@/lib/db/jsonDb';

interface ProfileClientProps {
  teacher: Teacher;
}

export default function ProfileClient({ teacher }: ProfileClientProps) {
  const [name, setName] = useState(teacher.name);
  const [email, setEmail] = useState(teacher.email);
  const [phone, setPhone] = useState(teacher.phone);
  const [photoUrl, setPhotoUrl] = useState(teacher.photoUrl);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      showToast('Please fill in all profile fields.', 'error');
      return;
    }

    setIsLoading(true);
    const result = await updateTeacherProfileAction({
      name,
      email,
      phone,
      photoUrl
    });
    setIsLoading(false);

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Profile updated successfully.', 'success');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('Please enter both password fields.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsLoading(true);
    const result = await updateTeacherProfileAction({
      name,
      email,
      phone,
      photoUrl,
      password
    });
    setIsLoading(false);

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Password changed successfully.', 'success');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left side card: Profile Overview */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-md relative group">
            {photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <span className="text-xs text-sky-600 font-bold bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 mt-1.5 inline-block uppercase tracking-wider">
              {teacher.employeeId}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-5 flex flex-col gap-3 text-left text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Role</span>
                <span className="font-semibold text-slate-800">Class Teacher</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                <span className="font-semibold text-slate-800 truncate block max-w-[180px]">{email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                <span className="font-semibold text-slate-800">{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side cards: Edit details & Password change */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* Profile details form */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Profile Details</h3>
            <p className="text-xs text-slate-500 mt-1">Modify your contact details and avatar photo URL</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change password form */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500 mt-1">Keep your portal access secure by changing your password</p>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
