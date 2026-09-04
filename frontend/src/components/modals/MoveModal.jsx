import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';
import { Folder, HardDrive, Check } from 'lucide-react';

export const MoveModal = () => {
  const { modalState, closeModal, moveItem, folders } = useDrive();
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const isOpen = modalState?.type === 'move';
  const item = modalState?.item;
  const isFolder = modalState?.meta?.isFolder;

  if (!item) return null;

  // Filter valid candidate folders (exclude self and self-children if folder)
  const availableFolders = folders.filter(
    (f) => !f.isTrash && (isFolder ? f.id !== item.id : true)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    moveItem(item, isFolder, selectedFolderId);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={`Move "${item.name}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-semibold text-gray-300">Select destination folder:</label>

        <div className="border border-[#34373d] rounded-xl max-h-56 overflow-y-auto divide-y divide-[#34373d] text-xs bg-[#1d1e21]">
          {/* Root / My Drive */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
              selectedFolderId === null ? 'bg-[#316d7a] text-white' : 'hover:bg-[#18191b] text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4" />
              <span className="font-medium">My Drive (Root)</span>
            </div>
            {selectedFolderId === null && <Check className="w-4 h-4 text-white" />}
          </div>

          {availableFolders.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                selectedFolderId === f.id ? 'bg-[#316d7a] text-white' : 'hover:bg-[#18191b] text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4" />
                <span className="font-medium">{f.name}</span>
              </div>
              {selectedFolderId === f.id && <Check className="w-4 h-4 text-white" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#18191b] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] rounded-xl transition-colors shadow-xs"
          >
            Move here
          </button>
        </div>
      </form>
    </Modal>
  );
};
