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
      className={`group relative bg-[#444640] border rounded-xl p-3.5 hover:shadow-md hover:border-[#316d7a] transition-all cursor-pointer select-none ${
        isDragOver ? 'border-[#316d7a] bg-[#3b3d37] ring-2 ring-[#316d7a]/50' : 'border-[#63655d]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Folder className="w-6 h-6 text-[#316d7a] fill-[#316d7a]/20 group-hover:text-white transition-colors" />
        <div onClick={(e) => e.stopPropagation()}>
          <FolderActionMenu folder={folder} isTrash={isTrash} />
        </div>
      </div>
      <h4 className="text-sm font-medium text-white truncate pr-2" title={folder.name}>
        {folder.name}
      </h4>
      <p className="text-xs text-gray-300 mt-1">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
};
