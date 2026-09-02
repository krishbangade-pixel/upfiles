import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

export const NewFolderModal = ({ isOpen, onClose, onCreateFolder }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7C5CFF');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    onCreateFolder({ name: folderName.trim(), color: selectedColor });
    setFolderName('');
    setError('');
    onClose();
  };

  const colors = ['#7C5CFF', '#4F8EF7', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">New Folder</h3>
              <p className="text-xs text-[#6B7280]">Create a folder to group your files</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter folder name..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
            />
            {error && <p className="text-xs text-[#EF4444] font-medium mt-1">{error}</p>}
          </div>

          {/* Color tag picker */}
          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-2 uppercase tracking-wider">
              Folder Color Tag
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    selectedColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors border border-[#252936]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6D4FF5] rounded-xl shadow-lg shadow-[#7C5CFF]/25 transition-all"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
