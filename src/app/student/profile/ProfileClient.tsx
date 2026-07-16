'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Mail, Phone, Lock, Loader2, Save, KeyRound, MapPin, 
  Calendar, Award, Eye, EyeOff, GraduationCap, ArrowRight,
  ShieldCheck, Sparkles, Edit3, Heart, Users, Clock, Landmark
} from 'lucide-react';
import { updateStudentProfileAction } from '@/lib/actions/student';
import { useToast } from '@/context/ToastContext';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  photoUrl: string;
}

interface ProfileClientProps {
  student: Student;
}

export default function ProfileClient({ student }: ProfileClientProps) {
  const { showToast } = useToast();
  
  // Database editable fields
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [photoUrl, setPhotoUrl] = useState(student.photoUrl);

  // Local storage metadata fields
  const [parentName, setParentName] = useState('Ramesh Verma');
  const [parentPhone, setParentPhone] = useState('+91-98765-1111');
  const [dob, setDob] = useState('2012-08-15');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('456, Blue Street, Lucknow, Uttar Pradesh - 226001');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // UI status states
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load metadata from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`student_profile_${student.id}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.parentName) setParentName(data.parentName);
          if (data.parentPhone) setParentPhone(data.parentPhone);
          if (data.dob) setDob(data.dob);
          if (data.gender) setGender(data.gender);
          if (data.bloodGroup) setBloodGroup(data.bloodGroup);
          if (data.address) setAddress(data.address);
        } catch (e) {
          console.error("Failed to parse cached student profile details", e);
        }
      }
    }
  }, [student.id]);

  // Compute password strength
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 60, label: 'Fair', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  }, [newPassword]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save standard fields in Supabase db
      const dbResult = await updateStudentProfileAction({
        name,
        email,
        phone,
        photoUrl
      });

      if (dbResult.error) {
        showToast(dbResult.error, 'error');
        setIsLoading(false);
        return;
      }

      // 2. Save metadata fields in localStorage
      const metadata = { parentName, parentPhone, dob, gender, bloodGroup, address };
      localStorage.setItem(`student_profile_${student.id}`, JSON.stringify(metadata));

      showToast('Profile details updated successfully.', 'success');
      setIsEditing(false);
    } catch {
      showToast('Network error updating profile.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateStudentProfileAction({
        name,
        email,
        phone,
        photoUrl,
        password: newPassword
      });

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      showToast('Network error updating password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setPhotoUrl(student.photoUrl);
    // Reload local storage details
    const cached = localStorage.getItem(`student_profile_${student.id}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.parentName) setParentName(data.parentName);
      if (data.parentPhone) setParentPhone(data.parentPhone);
      if (data.dob) setDob(data.dob);
      if (data.gender) setGender(data.gender);
      if (data.bloodGroup) setBloodGroup(data.bloodGroup);
      if (data.address) setAddress(data.address);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto text-slate-800 animate-fadeIn">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Profile Overview
          <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
        </h2>
        <p className="text-xs text-slate-450 mt-1">Student Portal &gt; My Profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Student Summary Info Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
            
            {/* Blue Gradient Header */}
            <div className="bg-gradient-to-r from-blue-550 via-sky-400 to-sky-300 h-28 relative">
              <span className="absolute top-4 right-4 bg-emerald-505 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-white flex items-center gap-1 uppercase tracking-wider bg-emerald-500">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Online
              </span>
            </div>

            {/* Profile Avatar overlapping */}
            <div className="flex flex-col items-center -mt-14 pb-6 px-6 border-b border-slate-50 relative">
              <div className="relative group">
                <img 
                  src={photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                  alt={name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 p-1.5 bg-white border border-slate-150 rounded-full shadow-md text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                  title="Edit Avatar URL"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mt-3">{name}</h3>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5 mt-1.5 uppercase tracking-widest">
                Roll No. {student.rollNumber}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                Class {student.class} - {student.section}
              </span>
            </div>

            {/* Profile Detail Fields */}
            <div className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-500">
              {/* Role */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">Student</span>
                </div>
              </div>

              {/* Admission Code */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Admission Number</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{student.id}</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block truncate max-w-[200px]">{email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="font-extrabold text-slate-800 mt-0.5 block">{phone}</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                  <span className="font-extrabold text-slate-850 mt-0.5 block leading-relaxed">{address}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Edit details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Profile Details</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Modify contact details and profile parameters</p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-1.5 border rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditing 
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Photo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Photo URL</label>
                  <input
                    type="url"
                    disabled={!isEditing}
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Parent Name and Parent Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: DOB, Gender, Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all text-slate-700"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Gender</label>
                  <select
                    disabled={!isEditing}
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Blood Group</label>
                  <select
                    disabled={!isEditing}
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Address Details</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Form Action Controls */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4 mt-2 animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Three Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Change Password Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Change Password</h3>
            <p className="text-[10px] text-slate-450 mt-1">Keep your account secure by changing your password</p>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-2">
            
            {/* Current Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Current Password *</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">New Password *</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="flex flex-col gap-1 mt-1.5 animate-fadeIn">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>Password Strength</span>
                    <span className={passwordStrength.label === 'Strong' ? 'text-emerald-600' : 'text-amber-600'}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              <span>Update Password</span>
            </button>

          </form>
        </div>

        {/* Column 2: Academic Details Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Academic Details</h3>
            <p className="text-[10px] text-slate-450 mt-1">Your registered course details</p>
          </div>

          <div className="flex flex-col gap-3.5 mt-2 text-xs font-semibold text-slate-500">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Class & Section</span>
              <span className="font-extrabold text-slate-800">Class {student.class} - {student.section}</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Academic Session</span>
              <span className="font-extrabold text-slate-800">2026-2027</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Academic Rank</span>
              <span className="font-extrabold text-slate-850">Top 5%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Employment Status</span>
              <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px] tracking-wide uppercase">
                Active Student
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: Profile Activity Timeline */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col gap-5 justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
            <p className="text-[10px] text-slate-450 mt-1">Profile log details</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {[
              { id: 1, title: 'Profile updated successfully', time: 'Just now', type: 'profile' },
              { id: 2, title: 'Password changed securely', time: '5 days ago', type: 'lock' },
              { id: 3, title: 'Logged in from Chrome (Windows)', time: 'Today, 09:15 AM', type: 'clock' }
            ].map(act => {
              let colorClasses = 'border-blue-400 bg-blue-50 text-blue-500';
              if (act.type === 'lock') colorClasses = 'border-emerald-400 bg-emerald-50 text-emerald-500';

              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center ${colorClasses}`}>
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-700 leading-tight block">{act.title}</span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => showToast('Full student activity log verified.', 'info')}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-500 mt-2 flex items-center justify-center gap-1 cursor-pointer w-full border-t border-slate-55 pt-3"
          >
            View All Activity <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
