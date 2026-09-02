import { MOCK_FILES, MOCK_TRASH } from '../data/mockData';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

export const fileService = {
  getFiles: async (folderId = null) => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    if (folderId === 'all') return allFiles;
    return allFiles.filter((f) => f.folderId === folderId);
  },

  getAllFiles: async () => {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
  },

  getRecentFiles: async (limit = 10) => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    return [...allFiles]
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, limit);
  },

  getStarredFiles: async () => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    return allFiles.filter((f) => f.starred);
  },

  getSharedFiles: async () => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    return allFiles.filter((f) => f.sharedWithMe);
  },

  getTrashItems: async () => {
    await new Promise((res) => setTimeout(res, 150));
    return getStoredItem('cloudvault_trash', MOCK_TRASH);
  },

  uploadFile: async ({ file, folderId = null }) => {
    await new Promise((res) => setTimeout(res, 300));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'dat';

    const newFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      folderId,
      size: file.size || Math.floor(Math.random() * 15000000) + 500000,
      type: file.type || 'application/octet-stream',
      extension: ext,
      lastModified: new Date().toISOString(),
      members: [],
      starred: false,
      sharedWithMe: false,
      owner: { name: 'You', email: 'you@cloudvault.io' },
      url: file.url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1000',
    };

    const updated = [newFile, ...allFiles];
    setStoredItem(STORAGE_KEYS.FILES, updated);
    return newFile;
  },

  renameFile: async (id, newName) => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    const updated = allFiles.map((f) => (f.id === id ? { ...f, name: newName } : f));
    setStoredItem(STORAGE_KEYS.FILES, updated);
    return updated.find((f) => f.id === id);
  },

  moveFile: async (id, targetFolderId) => {
    await new Promise((res) => setTimeout(res, 150));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    const updated = allFiles.map((f) => (f.id === id ? { ...f, folderId: targetFolderId } : f));
    setStoredItem(STORAGE_KEYS.FILES, updated);
    return updated.find((f) => f.id === id);
  },

  toggleStarFile: async (id) => {
    await new Promise((res) => setTimeout(res, 100));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    const updated = allFiles.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f));
    setStoredItem(STORAGE_KEYS.FILES, updated);
    return updated.find((f) => f.id === id);
  },

  deleteFile: async (id) => {
    await new Promise((res) => setTimeout(res, 200));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    const targetFile = allFiles.find((f) => f.id === id);
    if (!targetFile) return null;

    const remainingFiles = allFiles.filter((f) => f.id !== id);
    setStoredItem(STORAGE_KEYS.FILES, remainingFiles);

    // Add to trash
    const trash = getStoredItem('cloudvault_trash', MOCK_TRASH);
    const trashItem = {
      id: `trash-${Date.now()}`,
      name: targetFile.name,
      type: 'file',
      size: targetFile.size,
      deletedAt: new Date().toISOString(),
      originalLocation: 'My Drive',
      item: targetFile,
    };
    setStoredItem('cloudvault_trash', [trashItem, ...trash]);
    return targetFile;
  },

  restoreFileFromTrash: async (trashId) => {
    await new Promise((res) => setTimeout(res, 200));
    const trash = getStoredItem('cloudvault_trash', MOCK_TRASH);
    const targetTrashItem = trash.find((t) => t.id === trashId);
    if (!targetTrashItem) return null;

    const updatedTrash = trash.filter((t) => t.id !== trashId);
    setStoredItem('cloudvault_trash', updatedTrash);

    // Restore to files
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, MOCK_FILES);
    setStoredItem(STORAGE_KEYS.FILES, [targetTrashItem.item, ...allFiles]);
    return targetTrashItem.item;
  },

  permanentDeleteFromTrash: async (trashId) => {
    await new Promise((res) => setTimeout(res, 150));
    const trash = getStoredItem('cloudvault_trash', MOCK_TRASH);
    const updated = trash.filter((t) => t.id !== trashId);
    setStoredItem('cloudvault_trash', updated);
    return true;
  }
};
