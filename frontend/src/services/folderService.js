import { MOCK_FOLDERS } from '../data/mockData';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

export const folderService = {
  getFolders: async (parentId = null) => {
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 150));
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    return allFolders.filter((f) => f.parentId === parentId);
  },

  getAllFolders: async () => {
    await new Promise((res) => setTimeout(res, 100));
    return getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
  },

  getFolderById: async (id) => {
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    return allFolders.find((f) => f.id === id) || null;
  },

  createFolder: async ({ name, parentId = null, color = '#7C5CFF' }) => {
    await new Promise((res) => setTimeout(res, 200));
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    
    const newFolder = {
      id: `f-${Date.now()}`,
      name,
      fileCount: 0,
      size: 0,
      parentId,
      createdAt: new Date().toISOString(),
      starred: false,
      members: [],
      color,
    };

    const updated = [newFolder, ...allFolders];
    setStoredItem(STORAGE_KEYS.FOLDERS, updated);
    return newFolder;
  },

  renameFolder: async (id, newName) => {
    await new Promise((res) => setTimeout(res, 150));
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    const updated = allFolders.map((f) => (f.id === id ? { ...f, name: newName } : f));
    setStoredItem(STORAGE_KEYS.FOLDERS, updated);
    return updated.find((f) => f.id === id);
  },

  toggleStarFolder: async (id) => {
    await new Promise((res) => setTimeout(res, 100));
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    const updated = allFolders.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f));
    setStoredItem(STORAGE_KEYS.FOLDERS, updated);
    return updated.find((f) => f.id === id);
  },

  deleteFolder: async (id) => {
    await new Promise((res) => setTimeout(res, 200));
    const allFolders = getStoredItem(STORAGE_KEYS.FOLDERS, MOCK_FOLDERS);
    const targetFolder = allFolders.find((f) => f.id === id);
    const updated = allFolders.filter((f) => f.id !== id);
    setStoredItem(STORAGE_KEYS.FOLDERS, updated);
    return targetFolder;
  }
};
