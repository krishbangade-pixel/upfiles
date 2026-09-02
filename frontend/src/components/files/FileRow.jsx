import React, { useState } from 'react';
import { MoreVertical, Star } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { FileContextMenu } from './FileContextMenu';
import { formatBytes, formatDate } from '../../utils/formatters';

export const FileRow = ({
  file,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onMove,
  onStar,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-[#191C25] transition-all border border-transparent hover:border-[#252936]">
      {/* File Name & Icon */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-[#11141B] border border-[#252936] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <FileIcon fileName={file.name} type={file.type} extension={file.extension} className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span
              onClick={() => onPreview(file)}
              className="text-xs font-semibold text-[#F5F7FA] hover:text-[#7C5CFF] cursor-pointer truncate transition-colors"
            >
              {file.name}
            </span>
            {file.starred && (
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="hidden sm:block w-28 text-xs font-medium text-[#9CA3AF] text-left">
        {formatBytes(file.size)}
      </div>

      {/* Modified Date */}
      <div className="hidden md:block w-32 text-xs font-medium text-[#9CA3AF] text-left">
        {formatDate(file.lastModified)}
      </div>

      {/* Members Overlapping Avatar Stack */}
      <div className="hidden lg:flex items-center justify-end w-32 pr-4">
        <div className="flex -space-x-2 overflow-hidden">
          {file.members && file.members.length > 0 ? (
            file.members.slice(0, 4).map((member, idx) => (
              <img
                key={member.id || idx}
                src={member.avatar}
                alt={member.name}
                title={member.name}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#151821] object-cover"
              />
            ))
          ) : (
            <span className="text-[11px] text-[#6B7280]">Only you</span>
          )}
          {file.members && file.members.length > 4 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#252936] ring-2 ring-[#151821] text-[10px] font-bold text-[#F5F7FA]">
              +{file.members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Actions 3-dot Button */}
      <div className="relative shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <FileContextMenu
          file={file}
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onPreview={onPreview}
          onDownload={onDownload}
          onShare={onShare}
          onRename={onRename}
          onMove={onMove}
          onStar={onStar}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
