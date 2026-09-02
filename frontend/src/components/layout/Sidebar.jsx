import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HardDrive,
  Users,
  Star,
  Clock,
  Trash2,
  Settings,
  HelpCircle,
  Shield,
  Cloud,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const mainNavItems = [
    { label: 'My Drive', path: '/drive', icon: HardDrive },
    { label: 'Shared', path: '/shared', icon: Users },
    { label: 'Starred', path: '/starred', icon: Star },
    { label: 'Recent', path: '/recent', icon: Clock },
    { label: 'Trash', path: '/trash', icon: Trash2 },
  ];

  const bottomNavItems = [
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#0F1117] border-r border-[#252936] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#4F8EF7] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#F5F7FA] tracking-wide">
                  Cloud<span className="text-[#7C5CFF]">Vault</span>
                </h1>
                <p className="text-[11px] text-[#6B7280] font-medium">Enterprise Cloud</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden text-[#9CA3AF] hover:text-[#F5F7FA] p-1 rounded-lg hover:bg-[#151821]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Storage
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 shadow-md shadow-[#7C5CFF]/10 font-semibold'
                        : 'text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu & Profile Summary */}
        <div className="space-y-4 pt-4 border-t border-[#252936]">
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 font-semibold'
                        : 'text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#151821] border border-[#252936]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Alex Vance"
              className="w-9 h-9 rounded-full object-cover border border-[#7C5CFF]/40"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-[#F5F7FA] truncate">Alex Vance</h4>
              <p className="text-[11px] text-[#6B7280] truncate">alex.vance@cloudvault.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
