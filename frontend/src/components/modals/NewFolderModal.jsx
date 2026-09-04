import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';

export const NewFolderModal = () => {
  const { modalState, closeModal, createFolder } = useDrive();
  const [folderName, setFolderName] = useState('');

  const isOpen = modalState?.type === 'newFolder';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      createFolder(folderName);
      setFolderName('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="New Folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-200 mb-1.5">
            Folder name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Untitled folder"
            autoFocus
            className="w-full px-3 py-2 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#316d7a] transition-all"
          />
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
            disabled={!folderName.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};
