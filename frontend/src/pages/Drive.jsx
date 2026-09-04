import React from 'react';
import { useDrive } from '../context/DriveContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export const Drive = () => {
  const {
    folders,
    files,
    currentFolderId,
    searchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useDrive();

  const normalizeId = (id) => (!id || id === 'null' || id === 'undefined' ? null : id);

  // 1. Filter current folder context
  let currentFolders = folders.filter(
    (f) => !f.isTrash && normalizeId(f.parentId) === normalizeId(currentFolderId)
  );
  let currentFiles = files.filter(
    (f) => !f.isTrash && !f.isSharedWithMe && normalizeId(f.folderId) === normalizeId(currentFolderId)
  );

  // 2. Filter search query if present
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    // Search across all non-trash folders and files regardless of current folder
    currentFolders = folders.filter(
      (f) => !f.isTrash && f.name.toLowerCase().includes(q)
    );
    currentFiles = files.filter(
      (f) => !f.isTrash && !f.isSharedWithMe && f.name.toLowerCase().includes(q)
    );
  }

  // 3. Apply Sorting
  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      let res = 0;
      if (sortBy === 'name') {
        res = a.name.localeCompare(b.name);
      } else if (sortBy === 'modified') {
        res = new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      } else if (sortBy === 'size') {
        res = (b.size || 0) - (a.size || 0);
      } else if (sortBy === 'type') {
        const typeA = a.extension || a.type || 'folder';
        const typeB = b.extension || b.type || 'folder';
        res = typeA.localeCompare(typeB);
      }
      return sortOrder === 'asc' ? res : -res;
    });
  };

  const sortedFolders = sortItems(currentFolders);
  const sortedFiles = sortItems(currentFiles);

  const isEmpty = sortedFolders.length === 0 && sortedFiles.length === 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Drive</h1>
          <Breadcrumbs />
        </div>

        {/* View & Sorting Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Control */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-600">
            <span className="text-gray-400 font-medium">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="modified">Last modified</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-500 hover:text-gray-900 rounded transition-colors ml-1"
              title={`Sort order: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid / List View Toggle */}
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
      </div>

      {/* Main File Browser View */}
      {isEmpty ? (
        <EmptyState
          type={searchQuery ? 'search' : 'empty'}
          message={
            searchQuery
              ? `No matching files or folders found for "${searchQuery}".`
              : 'This folder is empty.'
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={sortedFolders} files={sortedFiles} />
      ) : (
        <FileList folders={sortedFolders} files={sortedFiles} />
      )}
    </div>
  );
};
