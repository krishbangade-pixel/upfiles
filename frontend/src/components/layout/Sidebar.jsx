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
        className={`fixed sm:static inset-y-0 left-0 z-40 w-[210px] min-w-[210px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="space-y-5">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg tracking-tight select-none">
              <Cloud className="w-6 h-6 text-zinc-900 fill-zinc-900 stroke-[1.5]" />
              <span>CloudDrive</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* + New Button with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New</span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 text-xs font-medium text-gray-700 animate-fade-in">
                <button
                  onClick={() => handleDropdownAction('newFolder')}
                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-gray-500" />
                  New Folder
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => handleDropdownAction('upload')}
                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  Upload Files
                </button>
                <button
                  onClick={() => handleDropdownAction('upload')}
                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderUp className="w-4 h-4 text-gray-500" />
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
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{storageInfo.formattedText}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-900 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${storageInfo.percentage}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
