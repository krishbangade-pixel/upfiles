import React, { useState, useEffect } from 'react';
import { useDrive } from '../context/DriveContext';
import { supabase } from '../lib/supabase';
import { User, HardDrive, Bell, Sun, Loader2, Check } from 'lucide-react';

export const Settings = () => {
  const { authUser, storageInfo, addToast } = useDrive();

  const userName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User';
  const userEmail = authUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (authUser?.user_metadata?.full_name) {
      setName(authUser.user_metadata.full_name);
    }
  }, [authUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Restrict name to alphabets only
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      addToast('Full name can only contain letters and spaces', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (error) throw error;
      addToast('Profile updated successfully!');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="border-b border-[#34373d] pb-3">
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Manage your CloudDrive account preferences</p>
      </div>

      <div className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="bg-[#222428] border border-[#34373d] rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#34373d] pb-3">
            <User className="w-4 h-4 text-[#316d7a]" />
            <span>Profile Information</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#316d7a] text-white font-bold text-lg flex items-center justify-center shadow-md">
                {userInitial}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{userName}</p>
                <p className="text-gray-400 text-xs">{userEmail}</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-200 mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                placeholder="Enter your name"
                pattern="[A-Za-z\s]+"
                title="Only letters and spaces are allowed"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:bg-[#18191b] focus:outline-none focus:border-[#316d7a] focus:ring-1 focus:ring-[#316d7a] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#316d7a] hover:bg-[#275863] text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </form>
        </div>

        {/* Storage Breakdown Card */}
        <div className="bg-[#222428] border border-[#34373d] rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#34373d] pb-3">
            <HardDrive className="w-4 h-4 text-[#316d7a]" />
            <span>Storage Usage</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-medium text-white">
              <span>{storageInfo.usedGB} GB used</span>
              <span className="text-gray-400">15.0 GB total</span>
            </div>

            <div className="w-full bg-[#1d1e21] h-3 rounded-full overflow-hidden flex border border-[#34373d]">
              <div className="bg-[#316d7a] h-[100%]" style={{ width: `${Math.min(100, Math.max(5, storageInfo.percentage))}%` }} title="Storage Used" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#316d7a]" />
                <span>Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span>Images</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Appearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#222428] border border-[#34373d] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#34373d] pb-2">
              <Bell className="w-4 h-4 text-[#316d7a]" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-white">Email Notifications</p>
                <p className="text-gray-400 text-[11px]">Receive updates about shared files</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  addToast(`Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-4 h-4 rounded border-[#34373d] bg-[#1d1e21] text-[#316d7a] focus:ring-[#316d7a] cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-[#222428] border border-[#34373d] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#34373d] pb-2">
              <Sun className="w-4 h-4 text-[#316d7a]" />
              <span>Appearance</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-white">Theme Preference</p>
                <p className="text-gray-400 text-[11px]">Sleek Dark Theme</p>
              </div>
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  addToast(`Theme set to ${e.target.value}`);
                }}
                className="px-3 py-1.5 border border-[#34373d] rounded-xl text-xs bg-[#1d1e21] text-white focus:outline-none focus:border-[#316d7a]"
              >
                <option value="dark" className="bg-[#1d1e21]">Dark Theme</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
