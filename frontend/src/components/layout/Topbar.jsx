import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, Menu, ChevronDown, User, Settings, HardDrive, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

export const Topbar = ({ onOpenSidebar, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const handleSignOut = () => {
    setShowUserMenu(false);
    addToast('Signed out of CloudVault demo session', 'info');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#252936] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821] rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Box */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Help Button */}
        <button
          onClick={() => navigate('/help')}
          className="hidden sm:flex p-2.5 text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821] rounded-xl transition-colors border border-transparent hover:border-[#252936]"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821] rounded-xl transition-colors border border-transparent hover:border-[#252936]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7C5CFF] ring-4 ring-[#0B0D12] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#151821] border border-[#252936] shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#252936]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7C5CFF]/20 text-[#7C5CFF]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#7C5CFF] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all as read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      n.read
                        ? 'bg-[#11141B]/50 border-transparent text-[#9CA3AF]'
                        : 'bg-[#191C25] border-[#7C5CFF]/30 text-[#F5F7FA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-[#F5F7FA]">{n.title}</h4>
                      <span className="text-[10px] text-[#6B7280]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-[#151821] border border-transparent hover:border-[#252936] transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Alex Vance"
              className="w-8 h-8 rounded-full object-cover border border-[#7C5CFF]/50"
            />
            <span className="hidden sm:block text-xs font-semibold text-[#F5F7FA]">Alex Vance</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#151821] border border-[#252936] shadow-2xl p-2 z-50 animate-fade-in">
              <div className="p-3 border-b border-[#252936] mb-1">
                <p className="text-xs font-semibold text-[#F5F7FA]">Alex Vance</p>
                <p className="text-[11px] text-[#6B7280]">alex.vance@cloudvault.io</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-[#7C5CFF]" /> Profile Settings
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
                >
                  <HardDrive className="w-4 h-4 text-[#4F8EF7]" /> Storage Details
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#F59E0B]" /> Preferences
                </button>
                <div className="my-1 border-t border-[#252936]" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
