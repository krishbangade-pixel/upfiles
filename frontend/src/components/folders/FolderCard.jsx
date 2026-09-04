import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import { FolderActionMenu } from './FolderActionMenu';
import { useDrive } from '../../context/DriveContext';

export const FolderCard = ({ folder, isTrash = false }) => {
  const { setCurrentFolderId, files, folders, moveItem } = useDrive();
  const [isDragOver, setIsDragOver] = useState(false);

  // Count items inside this folder
  const itemCount =
    files.filter((f) => f.folderId === folder.id && !f.isTrash).length +
    folders.filter((f) => f.parentId === folder.id && !f.isTrash).length;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.id) {
        // Find if item is file or folder
        const isF = data.isFolder;
        moveItem({ id: data.id }, isF, folder.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id: folder.id, isFolder: true })
    );
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isTrash && setCurrentFolderId(folder.id)}
      className={`group relative bg-white border rounded-lg p-3.5 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer select-none ${
        isDragOver ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Folder className="w-6 h-6 text-gray-700 fill-gray-100 group-hover:text-gray-900 transition-colors" />
        <div onClick={(e) => e.stopPropagation()}>
          <FolderActionMenu folder={folder} isTrash={isTrash} />
        </div>
      </div>
      <h4 className="text-sm font-medium text-gray-900 truncate pr-2" title={folder.name}>
        {folder.name}
      </h4>
      <p className="text-xs text-gray-500 mt-1">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
};
