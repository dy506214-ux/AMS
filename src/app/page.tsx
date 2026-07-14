'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  UserCheck,
  ArrowRight,
  Award,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

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
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav shadow-sm bg-[#071526]/85 backdrop-blur-md border-b border-white/5 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 rounded-xl shadow-md shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">AttendancePro</span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase hidden sm:block mt-1">Simple • Fast • Reliable</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</a>
            <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold bg-sky-500 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-sky-400 shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
            {/* Mobile Hamburger menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none ml-1"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#071526]/95 border-b border-white/10 text-white absolute top-20 left-0 right-0 z-40 overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                <a
                  href="#hero"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                >
                  Features
                </a>
                <a
                  href="#workflow"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
                >
                  How It Works
                </a>
                <a
                  href="#about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                >
                  About
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative w-full h-[480px] sm:h-[560px] md:h-[650px] lg:h-[680px] bg-transparent text-white overflow-hidden pt-20 flex items-center justify-center">
        {/* Full-size YouTube Video Background (Contained in Hero Box Only) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
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

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] xl:grid-cols-[60%_40%] gap-6 sm:gap-8 items-center justify-center w-full h-full py-4">
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
              <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-white/10 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] mx-auto shrink-0 bg-white/5 p-1.5 backdrop-blur-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/founder.jpg"
                  alt="Founder DHIRENDRA YADAV"
                  className="w-full h-32 sm:h-40 md:h-56 lg:h-[280px] xl:h-[320px] object-cover scale-105 hover:scale-100 transition-transform duration-700 rounded-[18px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-[18px] m-1.5" />

                {/* Founder Info Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 glass-card p-2 sm:p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-600 shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Founder</span>
                      <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 leading-tight">DHIRENDRA YADAV</span>
                    </div>
                  </div>
                  <div className="text-right bg-sky-500/10 text-sky-600 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-sky-500/20">
                    Leader
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
            <p className="text-base sm:text-lg text-slate-350 max-w-[700px] mx-auto leading-relaxed mt-2">
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
              className="p-8 rounded-[24px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-sky-400/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(24,168,255,0.12)] hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 group"
            >
              <div className="p-4 bg-sky-500/10 text-sky-400 rounded-[20px] w-fit border border-sky-500/20 shadow-[0_0_20px_rgba(24,168,255,0.25)] transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500/20">
                <ShieldCheck className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Admin Panel</h3>
              <p className="text-slate-350 text-sm leading-relaxed">
                Add, edit, search, and manage Teachers and Students. Check overall summaries, active statistics, and oversee attendance.
              </p>
              <ul className="text-sm text-slate-400 flex flex-col gap-2 mt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Teacher & Student CRUD</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Assign Student to Teacher</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Real-time Dashboard Statistics</li>
              </ul>
            </motion.div>

            {/* Teacher Panel Card */}
            <motion.div 
              variants={itemVariants} 
              className="p-8 rounded-[24px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-sky-400/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(24,168,255,0.12)] hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 group"
            >
              <div className="p-4 bg-sky-500/10 text-sky-400 rounded-[20px] w-fit border border-sky-500/20 shadow-[0_0_20px_rgba(24,168,255,0.25)] transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500/20">
                <Users className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Teacher Panel</h3>
              <p className="text-slate-355 text-sm leading-relaxed">
                {"Log in to mark daily attendance in clicks. Instantly edit today's records and manage profile credentials safely."}
              </p>
              <ul className="text-sm text-slate-400 flex flex-col gap-2 mt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Quick Attendance Marker</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Manage Assigned Student Class</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Profile Password Management</li>
              </ul>
            </motion.div>

            {/* Student Panel Card */}
            <motion.div 
              variants={itemVariants} 
              className="p-8 rounded-[24px] border border-white/[0.08] bg-white/[0.05] backdrop-blur-[25px] hover:border-sky-400/[0.3] hover:bg-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_50px_rgba(24,168,255,0.12)] hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 sm:col-span-2 lg:col-span-1 group"
            >
              <div className="p-4 bg-sky-500/10 text-sky-400 rounded-[20px] w-fit border border-sky-500/20 shadow-[0_0_20px_rgba(24,168,255,0.25)] transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500/20">
                <UserCheck className="w-8 h-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Student Panel</h3>
              <p className="text-slate-355 text-sm leading-relaxed">
                Immediately view updated monthly summaries, attendance percentages, and complete attendance history records.
              </p>
              <ul className="text-sm text-slate-400 flex flex-col gap-2 mt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Live Attendance Percentage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Month-by-month History logs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Transparent Attendance Data</li>
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
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800"
                  alt="Students in class"
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

      {/* Ready to Get Started banner */}
      <section className="bg-[#0b1528]/80 backdrop-blur-md text-white py-20 border-y border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl shrink-0 mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Award className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Ready to Get Started?</h3>
              <p className="text-sm text-slate-350 mt-1">Join hundreds of schools using AttendancePro to manage attendance with ease.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-center">
            <Link
              href="/login"
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex-1 md:flex-initial"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex-1 md:flex-initial"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#071526]/95 text-slate-400 py-12 border-t border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AttendancePro</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#hero" className="hover:text-white transition-colors">Home</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
              <a href="#about" className="hover:text-white transition-colors">About Us</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} AttendancePro. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms & Conditions</a>
              <a href="#" className="hover:text-slate-400">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
