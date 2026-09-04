import React from 'react';
import { FileIcon } from './FileIcon';
import { FileActionMenu } from './FileActionMenu';
import { Star } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const FileRow = ({ file, isTrash = false }) => {
  const { openModal } = useDrive();

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id: file.id, isFolder: false })
    );
  };

  return (
    <tr
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => openModal('preview', file)}
      className="border-b border-[#63655d] hover:bg-[#51534d] transition-colors cursor-pointer text-xs"
    >
      <td className="py-3 px-4 flex items-center gap-3 font-medium text-white truncate max-w-xs">
        <FileIcon type={file.type} extension={file.extension} className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{file.name}</span>
        {file.isStarred && (
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
        )}
      </td>
      <td className="py-3 px-4 text-gray-200 whitespace-nowrap">{file.owner || 'You'}</td>
      <td className="py-3 px-4 text-gray-200 whitespace-nowrap">{formatDate(file.updatedAt)}</td>
      <td className="py-3 px-4 text-gray-200 whitespace-nowrap">{file.formattedSize || '0 KB'}</td>
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <FileActionMenu file={file} isTrash={isTrash} />
      </td>
    </tr>
  );
};
