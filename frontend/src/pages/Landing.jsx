import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import {
  Cloud,
  ShieldCheck,
  Zap,
  Lock,
  Share2,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  FolderPlus,
  Search,
  ChevronRight,
  User,
  Star
} from 'lucide-react';

export const Landing = () => {
  const { authUser, session } = useDrive();
  const navigate = useNavigate();
  const [splineLoaded, setSplineLoaded] = useState(false);
  const splineRef = useRef(null);

  // Initialize Spline 3D canvas ready event listener
  useEffect(() => {
    // Dynamic import / script fallback for Spline Web Component
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js';
    script.onload = () => {
      setSplineLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleSplineLoad = (splineApp) => {
    splineRef.current = splineApp;
    setSplineLoaded(true);
  };

  return (
    <div className="min-h-screen bg-[#18191b] text-white relative overflow-x-hidden selection:bg-[#316d7a] selection:text-white font-sans">
      {/* 
        3D Spline Interactive Scene Background Container
        The page background is transparent so the 3D scene shows through everywhere.
      */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-75">
        <spline-viewer
          url="https://prod.spline.design/6Wt1Q7Y-iTKree0O/scene.splinecode"
          loading-anim
          events-target="global"
          style={{ width: '100%', height: '100%' }}
        ></spline-viewer>
      </div>

      {/* Decorative ambient gradient glow overlays (layered above 3D scene, translucent) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#18191b]/80 via-[#18191b]/40 to-[#18191b]/95" />

      {/* Content Wrapper - Layered over 3D scene */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#18191b]/60 border-b border-[#34373d]/80 px-6 lg:px-12 py-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-[#222428] border border-[#34373d] rounded-xl shadow-md group-hover:border-[#316d7a] transition-all">
                <Cloud className="w-6 h-6 text-[#316d7a] fill-[#316d7a] stroke-[1.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
                CloudDrive
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
              <a href="#preview" className="hover:text-white transition-colors">Dashboard</a>
              <a href="#storage" className="hover:text-white transition-colors">Storage Plan</a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              {authUser || session ? (
                <button
                  onClick={() => navigate('/drive')}
                  className="flex items-center gap-2 bg-[#316d7a] hover:bg-[#275863] text-white px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[#222428] border border-transparent hover:border-[#34373d] rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 bg-[#316d7a] hover:bg-[#275863] text-white px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto w-full text-center space-y-8 my-auto">
          
          {/* Feature Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#222428]/90 border border-[#34373d] rounded-full text-xs font-medium text-gray-300 backdrop-blur-md shadow-lg animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#316d7a]" />
            <span>Introducing 3D Cloud Storage Architecture</span>
            <span className="bg-[#316d7a]/20 text-[#316d7a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#316d7a]/30">
              v2.0 Live
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
            Next-Gen Cloud Storage with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#316d7a] via-teal-300 to-emerald-400">
              Zero-Knowledge Security
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Store, preview, and share your documents, videos, and images seamlessly.
            Powered by enterprise-grade encryption, instant public links, and real-time synchronization.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(authUser ? '/drive' : '/register')}
              className="w-full sm:w-auto px-8 py-4 bg-[#316d7a] hover:bg-[#275863] text-white font-bold text-sm rounded-2xl shadow-xl hover:shadow-[#316d7a]/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>{authUser ? 'Open Your Drive' : 'Claim 15GB Free Storage'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 bg-[#222428]/90 hover:bg-[#222428] border border-[#34373d] text-gray-200 hover:text-white font-semibold text-sm rounded-2xl backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Key Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
            <div className="bg-[#222428]/80 border border-[#34373d] rounded-2xl p-4 backdrop-blur-md">
              <HardDrive className="w-5 h-5 text-[#316d7a] mb-2" />
              <p className="text-xl font-bold text-white">15 GB</p>
              <p className="text-xs text-gray-400">Free Encrypted Storage</p>
            </div>
            <div className="bg-[#222428]/80 border border-[#34373d] rounded-2xl p-4 backdrop-blur-md">
              <Lock className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-xl font-bold text-white">256-bit</p>
              <p className="text-xs text-gray-400">AES End-to-End Security</p>
            </div>
            <div className="bg-[#222428]/80 border border-[#34373d] rounded-2xl p-4 backdrop-blur-md">
              <Share2 className="w-5 h-5 text-teal-400 mb-2" />
              <p className="text-xl font-bold text-white">Instant</p>
              <p className="text-xs text-gray-400">Custom Public Share Links</p>
            </div>
            <div className="bg-[#222428]/80 border border-[#34373d] rounded-2xl p-4 backdrop-blur-md">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-xl font-bold text-white">100%</p>
              <p className="text-xs text-gray-400">Real-Time Supabase Sync</p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid Section */}
        <section id="features" className="px-6 lg:px-12 py-20 bg-[#18191b]/80 border-t border-[#34373d]/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Built for High-Performance Storage & File Management
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Everything you need to organize, secure, and access your data from anywhere in the world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-[#222428]/90 border border-[#34373d] rounded-3xl p-6 space-y-4 hover:border-[#316d7a]/60 transition-all duration-300 shadow-xl backdrop-blur-md group">
                <div className="w-12 h-12 rounded-2xl bg-[#316d7a]/20 border border-[#316d7a]/40 flex items-center justify-center text-[#316d7a] group-hover:bg-[#316d7a] group-hover:text-white transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Bank-Grade Encryption</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your files are stored securely in dedicated Supabase storage buckets protected by row-level security policy checks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#222428]/90 border border-[#34373d] rounded-3xl p-6 space-y-4 hover:border-[#316d7a]/60 transition-all duration-300 shadow-xl backdrop-blur-md group">
                <div className="w-12 h-12 rounded-2xl bg-[#316d7a]/20 border border-[#316d7a]/40 flex items-center justify-center text-[#316d7a] group-hover:bg-[#316d7a] group-hover:text-white transition-all">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Public Share Link Management</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generate instant public links for files and folders with optional password protection and configurable expiration dates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#222428]/90 border border-[#34373d] rounded-3xl p-6 space-y-4 hover:border-[#316d7a]/60 transition-all duration-300 shadow-xl backdrop-blur-md group">
                <div className="w-12 h-12 rounded-2xl bg-[#316d7a]/20 border border-[#316d7a]/40 flex items-center justify-center text-[#316d7a] group-hover:bg-[#316d7a] group-hover:text-white transition-all">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Smart Folder Organization</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Create nested folder hierarchies, star important assets, search instantly, and recover deleted items from the Trash.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="preview" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto w-full">
          <div className="bg-[#222428]/90 border border-[#34373d] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#34373d] pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Experience the CloudDrive Dashboard</h3>
                <p className="text-xs text-gray-400 mt-1">Clean, minimalist, and responsive user experience across all devices.</p>
              </div>
              <button
                onClick={() => navigate(authUser ? '/drive' : '/register')}
                className="px-5 py-2.5 bg-[#316d7a] hover:bg-[#275863] text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                Launch Dashboard
              </button>
            </div>

            {/* Mock Dashboard UI Preview Frame */}
            <div className="bg-[#18191b] border border-[#34373d] rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-gray-400 font-mono ml-2">clouddrive.app/drive</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                  <FolderPlus className="w-3.5 h-3.5 text-[#316d7a]" />
                </div>
              </div>

              {/* Grid Preview Items */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#222428] border border-[#34373d] rounded-xl flex items-center gap-2.5">
                  <div className="p-2 bg-[#316d7a]/20 rounded-lg text-[#316d7a]">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <p className="font-semibold text-white truncate">Project Specs.pdf</p>
                    <p className="text-[10px] text-gray-400">2.4 MB</p>
                  </div>
                </div>

                <div className="p-3 bg-[#222428] border border-[#34373d] rounded-xl flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <p className="font-semibold text-white truncate">Design Assets</p>
                    <p className="text-[10px] text-gray-400">Folder</p>
                  </div>
                </div>

                <div className="p-3 bg-[#222428] border border-[#34373d] rounded-xl flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <p className="font-semibold text-white truncate">Shared Folder</p>
                    <p className="text-[10px] text-gray-400">Public Link</p>
                  </div>
                </div>

                <div className="p-3 bg-[#222428] border border-[#34373d] rounded-xl flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <p className="font-semibold text-white truncate">User Profile</p>
                    <p className="text-[10px] text-gray-400">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Call to Action Banner */}
        <footer className="bg-[#18191b] border-t border-[#34373d] px-6 lg:px-12 py-12 text-xs text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#222428] border border-[#34373d] rounded-xl">
                <Cloud className="w-5 h-5 text-[#316d7a] fill-[#316d7a]" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">CloudDrive</p>
                <p className="text-[11px] text-gray-400">Encrypted Cloud Storage & Asset Management</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </div>

            <p>© {new Date().getFullYear()} CloudDrive Inc. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};
