import React, { useState } from 'react';
import { Folder, MoreVertical, Star } from 'lucide-react';
import { FolderContextMenu } from './FolderContextMenu';

export const FolderCard = ({
  folder,
  onOpenFolder,
  onShare,
  onRename,
  onMove,
  onStar,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const folderColor = folder.color || '#7C5CFF';

  return (
    <div
      onClick={() => onOpenFolder(folder)}
      className="group relative bg-[#151821] border border-[#252936] rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-[#7C5CFF]/60 purple-glow-hover transition-all duration-200 shadow-md"
    >
      {/* Top Header: Folder Icon + Member Badges + Actions */}
      <div className="flex items-start justify-between mb-4">
        {/* Folder Icon Container */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${folderColor}20`, color: folderColor }}
        >
          <Folder className="w-5 h-5 fill-current" />
        </div>

        {/* Member Avatars & Context Menu */}
        <div className="flex items-center gap-2">
          {/* Member avatars */}
          {folder.members && folder.members.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {folder.members.slice(0, 2).map((m, idx) => (
                <img
                  key={m.id || idx}
                  src={m.avatar}
                  alt={m.name}
                  title={m.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-[#151821] object-cover"
                />
              ))}
            </div>
          )}

          {/* Context menu button */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <FolderContextMenu
              folder={folder}
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
              onOpenFolder={onOpenFolder}
              onShare={onShare}
              onRename={onRename}
              onMove={onMove}
              onStar={onStar}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      {/* Folder Name & Details */}
      <div>
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-[#F5F7FA] group-hover:text-[#7C5CFF] truncate transition-colors">
            {folder.name}
          </h3>
          {folder.starred && (
            <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
          )}
        </div>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          {folder.fileCount || 0} files
        </p>
      </div>
    </div>
  );
};
