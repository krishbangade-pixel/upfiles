import React, { useState } from 'react';
import { FolderInput, X, Folder, HardDrive, ChevronRight } from 'lucide-react';
import { MOCK_FOLDERS } from '../../data/mockData';

export const MoveModal = ({ isOpen, item, onClose, onMoveConfirm }) => {
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = My Drive root

  if (!isOpen || !item) return null;

  const handleMove = () => {
    onMoveConfirm(item.id, selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center">
              <FolderInput className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Move "{item.name}"</h3>
              <p className="text-xs text-[#6B7280]">Select a destination folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Tree Selector */}
        <div className="bg-[#11141B] border border-[#252936] rounded-xl p-3 max-h-60 overflow-y-auto space-y-1 my-4">
          {/* Root Option */}
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedFolderId === null
                ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30'
                : 'text-[#F5F7FA] hover:bg-[#191C25]'
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#7C5CFF]" /> My Drive (Root)
          </button>

          {/* Available folders */}
          {MOCK_FOLDERS.filter((f) => f.id !== item.id).map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedFolderId === f.id
                  ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30'
                  : 'text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#4F8EF7]" />
                <span>{f.name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl border border-[#252936]"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-5 py-2 text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6D4FF5] rounded-xl shadow-lg shadow-[#7C5CFF]/25"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};
