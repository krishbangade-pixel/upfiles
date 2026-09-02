import React, { useState } from 'react';
import { User, HardDrive, Shield, Bell, Palette, Check, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form state
  const [name, setName] = useState('Alex Vance');
  const [email, setEmail] = useState('alex.vance@cloudvault.io');

  // Security Toggles state
  const [twoFactor, setTwoFactor] = useState(true);

  // Notification Toggles state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [shareNotifs, setShareNotifs] = useState(true);
  const [uploadNotifs, setUploadNotifs] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Settings updated successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Account Settings</h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          Manage your profile, storage subscription, security, and preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#252936] pb-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 font-bold'
                  : 'text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#151821]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#151821] border border-[#252936] rounded-2xl p-6 shadow-lg">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-[#F5F7FA]">Personal Information</h3>

            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="Alex Vance"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#7C5CFF]"
              />
              <div>
                <button
                  type="button"
                  onClick={() => addToast('Avatar upload simulated', 'info')}
                  className="px-3.5 py-2 rounded-xl bg-[#191C25] border border-[#252936] text-xs font-semibold text-[#F5F7FA] hover:border-[#7C5CFF]/40 transition-colors"
                >
                  Change Avatar
                </button>
                <p className="text-[11px] text-[#6B7280] mt-1">JPG, PNG or GIF, max 5 MB</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7C5CFF] hover:bg-[#6D4FF5] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#7C5CFF]/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-[#F5F7FA]">Storage & Subscription</h3>

            <div className="p-5 rounded-2xl bg-[#11141B] border border-[#252936] space-y-4">
              <div className="flex justify-between text-xs font-bold text-[#F5F7FA]">
                <span>Cloud Vault Enterprise</span>
                <span className="text-[#7C5CFF]">130 GB / 150 GB</span>
              </div>

              <div className="w-full h-2.5 bg-[#191C25] rounded-full overflow-hidden">
                <div className="h-full bg-[#7C5CFF] w-[85%]" />
              </div>

              <p className="text-xs text-[#6B7280]">
                Your plan renews automatically on <strong className="text-[#F5F7FA]">October 1, 2026</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#7C5CFF]/20 to-[#4F8EF7]/20 border border-[#7C5CFF]/40 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#F5F7FA]">Upgrade to 1 TB Ultra Plan</h4>
                <p className="text-xs text-[#9CA3AF]">Unlimited file sharing and priority 24/7 cloud sync</p>
              </div>
              <button
                onClick={() => addToast('Upgrade request received!', 'success')}
                className="px-4 py-2 bg-[#7C5CFF] hover:bg-[#6D4FF5] text-white text-xs font-bold rounded-xl shadow-md shrink-0"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-[#F5F7FA]">Security Settings</h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#11141B] border border-[#252936]">
              <div>
                <h4 className="text-xs font-bold text-[#F5F7FA]">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-[#6B7280]">Secure your account with authenticator codes</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactor(!twoFactor);
                  addToast(twoFactor ? '2FA disabled' : '2FA enabled', 'info');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  twoFactor ? 'bg-[#7C5CFF]' : 'bg-[#252936]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    twoFactor ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Active Sessions</h4>
              <div className="p-3.5 rounded-xl bg-[#11141B] border border-[#252936] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5F7FA]">Chrome on Windows 11 (Current)</p>
                  <p className="text-[11px] text-[#6B7280]">Mumbai, India • Active now</p>
                </div>
                <span className="text-[11px] font-semibold text-[#22C55E]">Online</span>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-base font-bold text-[#F5F7FA]">Notification Preferences</h3>

            {[
              { title: 'Email Digest', desc: 'Receive weekly activity summaries', state: emailNotifs, setState: setEmailNotifs },
              { title: 'Shared File Alerts', desc: 'Notify when team members share files with you', state: shareNotifs, setState: setShareNotifs },
              { title: 'Upload Confirmations', desc: 'Pop up toast when file uploads complete', state: uploadNotifs, setState: setUploadNotifs },
            ].map((n, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#11141B] border border-[#252936]">
                <div>
                  <h4 className="text-xs font-bold text-[#F5F7FA]">{n.title}</h4>
                  <p className="text-[11px] text-[#6B7280]">{n.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    n.setState(!n.state);
                    addToast('Notification setting updated', 'info');
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    n.state ? 'bg-[#7C5CFF]' : 'bg-[#252936]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      n.state ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-[#F5F7FA]">Theme & Colors</h3>

            <div className="p-4 rounded-xl bg-[#11141B] border border-[#252936] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#F5F7FA]">Theme Mode</h4>
                <p className="text-[11px] text-[#6B7280]">Dark SaaS Theme (Default)</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF] text-xs font-bold border border-[#7C5CFF]/30">
                Dark Mode Active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
