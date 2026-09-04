import React from 'react';
import { useDrive } from '../context/DriveContext';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, List, Clock } from 'lucide-react';

export const Recent = () => {
  const { files, searchQuery, viewMode, setViewMode } = useDrive();

  // Filter non-trash files and sort by lastAccessedAt or updatedAt descending
  let recentFiles = files
    .filter((f) => !f.isTrash)
    .sort((a, b) => {
      const timeA = new Date(a.lastAccessedAt || a.updatedAt || 0);
      const timeB = new Date(b.lastAccessedAt || b.updatedAt || 0);
      return timeB - timeA;
    });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    recentFiles = recentFiles.filter((f) => f.name.toLowerCase().includes(q));
  }

  const isEmpty = recentFiles.length === 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Recent</h1>
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
          type="recent"
          message={
            searchQuery
              ? `No recent files found matching "${searchQuery}".`
              : 'You have not opened or modified any files recently.'
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={[]} files={recentFiles} />
      ) : (
        <FileList folders={[]} files={recentFiles} />
      )}
    </div>
  );
};
