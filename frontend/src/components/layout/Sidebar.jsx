import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Cloud,
  Plus,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  FolderPlus,
  Upload,
  FolderUp,
  X,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const Sidebar = () => {
  const { storageInfo, openModal, sidebarOpen, setSidebarOpen } = useDrive();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'My Drive', path: '/drive', icon: HardDrive },
    { name: 'Shared with me', path: '/shared', icon: Users },
    { name: 'Recent', path: '/recent', icon: Clock },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ];

  const handleDropdownAction = (modalType) => {
    setDropdownOpen(false);
    openModal(modalType);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-[210px] min-w-[210px] flex-shrink-0 bg-[#18191b] border-r border-[#34373d] flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="space-y-5">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight select-none">
              <Cloud className="w-6 h-6 text-[#316d7a] fill-[#316d7a] stroke-[1.5]" />
              <span>CloudDrive</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-gray-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* + New Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-center gap-2 bg-[#316d7a] hover:bg-[#275863] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New</span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-[#222428] border border-[#34373d] rounded-xl shadow-xl py-1.5 z-50 text-xs font-medium text-gray-100 animate-fade-in">
                <button
                  onClick={() => handleDropdownAction('newFolder')}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#18191b] flex items-center gap-2.5 cursor-pointer text-gray-100"
                >
                  <FolderPlus className="w-4 h-4 text-gray-300" />
                  New Folder
                </button>
                <div className="my-1 border-t border-[#34373d]" />
                <button
                  onClick={() => handleDropdownAction('upload')}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#18191b] flex items-center gap-2.5 cursor-pointer text-gray-100"
                >
                  <Upload className="w-4 h-4 text-gray-300" />
                  Upload Files
                </button>
                <button
                  onClick={() => handleDropdownAction('upload')}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#18191b] flex items-center gap-2.5 cursor-pointer text-gray-100"
                >
                  <FolderUp className="w-4 h-4 text-gray-300" />
                  Upload Folder
                </button>
              </div>
            )}
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#222428] text-white font-semibold border border-[#34373d]'
                        : 'text-gray-200 hover:bg-[#222428] hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Storage Information */}
        <div className="pt-4 border-t border-[#34373d] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-200 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="truncate">{storageInfo.formattedText}</span>
          </div>
          <div className="w-full bg-[#1d1e21] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#316d7a] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${storageInfo.percentage}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
