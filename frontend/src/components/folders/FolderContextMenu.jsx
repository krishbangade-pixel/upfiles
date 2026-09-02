import React, { useRef, useEffect } from 'react';
import { FolderOpen, Share2, Edit2, FolderInput, Star, Trash2 } from 'lucide-react';

export const FolderContextMenu = ({
  folder,
  isOpen,
  onClose,
  onOpenFolder,
  onShare,
  onRename,
  onMove,
  onStar,
  onDelete,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-40 w-48 rounded-xl bg-[#191C25] border border-[#252936] shadow-2xl p-1.5 animate-fade-in"
    >
      <button
        onClick={() => { onClose(); onOpenFolder(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
      >
        <FolderOpen className="w-4 h-4 text-[#4F8EF7]" /> Open Folder
      </button>

      <button
        onClick={() => { onClose(); onShare(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4 text-[#7C5CFF]" /> Share
      </button>

      <button
        onClick={() => { onClose(); onStar(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
      >
        <Star className={`w-4 h-4 ${folder.starred ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#9CA3AF]'}`} />
        {folder.starred ? 'Unstar' : 'Star'}
      </button>

      <div className="my-1 border-t border-[#252936]" />

      <button
        onClick={() => { onClose(); onRename(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
      >
        <Edit2 className="w-4 h-4 text-[#9CA3AF]" /> Rename
      </button>

      <button
        onClick={() => { onClose(); onMove(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#151821] rounded-lg transition-colors"
      >
        <FolderInput className="w-4 h-4 text-[#9CA3AF]" /> Move
      </button>

      <div className="my-1 border-t border-[#252936]" />

      <button
        onClick={() => { onClose(); onDelete(folder); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" /> Move to Trash
      </button>
    </div>
  );
};
