import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';

export const RenameModal = () => {
  const { modalState, closeModal, renameItem } = useDrive();
  const [name, setName] = useState('');

  const isOpen = modalState?.type === 'rename';
  const item = modalState?.item;
  const isFolder = modalState?.meta?.isFolder;

  useEffect(() => {
    if (item) {
      setName(item.name);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      renameItem(item, isFolder, name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={`Rename ${isFolder ? 'Folder' : 'File'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            disabled={!name.trim() || name === item.name}
            className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
