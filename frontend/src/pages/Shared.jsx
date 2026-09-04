import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../lib/api';
import { LayoutGrid, List, Users, Loader2, Lock, AlertCircle, Key } from 'lucide-react';

export const Shared = () => {
  const { token } = useParams();
  const { files, folders, searchQuery, viewMode, setViewMode, getItemPermission, authUser, openModal, addToast } = useDrive();

  // Link token resolution state
  const [loadingLink, setLoadingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [linkResolvedFiles, setLinkResolvedFiles] = useState([]);
  const [linkResolvedFolders, setLinkResolvedFolders] = useState([]);

  const resolveToken = async (providedPassword = '') => {
    if (!token) return;
    setLoadingLink(true);
    setLinkError('');

    try {
      const headers = {};
      if (providedPassword) {
        headers['X-Link-Password'] = providedPassword;
      }

      const res = await api.get(`/link/${token}`, { headers });
      const data = res.data;
      setIsPasswordRequired(false);

      if (data.resourceType === 'file' && data.file) {
        const fileObj = {
          id: data.file.id,
          name: data.file.name,
          size: data.file.size,
          formattedSize: data.file.formattedSize,
          extension: data.file.name.split('.').pop(),
          type: data.file.mimeType,
          downloadUrl: data.file.downloadUrl,
          previewUrl: data.file.downloadUrl,
          storageKey: data.file.id,
          isSharedWithMe: true,
          owner: 'Shared via Link',
          createdAt: data.file.createdAt,
          updatedAt: data.file.updatedAt,
        };

        setLinkResolvedFiles([fileObj]);
        addToast(`Loaded shared file "${data.file.name}"`);
        openModal('preview', fileObj, { isFolder: false });
      } else if (data.resourceType === 'folder' && data.folder) {
        const folderObj = {
          id: data.folder.id,
          name: data.folder.name,
          isSharedWithMe: true,
          owner: 'Shared via Link',
          createdAt: data.folder.createdAt,
          updatedAt: data.folder.updatedAt,
        };

        const childFiles = (data.items || [])
          .filter((i) => !i.isFolder)
          .map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            formattedSize: f.formattedSize,
            extension: f.name.split('.').pop(),
            type: f.mimeType,
            storageKey: f.id,
            folderId: data.folder.id,
            isSharedWithMe: true,
            owner: 'Shared via Link',
          }));

        const childFolders = (data.items || [])
          .filter((i) => i.isFolder)
          .map((f) => ({
            id: f.id,
            name: f.name,
            parentId: data.folder.id,
            isSharedWithMe: true,
            owner: 'Shared via Link',
          }));

        setLinkResolvedFolders([folderObj, ...childFolders]);
        setLinkResolvedFiles(childFiles);
        addToast(`Loaded shared folder "${data.folder.name}"`);
      }
    } catch (err) {
      console.error('Resolve token error:', err.message);
      if (err.message.includes('PASSWORD_REQUIRED') || err.message.includes('Password required')) {
        setIsPasswordRequired(true);
      } else {
        setLinkError(err.message || 'Failed to load shared item from link');
      }
    } finally {
      setLoadingLink(false);
    }
  };

  useEffect(() => {
    if (token) {
      resolveToken();
    }
  }, [token]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setVerifyingPassword(true);
    await resolveToken(password);
    setVerifyingPassword(false);
  };

  // Filter folders & files where user is a shared Viewer or Editor (not Owner)
  let sharedFolders = [
    ...linkResolvedFolders,
    ...folders.filter((f) => {
      if (f.isTrash) return false;
      const isOwner = authUser && (f.ownerId === authUser.id || f.owner_id === authUser.id);
      if (isOwner) return false;
      const perm = getItemPermission(f, true);
      return perm === 'viewer' || perm === 'editor' || f.isSharedWithMe;
    }),
  ];

  let sharedFiles = [
    ...linkResolvedFiles,
    ...files.filter((f) => {
      if (f.isTrash) return false;
      const isOwner = authUser && (f.ownerId === authUser.id || f.owner_id === authUser.id);
      if (isOwner) return false;
      const perm = getItemPermission(f, false);
      return perm === 'viewer' || perm === 'editor' || f.isSharedWithMe;
    }),
  ];

  // Deduplicate by ID
  const folderMap = new Map();
  sharedFolders.forEach((f) => folderMap.set(f.id, f));
  sharedFolders = Array.from(folderMap.values());

  const fileMap = new Map();
  sharedFiles.forEach((f) => fileMap.set(f.id, f));
  sharedFiles = Array.from(fileMap.values());

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    sharedFolders = sharedFolders.filter((f) => f.name.toLowerCase().includes(q));
    sharedFiles = sharedFiles.filter((f) => f.name.toLowerCase().includes(q));
  }

  const isEmpty = sharedFolders.length === 0 && sharedFiles.length === 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-900" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Shared with me</h1>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-400 hover:text-gray-700'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Link Banner */}
      {loadingLink && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-700 font-medium">
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-indigo-600" />
          <span>Resolving shared link...</span>
        </div>
      )}

      {/* Link Password Required Prompt */}
      {isPasswordRequired && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>This shared link is password protected</span>
          </div>
          <form onSubmit={handlePasswordSubmit} className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter link password"
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white flex-1"
              required
            />
            <button
              type="submit"
              disabled={verifyingPassword || !password}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              {verifyingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Submit</span>
            </button>
          </form>
        </div>
      )}

      {/* Link Error Banner */}
      {linkError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{linkError}</span>
        </div>
      )}

      {/* Main View */}
      {isEmpty ? (
        <EmptyState
          type="shared"
          message={
            searchQuery
              ? `No shared items found matching "${searchQuery}".`
              : 'No files or folders have been shared with you yet.'
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={sharedFolders} files={sharedFiles} />
      ) : (
        <FileList folders={sharedFolders} files={sharedFiles} />
      )}
    </div>
  );
};
