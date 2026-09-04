import React from 'react';
import { Search, HelpCircle, Settings, LogOut, Menu } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
  const { searchQuery, setSearchQuery, authUser, setSidebarOpen, addToast, signOut } = useDrive();
  const navigate = useNavigate();

  const userName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User';
  const userEmail = authUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleHelpClick = () => {
    addToast('UpFiles Help Center & Support', 'info');
  };

  const handleLogoutClick = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-[#18191b] border-b border-[#34373d] px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={() => setSidebarOpen(true)}
          className="sm:hidden p-1.5 text-gray-300 hover:text-white hover:bg-[#222428] rounded-lg transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in Drive..."
            className="w-full bg-[#222428] hover:bg-[#1d1e21] focus:bg-[#1d1e21] text-xs text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-[#34373d] focus:border-[#316d7a] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleHelpClick}
          className="p-2 text-gray-200 hover:text-white hover:bg-[#222428] rounded-full transition-colors"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 text-gray-200 hover:text-white hover:bg-[#222428] rounded-full transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogoutClick}
          className="p-2 text-gray-200 hover:text-white hover:bg-[#222428] rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <div className="ml-1 pl-2 border-l border-[#34373d] flex items-center gap-2">
          <div
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full bg-[#316d7a] text-white font-bold text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border border-[#34373d]"
            title={`${userName} (${userEmail})`}
          >
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};
