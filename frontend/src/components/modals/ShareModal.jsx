import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';
import { shareService } from '../../services/shareService';
import {
  UserPlus,
  Lock,
  Globe,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Key,
} from 'lucide-react';

export const ShareModal = () => {
  const { modalState, closeModal, authUser, addToast, refreshDriveData } = useDrive();

  // Selected resource item metadata
  const isOpen = modalState?.type === 'share';
  const item = modalState?.item;
  const isFolder = modalState?.meta?.isFolder ?? false;
  const resourceType = isFolder ? 'folder' : 'file';

  // Search & input states
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputRole, setInputRole] = useState('Viewer');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Shares & Link Share states
  const [sharesList, setSharesList] = useState([]);
  const [linkShare, setLinkShare] = useState(null);
  const [generalAccess, setGeneralAccess] = useState('restricted'); // 'restricted' | 'anyone'
  const [expirationDays, setExpirationDays] = useState(0);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');

  // UI state machine
  const [loading, setLoading] = useState(true);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState(null);

  // Load existing shares and link share status on modal open
  useEffect(() => {
    if (!isOpen || !item) return;

    let isMounted = true;
    setLoading(true);

    const loadShareData = async () => {
      try {
        const [existingShares, activeLinkShare] = await Promise.all([
          shareService.getShares(resourceType, item.id),
          shareService.getLinkShare(resourceType, item.id),
        ]);

        if (isMounted) {
          setSharesList(existingShares);
          setLinkShare(activeLinkShare);
          setGeneralAccess(activeLinkShare ? 'anyone' : 'restricted');
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load sharing info:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadShareData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, item, resourceType]);

  // Autocomplete search typing handler
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedUser(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await shareService.searchUsers(val, authUser?.id);
        setSuggestions(results);
        setIsSearching(false);
      }, 250);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (user) => {
    setSelectedUser(user);
    setQuery(user.email);
    setSuggestions([]);
  };

  // Add / Share submit
  const handleAddShare = async (e) => {
    e.preventDefault();
    const targetEmail = selectedUser ? selectedUser.email : query.trim();

    if (!targetEmail) return;

    // Self share check
    if (authUser && authUser.email?.toLowerCase() === targetEmail.toLowerCase()) {
      addToast('You cannot share a file or folder with yourself', 'error');
      return;
    }

    setSharingInProgress(true);
    try {
      await shareService.shareResource(
        resourceType,
        item.id,
        targetEmail,
        inputRole,
        authUser?.id
      );

      const recipientName = selectedUser?.name || targetEmail;
      addToast(`${isFolder ? 'Folder' : 'File'} shared with ${recipientName}`);

      // Reset input fields and refresh list
      setQuery('');
      setSelectedUser(null);
      setSuggestions([]);

      const updatedShares = await shareService.getShares(resourceType, item.id);
      setSharesList(updatedShares);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to share item', 'error');
    } finally {
      setSharingInProgress(false);
    }
  };

  // Update existing share permission
  const handleRoleChange = async (shareItem, newRole) => {
    try {
      await shareService.updateShare(shareItem.id, newRole);
      addToast('Permission updated');

      const updatedShares = await shareService.getShares(resourceType, item.id);
      setSharesList(updatedShares);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to update permission', 'error');
    }
  };

  // Execute share removal
  const handleConfirmRemove = async () => {
    if (!removeConfirmTarget) return;
    try {
      await shareService.removeShare(removeConfirmTarget.id);
      addToast('Access removed');

      setRemoveConfirmTarget(null);
      const updatedShares = await shareService.getShares(resourceType, item.id);
      setSharesList(updatedShares);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to remove access', 'error');
    }
  };

  // General Access Dropdown toggle
  const handleGeneralAccessChange = async (newAccessMode) => {
    setGeneralAccess(newAccessMode);

    if (newAccessMode === 'anyone') {
      try {
        const created = await shareService.createOrUpdateLinkShare(resourceType, item.id, {
          expiresInDays: expirationDays,
          password: linkPassword,
        });
        setLinkShare(created);
        addToast(`Anyone with the link can now access this ${resourceType}`);
      } catch (err) {
        addToast('Failed to enable link sharing', 'error');
        setGeneralAccess('restricted');
      }
    } else {
      // Disable link sharing
      if (linkShare) {
        try {
          await shareService.deleteLinkShare(linkShare.id);
          setLinkShare(null);
          addToast('Link sharing disabled');
        } catch (err) {
          addToast('Failed to disable link sharing', 'error');
        }
      }
    }
  };

  // Expiration update handler
  const handleExpirationChange = async (days) => {
    setExpirationDays(days);
    if (generalAccess === 'anyone') {
      try {
        const updated = await shareService.createOrUpdateLinkShare(resourceType, item.id, {
          expiresInDays: days,
          password: linkPassword,
        });
        setLinkShare(updated);
        addToast('Link expiration updated');
      } catch (err) {
        addToast('Failed to update link expiration', 'error');
      }
    }
  };

  // Copy Public / Private Link
  const handleCopyLink = () => {
    let url = `${window.location.origin}/drive?item=${item.id}`;
    if (generalAccess === 'anyone' && linkShare?.token) {
      url = shareService.getShareUrl(linkShare.token);
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast('Link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !item) return null;

  // Owner detail derivation
  const ownerName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'You';
  const ownerEmail = authUser?.email || 'owner@clouddrive.com';
  const ownerInitials = ownerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`Share "${item.name}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Section 1: Add People Input with Autocomplete */}
        <div className="space-y-2 relative">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Add people, groups, and calendar events
          </label>
          <form onSubmit={handleAddShare} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Enter name or email address"
                className="w-full px-3.5 py-2 text-xs border border-[#34373d] rounded-xl focus:outline-none focus:border-[#316d7a] bg-[#1d1e21] text-white placeholder-gray-400"
              />

              {/* Autocomplete Suggestions Overlay */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#1d1e21] border border-[#34373d] rounded-xl shadow-xl z-50 divide-y divide-[#34373d] max-h-48 overflow-y-auto">
                  {suggestions.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectSuggestion(u)}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#18191b] cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#316d7a] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                        {u.initials}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-white truncate">{u.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute right-3 top-2.5 text-[11px] text-gray-400">
                  Searching...
                </div>
              )}
            </div>

            <select
              value={inputRole}
              onChange={(e) => setInputRole(e.target.value)}
              className="px-3 py-2 text-xs border border-[#34373d] rounded-xl bg-[#1d1e21] font-medium text-gray-200 focus:outline-none focus:border-[#316d7a] cursor-pointer"
            >
              <option value="Viewer" className="bg-[#1d1e21]">Viewer</option>
              <option value="Editor" className="bg-[#1d1e21]">Editor</option>
            </select>

            <button
              type="submit"
              disabled={!query.trim() || sharingInProgress}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {sharingInProgress ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Section 2: People With Access List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            People with access
          </p>

          {loading ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading access list...</div>
          ) : (
            <div className="border border-[#34373d] rounded-xl divide-y divide-[#34373d] max-h-52 overflow-y-auto bg-[#1d1e21]">
              {/* Owner Row */}
              <div className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#316d7a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {ownerInitials}
                  </div>
                  <div className="truncate max-w-[220px]">
                    <p className="font-medium text-white truncate">{ownerName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{ownerEmail}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-300 px-2.5 py-1 rounded-lg bg-[#18191b] border border-[#34373d]">
                  Owner
                </span>
              </div>

              {/* Shared Users Rows */}
              {sharesList.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 text-xs hover:bg-[#18191b]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#316d7a]/20 text-[#316d7a] border border-[#316d7a]/40 flex items-center justify-center font-bold text-xs shrink-0">
                      {s.initials}
                    </div>
                    <div className="truncate max-w-[200px]">
                      <p className="font-medium text-white truncate">{s.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{s.granteeEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={s.role}
                      onChange={(e) => handleRoleChange(s, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-[#34373d] rounded-lg bg-[#18191b] font-medium text-gray-200 focus:outline-none focus:border-[#316d7a] cursor-pointer"
                    >
                      <option value="Viewer" className="bg-[#1d1e21]">Viewer</option>
                      <option value="Editor" className="bg-[#1d1e21]">Editor</option>
                    </select>

                    <button
                      onClick={() => setRemoveConfirmTarget(s)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {sharesList.length === 0 && (
                <div className="p-3 text-center text-xs text-gray-400">
                  No one else has access.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: General Access */}
        <div className="space-y-3 pt-2 border-t border-[#34373d]">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            General access
          </p>

          <div className="flex items-start gap-3 p-3 bg-[#1d1e21] border border-[#34373d] rounded-xl">
            <div className="p-2 bg-[#18191b] rounded-lg border border-[#34373d] text-gray-300 shrink-0 mt-0.5">
              {generalAccess === 'anyone' ? (
                <Globe className="w-4 h-4 text-[#316d7a]" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <select
                  value={generalAccess}
                  onChange={(e) => handleGeneralAccessChange(e.target.value)}
                  className="bg-transparent font-semibold text-xs text-white focus:outline-none cursor-pointer border-b border-[#34373d] pb-0.5"
                >
                  <option value="restricted" className="bg-[#1d1e21]">🔒 Restricted</option>
                  <option value="anyone" className="bg-[#1d1e21]">🌐 Anyone with the link</option>
                </select>

                {generalAccess === 'anyone' && (
                  <span className="text-[11px] font-semibold text-gray-300 bg-[#18191b] border border-[#34373d] px-2 py-0.5 rounded-md">
                    Viewer
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400">
                {generalAccess === 'anyone'
                  ? 'Anyone on the Internet with this link can view.'
                  : 'Only people with access can open this file.'}
              </p>

              {/* Link Expiration & Password options when 'Anyone with the link' is selected */}
              {generalAccess === 'anyone' && (
                <div className="pt-2 border-t border-[#34373d] flex flex-wrap items-center gap-3 text-[11px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Link Expiration:</span>
                    <select
                      value={expirationDays}
                      onChange={(e) => handleExpirationChange(Number(e.target.value))}
                      className="bg-[#18191b] border border-[#34373d] rounded px-2 py-0.5 text-[11px] font-medium text-gray-200"
                    >
                      <option value={0} className="bg-[#1d1e21]">Never</option>
                      <option value={1} className="bg-[#1d1e21]">1 day</option>
                      <option value={7} className="bg-[#1d1e21]">7 days</option>
                      <option value={30} className="bg-[#1d1e21]">30 days</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="flex items-center gap-1 text-gray-300 hover:text-white font-medium"
                  >
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    Password protection
                  </button>

                  {showPasswordInput && (
                    <div className="w-full mt-1">
                      <input
                        type="password"
                        value={linkPassword}
                        onChange={(e) => setLinkPassword(e.target.value)}
                        placeholder="Enter link protection password"
                        className="w-full px-2.5 py-1 text-xs border border-[#34373d] rounded bg-[#18191b] text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Modal Footer Action Bar */}
        <div className="pt-3 border-t border-[#34373d] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1d1e21] hover:bg-[#18191b] rounded-xl transition-colors border border-[#34373d]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            {copied ? 'Link Copied!' : 'Copy link'}
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Access Removal */}
      {removeConfirmTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#222428] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-[#34373d] animate-scale-in">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Remove access?</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              "{removeConfirmTarget.name}" will no longer be able to access this{' '}
              {resourceType}.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRemoveConfirmTarget(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#18191b] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
