import React from 'react';
import { useDrive } from '../context/DriveContext';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, List, Star } from 'lucide-react';

export const Starred = () => {
  const { folders, files, searchQuery, viewMode, setViewMode } = useDrive();

  let starredFolders = folders.filter((f) => !f.isTrash && f.isStarred);
  let starredFiles = files.filter((f) => !f.isTrash && f.isStarred);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    starredFolders = starredFolders.filter((f) => f.name.toLowerCase().includes(q));
    starredFiles = starredFiles.filter((f) => f.name.toLowerCase().includes(q));
  }

  const isEmpty = starredFolders.length === 0 && starredFiles.length === 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#63655d] pb-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Starred</h1>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#444640] border border-[#63655d] rounded-xl p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#316d7a] text-white shadow-xs font-semibold'
                : 'text-gray-300 hover:text-white'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[#316d7a] text-white shadow-xs font-semibold'
                : 'text-gray-300 hover:text-white'
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
          type="starred"
          message={
            searchQuery
              ? `No starred items found matching "${searchQuery}".`
              : 'Add stars to files and folders to easily find them later.'
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={starredFolders} files={starredFiles} />
      ) : (
        <FileList folders={starredFolders} files={starredFiles} />
      )}
    </div>
  );
};
