import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  FolderOpen,
  Share2,
  Edit2,
  FolderInput,
  Star,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useDrive } from '../../context/DriveContext';

export const FolderActionMenu = ({ folder, isTrash = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    setCurrentFolderId,
    openModal,
    toggleStar,
    deleteItem,
    restoreItem,
    deletePermanently,
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

  // Determine permissions for folder
  const isOwner = !authUser || folder.ownerId === authUser.id || folder.owner_id === authUser.id;
  const permission = isOwner ? 'owner' : getItemPermission(folder, true);

  const canShare = permission === 'owner';
  const canEdit = permission === 'owner' || permission === 'editor';
  const canDelete = permission === 'owner';

  const handleAction = (actionFn) => {
    setIsOpen(false);
    actionFn();
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        title="Folder options"
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
                onClick={() => handleAction(() => setCurrentFolderId(folder.id))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                Open
              </button>

              {canShare && (
                <button
                  onClick={() => handleAction(() => openModal('share', folder, { isFolder: true }))}
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
                    onClick={() => handleAction(() => openModal('rename', folder, { isFolder: true }))}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    Rename
                  </button>
                  <button
                    onClick={() => handleAction(() => openModal('move', folder, { isFolder: true }))}
                    className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                  >
                    <FolderInput className="w-3.5 h-3.5 text-gray-500" />
                    Move
                  </button>
                </>
              )}

              <button
                onClick={() => handleAction(() => toggleStar(folder, true))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    folder.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-500'
                  }`}
                />
                {folder.isStarred ? 'Remove from Starred' : 'Add to Starred'}
              </button>

              {canDelete && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => handleAction(() => deleteItem(folder, true))}
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
                onClick={() => handleAction(() => restoreItem(folder, true))}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                Restore
              </button>
              <button
                onClick={() => handleAction(() => deletePermanently(folder, true))}
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
