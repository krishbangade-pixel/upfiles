import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Download,
  Share2,
  Edit2,
  FolderInput,
  Star,
  Trash2,
  RotateCcw,
  Copy,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const FileActionMenu = ({ file, isTrash = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    openModal,
    toggleStar,
    deleteItem,
    restoreItem,
    deletePermanently,
    addToast,
    getItemPermission,
    authUser,
  } = useDrive();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine permissions
  const isOwner = !authUser || file.ownerId === authUser.id || file.owner_id === authUser.id;
  const permission = isOwner ? 'owner' : getItemPermission(file, false);

  const canShare = permission === 'owner';
  const canEdit = permission === 'owner' || permission === 'editor';
  const canDelete = permission === 'owner';

  const handleAction = (actionFn) => {
    setIsOpen(false);
    actionFn();
  };

  const handleDownload = () => {
    addToast(`Downloading "${file.name}"...`);
    const blob = new Blob([`Content for ${file.name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/drive?item=${file.id}`;
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard');
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs text-gray-700 animate-fade-in"
        >
          {!isTrash ? (
            <>
              <button
                onClick={() => handleAction(() => openModal('preview', file))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                Open
              </button>

              <button
                onClick={() => handleAction(handleDownload)}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                Download
              </button>

              <button
                onClick={() => handleAction(handleCopyLink)}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                Copy link
              </button>

              {canShare && (
                <button
                  onClick={() => handleAction(() => openModal('share', file, { isFolder: false }))}
                  className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-gray-500" />
                  Share
                </button>
              )}

              {canEdit && <div className="my-1 border-t border-gray-100" />}

              {canEdit && (
                <>
                  <button
                    onClick={() => handleAction(() => openModal('rename', file, { isFolder: false }))}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    Rename
                  </button>

                  <button
                    onClick={() => handleAction(() => openModal('move', file, { isFolder: false }))}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <FolderInput className="w-3.5 h-3.5 text-gray-500" />
                    Move
                  </button>
                </>
              )}

              <button
                onClick={() => handleAction(() => toggleStar(file, false))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    file.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-500'
                  }`}
                />
                {file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
              </button>

              {canDelete && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => handleAction(() => deleteItem(file, false))}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Delete
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => handleAction(() => restoreItem(file, false))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                Restore
              </button>
              <button
                onClick={() => handleAction(() => deletePermanently(file, false))}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Delete permanently
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
