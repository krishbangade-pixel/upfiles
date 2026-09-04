import React from 'react';
import { FileIcon } from './FileIcon';
import { FileActionMenu } from './FileActionMenu';
import { Star } from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const FileCard = ({ file, isTrash = false }) => {
  const { openModal } = useDrive();

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id: file.id, isFolder: false })
    );
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => openModal('preview', file)}
      className="group relative bg-white border border-gray-200 rounded-lg p-3.5 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer select-none"
    >
      <div className="flex items-center justify-between mb-3">
        <FileIcon type={file.type} extension={file.extension} className="w-6 h-6" />
        <div className="flex items-center gap-1">
          {file.isStarred && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <FileActionMenu file={file} isTrash={isTrash} />
          </div>
        </div>
      </div>

      {file.previewUrl ? (
        <div className="w-full h-24 mb-3 rounded overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : null}

      <h4 className="text-sm font-medium text-gray-900 truncate pr-2" title={file.name}>
        {file.name}
      </h4>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
        <span>{file.formattedSize || '0 KB'}</span>
        {file.owner && file.owner !== 'You' && (
          <span className="truncate max-w-[80px]" title={`Owner: ${file.owner}`}>
            {file.owner}
          </span>
        )}
      </div>
    </div>
  );
};
