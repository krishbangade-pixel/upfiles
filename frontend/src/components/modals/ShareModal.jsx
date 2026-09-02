import React, { useState } from 'react';
import { Share2, X, Copy, Check, Lock, Globe, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ShareModal = ({ isOpen, item, onClose, onShareSuccess }) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [members, setMembers] = useState(item?.members || []);
  const [copied, setCopied] = useState(false);
  const [expiration, setExpiration] = useState('Never');

  if (!isOpen || !item) return null;

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    const newMember = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role,
    };

    setMembers([...members, newMember]);
    setEmail('');
    addToast(`Access granted to ${email}`, 'success');
  };

  const handleRemoveMember = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId));
    addToast('Member access removed', 'info');
  };

  const handleCopyLink = () => {
    const publicUrl = `https://cloudvault.app/s/${item.id || 'demo-share-link'}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    addToast('Public share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Share "{item.name}"</h3>
              <p className="text-xs text-[#6B7280]">Manage user permissions and public link access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add People Form */}
        <form onSubmit={handleAddPerson} className="mb-5">
          <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
            Add People
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C5CFF] transition-all"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#7C5CFF] hover:bg-[#6D4FF5] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-md shadow-[#7C5CFF]/20"
            >
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>

        {/* Members Access List */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
            People with access ({members.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic py-1">Only you currently have access</p>
            ) : (
              members.map((m) => (
                <div key={m.id || m.email} className="flex items-center justify-between p-2.5 rounded-xl bg-[#11141B] border border-[#252936]">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#252936]" />
                    <div>
                      <p className="text-xs font-semibold text-[#F5F7FA]">{m.name}</p>
                      <p className="text-[11px] text-[#6B7280]">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#191C25] text-[#7C5CFF] border border-[#7C5CFF]/30">
                      {m.role || 'Viewer'}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded-lg transition-colors"
                      title="Remove access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Public Link Generator */}
        <div className="p-3.5 rounded-xl bg-[#11141B] border border-[#252936] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4F8EF7]" />
              <span className="text-xs font-semibold text-[#F5F7FA]">Public Share Link</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B7280]">Expires:</span>
              <select
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="bg-[#151821] border border-[#252936] text-[11px] text-[#F5F7FA] px-2 py-1 rounded-lg focus:outline-none"
              >
                <option value="Never">Never</option>
                <option value="7 Days">7 Days</option>
                <option value="30 Days">30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`https://cloudvault.app/s/${item.id}`}
              className="flex-1 px-3 py-2 rounded-lg bg-[#151821] border border-[#252936] text-xs text-[#9CA3AF] focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#191C25] hover:bg-[#252936] text-xs font-semibold text-[#7C5CFF] rounded-lg border border-[#7C5CFF]/30 transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-[#252936]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors border border-[#252936]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onShareSuccess) onShareSuccess(item, members);
              addToast('Share permissions saved successfully', 'success');
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6D4FF5] rounded-xl shadow-lg shadow-[#7C5CFF]/25 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
