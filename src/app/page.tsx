'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Globe,
  ChevronDown,
  Phone,
  User,
  GraduationCap,
  Home,
  LayoutGrid,
  Layers,
  Settings,
  Tag,
  Mail,
  Rocket
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('hero');
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = React.useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    const sections = ['hero', 'features', 'workflow', 'about'];
    const observers = sections.map((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        },
        {
          rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the main viewport area
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.el);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative text-white selection:bg-sky-500/30 overflow-hidden">
      {/* Dynamic Background Image Layer with Clean Tint Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none bg-fixed"
        style={{ backgroundImage: 'url("/bg-waves.jpg")' }}
      />
      {/* Light overlay to maintain text legibility while keeping the background clear and clean */}
      <div className="absolute inset-0 bg-[#071526]/35 z-0 pointer-events-none" />

      {/* Global Premium Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Floating Blur Orbs / Radial Lights */}
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#18A8FF]/8 blur-[150px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#7B61FF]/6 blur-[130px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#5B8CFF]/5 blur-[160px]" />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full text-slate-800">
        <div className="w-full bg-white/90 border-b border-slate-200/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all duration-300 relative">
          
          {/* Logo Brand Segment */}
          <div className="flex items-center gap-3">
            {/* Hexagon shape with SVG and People Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#0066fe] fill-current drop-shadow-[0_0_8px_rgba(0,102,254,0.35)]">
                <path d="M50 2.5 L93.3 27.5 L93.3 77.5 L50 97.5 L6.7 77.5 L6.7 27.5 Z" />
              </svg>
              <Users className="w-4.5 h-4.5 text-white relative z-10" />
            </div>
            
            {/* Brand Name */}
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">AMS</span>
            
            {/* Vertical Divider */}
            <div className="w-[1px] h-5 bg-slate-200 hidden lg:block" />
            
            {/* Sub-label */}
            <span className="text-slate-550 text-xs font-semibold tracking-wide hidden lg:block uppercase">
              Attendance Management System
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {/* Home */}
            <a 
              href="#hero" 
              className={`flex items-center gap-2 text-sm font-semibold transition-all relative py-2 px-1 ${
                activeSection === 'hero' ? 'text-[#0066fe] font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
              {activeSection === 'hero' && (
                <motion.div 
                  layoutId="activeNavLine" 
                  className="absolute bottom-[-15px] left-0 right-0 h-[2px] bg-[#0066fe] rounded-full" 
                />
              )}
            </a>

            {/* Features */}
            <a 
              href="#features" 
              className={`flex items-center gap-2 text-sm font-semibold transition-all relative py-2 px-1 ${
                activeSection === 'features' ? 'text-[#0066fe] font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Features</span>
              {activeSection === 'features' && (
                <motion.div 
                  layoutId="activeNavLine" 
                  className="absolute bottom-[-15px] left-0 right-0 h-[2px] bg-[#0066fe] rounded-full" 
                />
              )}
            </a>

            {/* Solutions Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setSolutionsDropdownOpen(true)}
              onMouseLeave={() => setSolutionsDropdownOpen(false)}
            >
              <button 
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all py-2"
                onClick={() => setSolutionsDropdownOpen(!solutionsDropdownOpen)}
              >
                <Layers className="w-4 h-4" />
                <span>Solutions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${solutionsDropdownOpen ? 'rotate-180 text-slate-900' : 'text-slate-600'}`} />
              </button>
              
              <AnimatePresence>
                {solutionsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-white/95 border border-slate-200/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 flex flex-col gap-1"
                  >
                    <Link
                      href="/admin"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/20 border border-transparent transition-all group/item text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover/item:bg-blue-500/20 shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 leading-tight">Admin Portal</h5>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Manage teachers, students & dashboard stats.</p>
                      </div>
                    </Link>
                    <Link
                      href="/teacher"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent transition-all group/item text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover/item:bg-emerald-500/20 shrink-0">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 leading-tight">Teacher Portal</h5>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Mark daily attendance and track sections.</p>
                      </div>
                    </Link>
                    <Link
                      href="/student"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-orange-500/10 hover:border-orange-500/20 border border-transparent transition-all group/item text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover/item:bg-orange-500/20 shrink-0">
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 leading-tight">Student Portal</h5>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">View your attendance logs & monthly histories.</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How It Works */}
            <a 
              href="#workflow" 
              className={`flex items-center gap-2 text-sm font-semibold transition-all relative py-2 px-1 ${
                activeSection === 'workflow' ? 'text-[#0066fe] font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>How It Works</span>
              {activeSection === 'workflow' && (
                <motion.div 
                  layoutId="activeNavLine" 
                  className="absolute bottom-[-15px] left-0 right-0 h-[2px] bg-[#0066fe] rounded-full" 
                />
              )}
            </a>

            {/* Pricing */}
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast('Pricing details are tailored for your school. Contact support to get a quote!', 'info');
              }}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all py-2 px-1"
            >
              <Tag className="w-4 h-4" />
              <span>Pricing</span>
            </a>

            {/* Contact */}
            <a 
              href="#workflow" 
              onClick={(e) => {
                e.preventDefault();
                showToast('Thank you for choosing AMS. Support contact: support@ams-pro.edu', 'success');
              }}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all py-2 px-1"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Login Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Login</span>
            </Link>
            
            {/* Get Started Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold bg-[#0066fe] hover:bg-blue-600 px-5 py-2.5 rounded-xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/20"
            >
              <Rocket className="w-4 h-4 text-white" />
              <span>Get Started</span>
            </Link>

            {/* Mobile Hamburger menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="xl:hidden absolute top-full left-0 right-0 mt-2 mx-0 p-6 bg-white border border-slate-200/80 backdrop-blur-2xl rounded-b-3xl shadow-[0_30px_80px_rgba(0,0,0,0.1)] z-40 overflow-hidden flex flex-col gap-6"
            >
              {/* Main Links */}
              <div className="flex flex-col gap-4">
                <a
                  href="#hero"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2.5 border-b border-slate-100"
                >
                  <Home className="w-4.5 h-4.5 text-blue-500" />
                  <span>Home</span>
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2.5 border-b border-slate-100"
                >
                  <LayoutGrid className="w-4.5 h-4.5 text-blue-500" />
                  <span>Features</span>
                </a>
                
                {/* Solutions collapsable list for mobile */}
                <div className="flex flex-col border-b border-slate-100 py-2.5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 py-1">
                    <Layers className="w-4.5 h-4.5 text-blue-500" />
                    <span>Solutions</span>
                  </div>
                  <div className="pl-8 flex flex-col gap-3 mt-3">
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Admin Portal</span>
                    </Link>
                    <Link
                      href="/teacher"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Teacher Portal</span>
                    </Link>
                    <Link
                      href="/student"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>Student Portal</span>
                    </Link>
                  </div>
                </div>

                <a
                  href="#workflow"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2.5 border-b border-slate-100"
                >
                  <Settings className="w-4.5 h-4.5 text-blue-500" />
                  <span>How It Works</span>
                </a>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    const el = document.getElementById('about');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    showToast('Pricing details are tailored for your school. Contact support to get a quote!', 'info');
                  }}
                  className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2.5 border-b border-slate-100"
                >
                  <Tag className="w-4.5 h-4.5 text-blue-500" />
                  <span>Pricing</span>
                </a>
                <a
                  href="#workflow"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    showToast('Thank you for choosing AMS. Support contact: support@ams-pro.edu', 'success');
                  }}
                  className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2.5"
                >
                  <Mail className="w-4.5 h-4.5 text-blue-500" />
                  <span>Contact</span>
                </a>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-350 transition-all active:scale-[0.98]"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-[#0066fe] hover:bg-blue-600 px-4 py-3 rounded-xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/20"
                >
                  <Rocket className="w-4 h-4 text-white" />
                  <span>Get Started</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative w-full min-h-[550px] sm:min-h-[640px] md:min-h-[750px] lg:min-h-[820px] xl:min-h-[880px] bg-transparent text-white overflow-hidden pt-32 pb-16 flex items-center justify-center">
        {/* Full-size YouTube Video Background (Contained in Hero Box Only - Hidden on mobile/tablet for performance) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 hidden md:block">
          <iframe
            className="absolute"
            src="https://www.youtube.com/embed/NG-d6To9tl8?autoplay=1&mute=1&loop=1&playlist=NG-d6To9tl8&controls=0&showinfo=0&rel=0&playsinline=1&enablejsapi=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw',
              minWidth: '177.77vh',
              minHeight: '100vh',
              transform: 'translate3d(-50%, -50%, 0)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              filter: 'brightness(1.10) contrast(1.15) saturate(1.15)',
            }}
          />
          {/* Premium Gradient Overlay (Dimmed at top for Navbar, translucent at bottom) */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(5, 15, 35, 0.45) 0%, rgba(5, 15, 35, 0.20) 100%)',
            }}
          />
        </div>

        {/* Background Gradients & Decorations */}
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-sky-600/5 to-transparent pointer-events-none z-0" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] xl:grid-cols-[60%_40%] gap-6 sm:gap-8 items-center justify-center w-full py-4">
            {/* Left Content */}
            <motion.div
              className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left justify-center w-full max-w-[700px] mx-auto lg:mx-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full w-fit mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs text-sky-400 font-semibold tracking-wide uppercase">New Version 2.0</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight text-white premium-heading-shadow max-w-[700px] mx-auto lg:mx-0">
                Simple, Fast & Reliable <br />
                <span className="text-gradient-sky bg-clip-text">Attendance Management</span> <br />
                for Schools
              </h1>
              <p className="hidden md:block text-sm sm:text-base lg:text-lg text-slate-200 max-w-[600px] mx-auto lg:mx-0">
                AttendancePro helps schools manage attendance efficiently with dedicated Admin, Teacher, and Student panels. Light, focused, and secure.
              </p>
              <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 w-full xs:w-auto mt-2">
                <Link
                  href="/login"
                  className="w-full xs:w-auto text-center justify-center bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
                >
                  Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full xs:w-auto text-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  Login <ArrowRight className="w-5 h-5 opacity-60" />
                </Link>
              </div>

              {/* Trust/Social Proof */}
              <div className="hidden md:flex flex-row items-center gap-4 border-t border-white/10 pt-4 mt-2">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
                  ].map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={i}
                      src={src}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-white">Trusted by Schools</span> across the country
                </div>
              </div>
            </motion.div>

            {/* Right Graphic/Image */}
            <motion.div
              className="relative w-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-white/10 w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[465px] xl:max-w-[500px] mx-auto shrink-0 bg-white/5 p-1.5 backdrop-blur-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/founder.jpg"
                  alt="Founder DHIRENDRA TECH INNOVATIVE OF INCUBATION"
                  className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[440px] xl:h-[480px] object-cover scale-100 transition-transform duration-700 rounded-[18px]"
                />
                
                {/* Founder Info Overlay Badge matching 3rd mockup exactly (now inside the image box with sky blue background) */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#0ea5e9]/95 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2.5 sm:p-3.5 rounded-[18px] flex items-center justify-between gap-1.5 sm:gap-4 z-20 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                    {/* Square profile avatar box with AI Bulb image */}
                    <div className="w-9 h-9 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl border border-white/30 overflow-hidden shrink-0 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="https://media.istockphoto.com/id/2164746643/photo/artificial-intelligence-idea-ai-light-bulb-idea-concept.jpg?s=1024x1024&w=is&k=20&c=OeQ_698xSL0y7OzrJcqG5YUJGbXuqhYbVOjN6rZZqRM="
                        alt="AI Light Bulb Idea"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Vertical line divider */}
                    <div className="w-[1px] sm:w-[1.5px] h-6 sm:h-11 bg-white/20 shrink-0" />

                    {/* Middle Text Info */}
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base font-black tracking-wide text-white uppercase leading-tight max-w-[120px] xs:max-w-[180px] sm:max-w-none block truncate sm:whitespace-normal">
                        DHIRENDRA <span className="hidden xs:inline">[ INNOVATIVE OF INCUBATION ]</span>
                      </span>
                      <div className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-white mt-1 sm:mt-2 rounded-full" />
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-1.5 leading-none">
                        <span className="text-[7px] sm:text-xs text-white/90 font-semibold tracking-wide">
                          Bachelor&apos;s of Computer Applications
                        </span>
                        <span className="text-[7px] sm:text-xs text-sky-100 font-extrabold tracking-wide">
                          ( Software Engineer )
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Web Founder Pill Button */}
                  <div className="inline-flex items-center gap-1 px-1.5 py-1 sm:px-3 sm:py-2 bg-white/10 border border-white/20 text-white rounded-full shrink-0 shadow-sm">
                    <Globe className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[6px] sm:text-[9.5px] font-black uppercase tracking-widest leading-none">
                      WEB FOUNDER
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-[140px] pb-[140px] bg-transparent text-white relative overflow-hidden z-10 border-t border-white/5">
        {/* Transition Fade from Hero */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0b1528] to-transparent pointer-events-none z-0" />
        
        {/* Premium Animated Mesh / Gradients */}
        <motion.div
          className="absolute top-12 left-10 w-96 h-96 bg-[#18A8FF]/6 rounded-full blur-[120px] pointer-events-none z-0"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#7B61FF]/4 rounded-full blur-[140px] pointer-events-none z-0"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-[800px] mx-auto mb-16 flex flex-col gap-4">
            <span className="text-xs text-sky-400 font-extrabold uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-[800px] mx-auto">
              {"Everything You Need, Nothing You Don't"}
            </h2>
            <p className="text-base sm:text-lg text-slate-355 max-w-[700px] mx-auto leading-relaxed mt-2">
              A light, focused product built exclusively for school attendance. No confusing extra modules.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {/* Admin Panel Card */}
            <motion.div 
              variants={itemVariants} 
              className="p-6 rounded-[32px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-blue-500/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(0,102,254,0.12)] hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Image Container */}
              <div className="w-full h-56 sm:h-64 relative rounded-[24px] overflow-hidden mb-6 shadow-sm shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1713946598467-fcf9332c56ea?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Admin managing attendance dashboard"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Header Title Row */}
              <div className="flex items-center gap-4.5 mb-5">
                {/* Glass Icon container */}
                <div className="w-16 h-16 rounded-[20px] bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-[0_0_20px_rgba(0,102,254,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500/20">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                
                {/* Title Container */}
                <div className="flex flex-col text-left">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">Admin Panel</h3>
                  <div className="w-8 h-[3px] bg-blue-500 mt-2 rounded-full" />
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-350 text-sm leading-relaxed text-left flex-1">
                Add, edit, search, and manage Teachers and Students. Check overall summaries, active statistics, and oversee attendance.
              </p>

              {/* Divider Line */}
              <div className="w-full h-[1px] bg-white/10 my-5" />

              {/* Bullet Features list */}
              <ul className="text-sm text-slate-355 font-semibold flex flex-col gap-3.5 text-left">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Teacher & Student CRUD</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Assign Student to Teacher</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Real-time Dashboard Statistics</span>
                </li>
              </ul>
            </motion.div>

            {/* Teacher Panel Card */}
            <motion.div 
              variants={itemVariants} 
              className="p-6 rounded-[32px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-emerald-500/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Image Container */}
              <div className="w-full h-56 sm:h-64 relative rounded-[24px] overflow-hidden mb-6 shadow-sm shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1601655781320-205e34c94eb1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Teacher holding notebook"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Header Title Row */}
              <div className="flex items-center gap-4.5 mb-5">
                {/* Glass Icon container */}
                <div className="w-16 h-16 rounded-[20px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-500/20">
                  <Users className="w-8 h-8 text-emerald-400" />
                </div>
                
                {/* Title Container */}
                <div className="flex flex-col text-left">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">Teacher Panel</h3>
                  <div className="w-8 h-[3px] bg-[#10b981] mt-2 rounded-full" />
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-350 text-sm leading-relaxed text-left flex-1">
                {"Log in to mark daily attendance in clicks. Instantly edit today's records and manage profile credentials safely."}
              </p>

              {/* Divider Line */}
              <div className="w-full h-[1px] bg-white/10 my-5" />

              {/* Bullet Features list */}
              <ul className="text-sm text-slate-355 font-semibold flex flex-col gap-3.5 text-left">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Quick Attendance Marker</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Manage Assigned Student Class</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Profile Password Management</span>
                </li>
              </ul>
            </motion.div>

            {/* Student Panel Card */}
            <motion.div 
              variants={itemVariants} 
              className="p-6 rounded-[32px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-orange-500/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(234,88,12,0.12)] hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:col-span-2 lg:col-span-1 group"
            >
              {/* Image Container */}
              <div className="w-full h-56 sm:h-64 relative rounded-[24px] overflow-hidden mb-6 shadow-sm shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Students studying together"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Header Title Row */}
              <div className="flex items-center gap-4.5 mb-5">
                {/* Glass Icon container */}
                <div className="w-16 h-16 rounded-[20px] bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 shadow-[0_0_20px_rgba(234,88,12,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:bg-orange-500/20">
                  <GraduationCap className="w-8 h-8 text-orange-400" />
                </div>
                
                {/* Title Container */}
                <div className="flex flex-col text-left">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">Student Panel</h3>
                  <div className="w-8 h-[3px] bg-[#ea580c] mt-2 rounded-full" />
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-350 text-sm leading-relaxed text-left flex-1">
                Immediately view updated monthly summaries, attendance percentages, and complete attendance history records.
              </p>

              {/* Divider Line */}
              <div className="w-full h-[1px] bg-white/10 my-5" />

              {/* Bullet Features list */}
              <ul className="text-sm text-slate-355 font-semibold flex flex-col gap-3.5 text-left">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Live Attendance Percentage</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Month-by-month History logs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>Transparent Attendance Data</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Workflow / How It Works */}
      <section id="workflow" className="py-[120px] bg-transparent relative overflow-hidden z-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left">
              <span className="text-xs text-sky-400 font-extrabold uppercase tracking-widest mx-auto lg:mx-0">Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                How It Works
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
                Our optimized flow ensures seamless coordination between school administration, teachers, and students.
              </p>
              <div className="flex flex-col gap-6 mt-2 text-left">
                {[
                  { step: '1', title: 'Admin Adds Teachers & Students', desc: 'Create teacher and student profiles with classes and sections.' },
                  { step: '2', title: 'Teacher Marks Attendance', desc: 'Teacher selects class and marks present/absent states on the list.' },
                  { step: '3', title: 'Attendance is Saved', desc: 'Data is instantly written to the local database, triggering stats updates.' },
                  { step: '4', title: 'Student Views Attendance', desc: 'Students log in to check their live percentage and monthly history.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(24,168,255,0.15)] group-hover:bg-sky-500/20 transition-all duration-300">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{item.title}</h4>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="relative rounded-[24px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)] border border-white/[0.08] bg-white/[0.02] p-2 backdrop-blur-[10px] w-full max-w-[640px] mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://plus.unsplash.com/premium_photo-1663075847012-c781e0d194ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Tech Presentation and Classroom Incubator"
                  className="w-full h-80 sm:h-[420px] object-cover rounded-[18px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-[120px] bg-transparent relative overflow-hidden z-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Graphics */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-4">
              <div className="col-span-7 relative rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/[0.08] p-1.5 backdrop-blur-[5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600"
                  alt="Kids reading"
                  className="w-full h-64 sm:h-80 object-cover rounded-[14px]"
                />
              </div>
              <div className="col-span-5 flex flex-col gap-4 justify-between h-full pt-4">
                <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-6 rounded-2xl shadow-lg flex flex-col justify-center h-fit">
                  <span className="text-4xl font-extrabold text-white">99.9%</span>
                  <span className="text-xs text-sky-355 font-medium uppercase tracking-wider mt-2">System Uptime</span>
                </div>
                <div className="relative rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/[0.08] p-1.5 backdrop-blur-[5px] mt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600"
                    alt="School Campus Building"
                    className="w-full h-32 sm:h-40 object-cover rounded-[14px]"
                  />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left mt-8 lg:mt-0">
              <span className="text-xs text-sky-400 font-extrabold uppercase tracking-widest mx-auto lg:mx-0">About Us</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Built for Schools, <br />Designed for Simplicity
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                AttendancePro is designed to simplify attendance management for schools with a clean, lightweight, and powerful interface. No bloated modules, no heavy setup. Just simple, fast, and reliable attendance records.
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-6 mt-4 border-t border-white/10 pt-6 text-left">
                <div>
                  <span className="text-3xl font-extrabold text-white">500+</span>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider mt-1">Partner Schools</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white">25,000+</span>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider mt-1">Students Managed</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white">1M+</span>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider mt-1">Attendance Records</span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white">100%</span>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider mt-1">Data Privacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="w-full bg-transparent pt-4 pb-1 relative z-10">
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          
          {/* Main Footer Card Container matching target design (2nd image) with optimized padding & height */}
          <div className="bg-[#0a1322]/80 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] py-4 px-6 sm:px-8 lg:px-10 mb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 pb-2">
              
              {/* Left Column: Brand description & Social proof (with vertical separator on right) */}
              <div className="lg:col-span-3 flex flex-col justify-between lg:border-r lg:border-white/10 lg:pr-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500 rounded-xl shadow-md shadow-sky-500/20">
                      <ShieldCheck className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold tracking-tight text-white block leading-none">AttendancePro</span>
                      <span className="text-[8px] text-sky-400 font-extrabold tracking-wider uppercase mt-0.5">Simple • Fast • Reliable</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    AttendancePro helps schools manage attendance efficiently with dedicated Admin, Teacher, and Student panels. Light, focused, and secure.
                  </p>
                </div>
                
                {/* Social icons pushed to bottom baseline */}
                <div className="flex items-center gap-2 mt-3">
                  <a 
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-sky-500 border border-white/5 hover:border-sky-400 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  </a>
                  <a 
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-sky-500 border border-white/5 hover:border-sky-400 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a 
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-sky-500 border border-white/5 hover:border-sky-400 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a 
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-sky-500 border border-white/5 hover:border-sky-400 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.022 0 12 0 12s0 3.978.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.86.508 9.388.508 9.388.508s7.528 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Middle Columns (4 Link Lists): PRODUCT, COMPANY, RESOURCES, LEGAL */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5">
                
                {/* Column 1: PRODUCT */}
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">PRODUCT</span>
                    <div className="w-5 h-[1.5px] bg-sky-500 mt-1.5 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-3 text-xs font-normal text-slate-400">
                    <a href="#features" className="hover:text-sky-400 transition-colors">Features</a>
                    <a href="#workflow" className="hover:text-sky-400 transition-colors">How It Works</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Pricing</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Updates</a>
                  </div>
                </div>

                {/* Column 2: COMPANY */}
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">COMPANY</span>
                    <div className="w-5 h-[1.5px] bg-sky-500 mt-1.5 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-3 text-xs font-normal text-slate-400">
                    <a href="#about" className="hover:text-sky-400 transition-colors">About Us</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Our Mission</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Careers</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Blog</a>
                  </div>
                </div>

                {/* Column 3: RESOURCES */}
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">RESOURCES</span>
                    <div className="w-5 h-[1.5px] bg-sky-500 mt-1.5 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-3 text-xs font-normal text-slate-400">
                    <a href="#" className="hover:text-sky-400 transition-colors">Help Center</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Documentation</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Guides</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">API Status</a>
                  </div>
                </div>

                {/* Column 4: LEGAL */}
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">LEGAL</span>
                    <div className="w-5 h-[1.5px] bg-sky-500 mt-1.5 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-3 text-xs font-normal text-slate-400">
                    <a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Terms & Conditions</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Data Security</a>
                    <a href="#" className="hover:text-sky-400 transition-colors">Cookie Policy</a>
                  </div>
                </div>

              </div>

              {/* Right Column: GET IN TOUCH (with vertical line separator on left) */}
              <div className="lg:col-span-3 flex flex-col gap-3 lg:border-l lg:border-white/10 lg:pl-8">
                <div>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">GET IN TOUCH</span>
                  <div className="w-6 h-[1.5px] bg-sky-500 mt-1 rounded-full" />
                </div>
                <p className="text-slate-400 text-xs font-semibold leading-normal">
                  Have any questions? Call our administration team.
                </p>

                {/* Contact Cards Container - Sleek divided panel inside */}
                <div className="flex flex-col border border-white/10 rounded-xl divide-y divide-white/10 bg-slate-950/20 overflow-hidden shadow-inner">
                  {[
                    { role: 'PRINCIPAL', number: '+91 98765 43210', iconColor: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
                    { role: 'MANAGER', number: '+91 87654 32109', iconColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                    { role: 'HOD', number: '+91 76543 21098', iconColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400' }
                  ].map((contact, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 text-white hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-7 h-7 rounded-full ${contact.iconColor} border flex items-center justify-center shrink-0 shadow-inner`}>
                          <User className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block leading-tight">{contact.role}</span>
                          <span className="text-xs font-bold text-white tracking-wide">{contact.number}</span>
                        </div>
                      </div>
                      <a 
                        href={`tel:${contact.number}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/10 hover:border-sky-500 hover:bg-sky-500 text-slate-350 hover:text-white font-bold text-[8px] uppercase tracking-wider rounded-lg transition-all active:scale-95"
                      >
                        <Phone className="w-2.5 h-2.5" /> Call Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Divider Line inside the card wrapper */}
            <div className="border-t border-white/10 pt-3 mt-1">
              {/* Bottom Copyright Row inside the card container */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-semibold text-slate-455">
                <p className="order-2 md:order-1 font-medium text-slate-500">
                  &copy; {new Date().getFullYear()} AttendancePro. All rights reserved.
                </p>
                <div className="order-1 md:order-2 flex items-center gap-2 text-slate-400">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide">Secure</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] font-bold tracking-wide">Reliable</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] font-bold tracking-wide">Trusted by Schools</span>
                </div>
                <button
                  onClick={() => showToast('Language selection is not configured.', 'info')}
                  className="order-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-950/40 border border-white/5 hover:border-white/10 hover:text-white transition-all text-[11px] font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-slate-400" />
                  English
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
