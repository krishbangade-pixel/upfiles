import React, { useState } from 'react';
import { MoreVertical, Star } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { FileContextMenu } from './FileContextMenu';
import { formatBytes, formatDate } from '../../utils/formatters';

export const FileCard = ({
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
    <div className="group relative bg-[#151821] border border-[#252936] rounded-2xl p-4 flex flex-col justify-between hover:border-[#7C5CFF]/50 purple-glow-hover transition-all shadow-md">
      {/* Top Bar: Icon, Star, 3-dot Menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#11141B] border border-[#252936] flex items-center justify-center group-hover:scale-105 transition-transform">
          <FileIcon fileName={file.name} type={file.type} extension={file.extension} className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onStar(file)}
            className="p-1.5 text-[#6B7280] hover:text-[#F59E0B] rounded-lg transition-colors"
          >
            <Star className={`w-4 h-4 ${file.starred ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#6B7280]'}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-lg transition-colors"
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
      </div>

      {/* Middle: Title & Specs */}
      <div className="my-2 cursor-pointer" onClick={() => onPreview(file)}>
        <h4 className="text-xs font-semibold text-[#F5F7FA] hover:text-[#7C5CFF] truncate transition-colors">
          {file.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-[#6B7280] font-medium mt-1">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.lastModified)}</span>
        </div>
      </div>

      {/* Footer: Member avatars */}
      <div className="pt-3 border-t border-[#252936]/60 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase text-[#6B7280] tracking-wider">
          {file.extension || 'FILE'}
        </span>
        <div className="flex -space-x-1.5 overflow-hidden">
          {file.members && file.members.length > 0 ? (
            file.members.slice(0, 3).map((m, idx) => (
              <img
                key={m.id || idx}
                src={m.avatar}
                alt={m.name}
                title={m.name}
                className="inline-block h-5 w-5 rounded-full ring-1 ring-[#151821] object-cover"
              />
            ))
          ) : (
            <span className="text-[10px] text-[#6B7280]">Private</span>
          )}
        </div>
      </div>
    </div>
  );
};
