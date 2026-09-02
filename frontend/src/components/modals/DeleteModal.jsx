import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export const DeleteModal = ({ isOpen, item, isPermanent = false, onClose, onDeleteConfirm }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA]">
                {isPermanent ? 'Delete Permanently?' : 'Move to Trash?'}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {isPermanent
                  ? 'This action cannot be undone.'
                  : 'Items in trash are kept for 30 days before permanent removal.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF] my-4 p-3 bg-[#11141B] rounded-xl border border-[#252936]">
          Are you sure you want to delete <strong className="text-[#F5F7FA]">{item.name}</strong>?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl border border-[#252936]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDeleteConfirm(item.id);
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl shadow-lg shadow-[#EF4444]/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> {isPermanent ? 'Delete Permanently' : 'Move to Trash'}
          </button>
        </div>
      </div>
    </div>
  );
};
