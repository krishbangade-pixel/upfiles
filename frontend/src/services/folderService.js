import { api } from '../lib/api';

export const folderService = {
  getFolders: async (userId) => {
    try {
      const res = await api.get('/folders');
      const folders = res.data || [];
      return folders
        .filter((f) => !f.isTrash && !f.isDeleted)
        .map((f) => ({
          id: f.id,
          name: f.name,
          parentId: f.parentId || f.parent_id,
          ownerId: f.ownerId || f.owner_id,
          isStarred: !!f.isStarred,
          isTrash: !!f.isTrash,
          createdAt: f.createdAt || f.created_at,
          updatedAt: f.updatedAt || f.updated_at,
        }));
    } catch (err) {
      console.error('folderService.getFolders failed:', err);
      return [];
    }
  },

  createFolder: async (name, parentId, userId) => {
    if (!name) return null;
    try {
      const payload = {
        name: name.trim(),
        parentId: parentId || null,
      };

      const res = await api.post('/folders', payload);
      const data = res.data;

      return {
        id: data.id,
        name: data.name,
        parentId: data.parentId || data.parent_id,
        ownerId: data.ownerId || data.owner_id,
        isStarred: !!data.isStarred,
        isTrash: !!data.isTrash,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
      };
    } catch (err) {
      console.error('folderService.createFolder failed:', err);
      throw err;
    }
  },

  renameFolder: async (folderId, newName) => {
    try {
      const res = await api.patch(`/folders/${folderId}`, {
        name: newName.trim(),
      });
      return res.data;
    } catch (err) {
      console.error('folderService.renameFolder failed:', err);
      throw err;
    }
  },

  moveFolder: async (folderId, targetParentId) => {
    try {
      if (folderId === targetParentId) {
        throw new Error('Cannot move folder into itself');
      }

      const res = await api.patch(`/folders/${folderId}`, {
        parentId: targetParentId || null,
      });
      return res.data;
    } catch (err) {
      console.error('folderService.moveFolder failed:', err);
      throw err;
    }
  },

  toggleStar: async (folderId, isStarred) => {
    try {
      const res = await api.patch(`/folders/${folderId}`, {
        isStarred: !isStarred,
      });
      return res.data;
    } catch (err) {
      console.error('folderService.toggleStar failed:', err);
      throw err;
    }
  },

  deleteFolder: async (folderId) => {
    try {
      await api.delete(`/folders/${folderId}`);
      return true;
    } catch (err) {
      console.error('folderService.deleteFolder failed:', err);
      throw err;
    }
  },

  restoreFolder: async (folderId) => {
    try {
      await api.patch(`/folders/${folderId}`, {
        isTrash: false,
      });
      return true;
    } catch (err) {
      console.error('folderService.restoreFolder failed:', err);
      throw err;
    }
  },

  deletePermanently: async (folderId) => {
    try {
      await api.delete(`/trash/folders/${folderId}`);
      return true;
    } catch (err) {
      console.error('folderService.deletePermanently failed:', err);
      throw err;
    }
  },
};

