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
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Folder name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Untitled folder"
            autoFocus
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!folderName.trim()}
            className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};
