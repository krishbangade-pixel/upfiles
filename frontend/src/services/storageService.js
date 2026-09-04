import { api } from '../lib/api';

const TOTAL_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

export const storageService = {
  getStorageUsage: async (userId) => {
    try {
      const res = await api.get('/storage/usage');
      const data = res.data || {};

      const usedBytes = data.usedBytes || 0;
      const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(1);
      const totalGB = (TOTAL_STORAGE_BYTES / (1024 * 1024 * 1024)).toFixed(1);
      const freeGB = Math.max(0, Number(totalGB) - Number(usedGB)).toFixed(1);
      const percentage = Math.min(100, Math.max(0, (usedBytes / TOTAL_STORAGE_BYTES) * 100));

      return {
        usedBytes,
        totalBytes: TOTAL_STORAGE_BYTES,
        usedGB,
        totalGB,
        freeGB,
        percentage,
        formattedText: `${freeGB} GB left of ${totalGB} GB`,
      };
    } catch (err) {
      console.error('storageService.getStorageUsage failed:', err);
      return {
        usedBytes: 0,
        totalBytes: TOTAL_STORAGE_BYTES,
        usedGB: '0.0',
        totalGB: '15.0',
        freeGB: '15.0',
        percentage: 0,
        formattedText: '15.0 GB left of 15.0 GB',
      };
    }
  },
};

