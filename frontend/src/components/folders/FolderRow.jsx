import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import { FolderActionMenu } from './FolderActionMenu';
import { useDrive } from '../../context/DriveContext';

export const FolderRow = ({ folder, isTrash = false }) => {
  const { setCurrentFolderId, moveItem } = useDrive();
  const [isDragOver, setIsDragOver] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
        moveItem({ id: data.id }, data.isFolder, folder.id);
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
    <tr
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isTrash && setCurrentFolderId(folder.id)}
      className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer text-xs ${
        isDragOver ? 'bg-indigo-50 border-indigo-200' : ''
      }`}
    >
      <td className="py-3 px-4 flex items-center gap-3 font-medium text-gray-900 truncate max-w-xs">
        <Folder className="w-4 h-4 text-gray-600 fill-gray-100 flex-shrink-0" />
        <span className="truncate">{folder.name}</span>
      </td>
      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{folder.owner || 'You'}</td>
      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(folder.updatedAt)}</td>
      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">--</td>
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <FolderActionMenu folder={folder} isTrash={isTrash} />
      </td>
    </tr>
  );
};
