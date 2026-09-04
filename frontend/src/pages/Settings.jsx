import React, { useState } from 'react';
import { useDrive } from '../context/DriveContext';
import { User, HardDrive, Bell, Moon, Sun, Shield, Check } from 'lucide-react';

export const Settings = () => {
  const { user, storageInfo, addToast } = useDrive();
  const [name, setName] = useState(user.name);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile settings saved');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-gray-100 pb-3">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your CloudDrive account preferences</p>
      </div>

      <div className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            <User className="w-4 h-4 text-gray-500" />
            <span>Profile Information</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-bold text-base flex items-center justify-center">
                {user.initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Storage Breakdown Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span>Storage Usage</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-medium">
              <span>{storageInfo.usedGB} GB used</span>
              <span className="text-gray-500">15.0 GB total</span>
            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-blue-500 h-[100%]" style={{ width: '45%' }} title="Documents: 45MB" />
              <div className="bg-purple-500 h-[100%]" style={{ width: '30%' }} title="Images: 30MB" />
              <div className="bg-indigo-500 h-[100%]" style={{ width: '15%' }} title="Videos: 15MB" />
              <div className="bg-amber-500 h-[100%]" style={{ width: '10%' }} title="Others: 10MB" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Documents</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Images</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Videos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Appearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-gray-500 text-[11px]">Receive updates about shared files</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  addToast(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              <Sun className="w-4 h-4 text-gray-500" />
              <span>Appearance</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-gray-900">Theme Preference</p>
                <p className="text-gray-500 text-[11px]">Default Light Theme</p>
              </div>
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  addToast(`Theme set to ${e.target.value}`);
                }}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme (System)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
