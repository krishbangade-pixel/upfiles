import React from 'react';
import { useDrive } from '../context/DriveContext';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { EmptyState } from '../components/common/EmptyState';
import { LayoutGrid, List, Trash2, Info } from 'lucide-react';

export const Trash = () => {
  const { folders, files, searchQuery, viewMode, setViewMode, emptyTrash } = useDrive();

  let trashFolders = folders.filter((f) => f.isTrash);
  let trashFiles = files.filter((f) => f.isTrash);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    trashFolders = trashFolders.filter((f) => f.name.toLowerCase().includes(q));
    trashFiles = trashFiles.filter((f) => f.name.toLowerCase().includes(q));
  }

  const isEmpty = trashFolders.length === 0 && trashFiles.length === 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Trash</h1>
        </div>

        <div className="flex items-center gap-3">
          {!isEmpty && (
            <button
              onClick={emptyTrash}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              Empty Trash
            </button>
          )}

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
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>Items in Trash will be automatically deleted after 30 days.</span>
      </div>

      {/* Main View */}
      {isEmpty ? (
        <EmptyState
          type="trash"
          message={
            searchQuery
              ? `No deleted items found matching "${searchQuery}".`
              : 'Trash is empty.'
          }
        />
      ) : viewMode === 'grid' ? (
        <FileGrid folders={trashFolders} files={trashFiles} isTrash={true} />
      ) : (
        <FileList folders={trashFolders} files={trashFiles} isTrash={true} />
      )}
    </div>
  );
};
