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
      <div className="flex items-center justify-between border-b border-[#34373d] pb-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-[#316d7a]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Trash</h1>
        </div>

        <div className="flex items-center gap-3">
          {!isEmpty && (
            <button
              onClick={emptyTrash}
              className="px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-700/60 rounded-lg transition-colors"
            >
              Empty Trash
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-[#222428] border border-[#34373d] rounded-xl p-0.5">
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
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-center gap-2.5 p-3 bg-[#222428] border border-[#34373d] rounded-xl text-xs text-gray-200">
        <Info className="w-4 h-4 text-gray-300 flex-shrink-0" />
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
