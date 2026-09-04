import { api } from '../lib/api';

export const trashService = {
  getTrashItems: async (userId) => {
    try {
      const res = await api.get('/trash');
      const data = res.data || { files: [], folders: [] };

      return {
        files: (data.files || []).map((f) => ({
          id: f.id,
          name: f.name,
          extension: f.extension || (f.name ? f.name.split('.').pop() : '') || '',
          size: Number(f.size || 0),
          formattedSize: f.formattedSize || '0 B',
          storageKey: f.storageKey || f.storagePath,
          deletedAt: f.deletedAt,
          isTrash: true,
        })),
        folders: (data.folders || []).map((f) => ({
          id: f.id,
          name: f.name,
          deletedAt: f.deletedAt,
          isTrash: true,
        })),
      };
    } catch (err) {
      console.error('trashService.getTrashItems failed:', err);
      return { files: [], folders: [] };
    }
  },

  emptyTrash: async (userId) => {
    try {
      const items = await trashService.getTrashItems(userId);
      await Promise.all([
        ...(items.files || []).map((f) => api.delete(`/trash/${f.id}/permanent?type=file`)),
        ...(items.folders || []).map((f) => api.delete(`/trash/${f.id}/permanent?type=folder`)),
      ]);
    } catch (err) {
      console.error('trashService.emptyTrash failed:', err);
    }
  },
};

