import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';

export const RenameModal = ({ isOpen, item, onClose, onRenameConfirm }) => {
  const [newName, setNewName] = useState(item?.name || '');
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    onRenameConfirm(item.id, newName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Rename Item</h3>
              <p className="text-xs text-[#6B7280]">Enter a new name for "{item.name}"</p>
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
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-[#11141B] border border-[#252936] text-sm text-[#F5F7FA] focus:outline-none focus:border-[#7C5CFF]"
            />
            {error && <p className="text-xs text-[#EF4444] font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl border border-[#252936]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6D4FF5] rounded-xl shadow-lg shadow-[#7C5CFF]/25"
            >
              Save Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
