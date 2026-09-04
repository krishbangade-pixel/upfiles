import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import WebThreads from '../components/common/WebThreads';
import { Cloud, ArrowRight, LayoutGrid, LogIn } from 'lucide-react';

export const Landing = () => {
  const { authUser, session } = useDrive();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden selection:bg-[#0084ff] selection:text-white font-sans flex flex-col justify-between">
      {/* 
        WebThreads Animated WebGL 3D Background Layer
        Flowing thin wave lines behind the hero section matching the design asset
      */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-50">
        <WebThreads
          color1="#ffffff"
          color2="#0084ff"
          color3="#222222"
          speed={0.15}
          threadCount={6}
          frequency={3.5}
          spread={0.35}
          taper={0.8}
          position={0.5}
          fanMode="center"
          glow={0.015}
          falloff={0.7}
          thickness={0.7}
          brightness={0.7}
          opacity={0.6}
          mirror={true}
          shimmer={true}
          grain={true}
          grainIntensity={0.03}
          mouseInteraction={true}
          mouseStrength={0.25}
          backgroundColor="#000000"
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* Brand Logo: Blue Cloud + Up (White) Files (Blue) */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <Cloud className="w-8 h-8 text-[#0084ff] fill-[#0084ff] stroke-none transition-transform group-hover:scale-105" />
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            Up<span className="text-[#0084ff]">Files</span>
          </span>
        </Link>

        {/* Top Right Action Buttons: Sign In / Dashboard */}
        <div className="flex items-center gap-3">
          {!authUser && !session ? (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          ) : null}

          <button
            onClick={() => navigate('/drive')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700/80 hover:border-gray-500 bg-black/40 hover:bg-white/5 text-xs font-medium text-white rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <LayoutGrid className="w-4 h-4 text-gray-300" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Center Hero Section */}
      <main className="relative z-10 px-6 max-w-3xl mx-auto text-center space-y-6 my-auto py-12">
        {/* Large Central Blue Cloud Icon */}
        <div className="flex justify-center">
          <Cloud className="w-24 h-24 sm:w-28 sm:h-28 text-[#0084ff] fill-[#0084ff] stroke-none drop-shadow-[0_10px_35px_rgba(0,132,255,0.3)] animate-pulse" />
        </div>

        {/* Title: Up (White) Files (Blue) */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white font-sans">
          Up<span className="text-[#0084ff]">Files</span>
        </h1>

        {/* Tagline */}
        <h2 className="text-xl sm:text-2xl font-medium text-gray-200 tracking-wide">
          Your Files. Anywhere.
        </h2>

        {/* Description Subtitle */}
        <p className="text-sm sm:text-base text-gray-400 font-normal max-w-xl mx-auto leading-relaxed">
          Store, organize, share, and access your files securely from any device, anytime.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(authUser ? '/drive' : '/register')}
            className="w-full sm:w-auto px-7 py-3 bg-[#0084ff] hover:bg-[#0073df] text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-[#0084ff]/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-3 bg-black/60 hover:bg-white/10 border border-gray-700/80 hover:border-gray-500 text-white font-semibold text-sm rounded-xl backdrop-blur-md transition-all cursor-pointer active:scale-95"
          >
            Sign In
          </button>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-gray-600">
        <p>© {new Date().getFullYear()} UpFiles. All rights reserved.</p>
      </footer>
    </div>
  );
};
