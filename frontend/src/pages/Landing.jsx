import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import WebThreads from '../components/common/WebThreads';
import { Cloud, ArrowRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

export const Landing = () => {
  const { authUser, session } = useDrive();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#18191b] text-white relative overflow-hidden selection:bg-[#316d7a] selection:text-white font-sans">
      {/* 
        WebThreads Animated WebGL 3D Background Layer
        Full-screen interactive weaving threads canvas
      */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-80">
        <WebThreads
          color1="#316d7a"
          color2="#51534d"
          color3="#FFFFFF"
          speed={0.25}
          threadCount={7}
          frequency={4.5}
          spread={0.22}
          taper={1.0}
          position={0.5}
          fanMode="center"
          glow={0.03}
          falloff={0.55}
          thickness={1.2}
          brightness={0.7}
          opacity={0.95}
          mirror={true}
          shimmer={true}
          grain={true}
          grainIntensity={0.04}
          mouseInteraction={true}
          mouseStrength={0.35}
          backgroundColor="#18191b"
        />
      </div>

      {/* Translucent overlay layer */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#18191b]/50 via-transparent to-[#18191b]/60" />

      {/* Floating Header with Logo & Action Buttons */}
      <header className="relative z-10 p-6 lg:p-8 flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Logo - UpFiles */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-[#222428]/90 border border-[#34373d] rounded-2xl shadow-xl backdrop-blur-md group-hover:border-[#316d7a] transition-all">
            <Cloud className="w-6 h-6 text-[#316d7a] fill-[#316d7a] stroke-[1.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
            UpFiles
          </span>
        </Link>

        {/* Top Right Action Buttons: Sign In, Sign Up, Dashboard */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2.5 text-gray-200 hover:text-white bg-[#222428]/80 hover:bg-[#222428] border border-[#34373d] rounded-xl backdrop-blur-md transition-all shadow-md"
          >
            <LogIn className="w-4 h-4 text-[#316d7a]" />
            <span>Sign In</span>
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-1.5 px-4 py-2.5 text-white bg-[#316d7a] hover:bg-[#275863] rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </Link>

          <button
            onClick={() => navigate('/drive')}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-white bg-[#222428] hover:bg-[#1d1e21] border border-[#34373d] hover:border-[#316d7a] rounded-xl backdrop-blur-md transition-all shadow-md cursor-pointer active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#316d7a]" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>
    </div>
  );
};
