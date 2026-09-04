import React from 'react';
import { useDrive } from '../context/DriveContext';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, List, Users } from 'lucide-react';

export const Shared = () => {
  const { files, folders, searchQuery, viewMode, setViewMode, getItemPermission, authUser } = useDrive();

  // Filter folders & files where user is a shared Viewer or Editor (not Owner)
  let sharedFolders = folders.filter((f) => {
    if (f.isTrash) return false;
    const isOwner = authUser && (f.ownerId === authUser.id || f.owner_id === authUser.id);
    if (isOwner) return false;
    const perm = getItemPermission(f, true);
    return perm === 'viewer' || perm === 'editor' || f.isSharedWithMe;
  });

  let sharedFiles = files.filter((f) => {
    if (f.isTrash) return false;
    const isOwner = authUser && (f.ownerId === authUser.id || f.owner_id === authUser.id);
    if (isOwner) return false;
    const perm = getItemPermission(f, false);
    return perm === 'viewer' || perm === 'editor' || f.isSharedWithMe;
  });

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
          <Users className="w-5 h-5 text-gray-700" />
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
