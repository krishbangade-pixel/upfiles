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
          <label className="block text-xs font-semibold text-gray-200 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            disabled={!name.trim() || name === item.name}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
