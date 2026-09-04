import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'clouddrive';

const normalizeId = (id) => (!id || id === 'null' || id === 'undefined' ? null : id);

const getMimeFromExtension = (ext) => {
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    json: 'application/json',
    zip: 'application/zip',
  };
  return map[ext?.toLowerCase()] || 'application/octet-stream';
};

const formatSizeBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const fileService = {
  getFiles: async (userId) => {
    try {
      const res = await api.get('/files');
      const files = res.data || [];

      return files
        .filter((f) => !f.isTrash && !f.is_trash && !f.isDeleted && !f.is_deleted && f.status !== 'failed')
        .map((f) => {
          const ext = f.extension || (f.name ? f.name.split('.').pop() : '') || '';
          const size = Number(f.size || f.size_bytes || 0);
          const key = f.storagePath || f.storage_path || f.storage_key || `users/${userId}/files/${f.id}/original`;

          return {
            id: f.id,
            name: f.name,
            extension: ext,
            mimeType: f.mimeType || f.mime_type || getMimeFromExtension(ext),
            size,
            formattedSize: f.formattedSize || f.formatted_size || formatSizeBytes(size),
            type: ext || 'doc',
            folderId: normalizeId(f.folderId !== undefined ? f.folderId : f.folder_id),
            ownerId: f.ownerId || f.owner_id || userId,
            owner: f.owner || 'You',
            status: f.status || 'ready',
            storageKey: key,
            isStarred: !!(f.isStarred || f.is_starred),
            isTrash: !!(f.isTrash || f.is_trash || f.isDeleted || f.is_deleted),
            createdAt: f.createdAt || f.created_at || new Date().toISOString(),
            updatedAt: f.updatedAt || f.updated_at || new Date().toISOString(),
          };
        });
    } catch (err) {
      console.error('fileService.getFiles failed:', err);
      return [];
    }
  },

  uploadFile: async (fileItem, folderId, userId, onProgress) => {
    if (!fileItem) throw new Error('Missing file object');

    const fileObj = fileItem.rawFile || fileItem;
    const fileName = fileItem.name || fileObj.name || 'unnamed';
    const sizeBytes = fileItem.size || fileObj.size || 0;
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeType = fileObj.type || fileItem.type || getMimeFromExtension(ext);

    if (onProgress) onProgress(15);

    // Step 1: Initialize upload record on Express API
    const initRes = await api.post('/files/init', {
      name: fileName,
      mimeType,
      sizeBytes,
      folderId: folderId || null,
    });

    const { fileId, storagePath, bucket } = initRes.data;

    if (onProgress) onProgress(40);

    // Step 2: Upload raw file binary to Supabase Storage bucket at storagePath
    const targetBucket = bucket || BUCKET_NAME;
    const { error: uploadErr } = await supabase.storage
      .from(targetBucket)
      .upload(storagePath, fileObj, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadErr) {
      console.error('[Storage Upload Error]', uploadErr);
      throw new Error(`Storage upload failed: ${uploadErr.message}`);
    }

    if (onProgress) onProgress(75);

    // Step 3: Complete upload on Express API
    const completeRes = await api.post('/files/complete', { fileId });

    if (onProgress) onProgress(100);

    const f = completeRes.data;
    return {
      id: f.id,
      name: f.name,
      extension: f.extension || ext,
      mimeType: f.mimeType || mimeType,
      size: f.size || sizeBytes,
      formattedSize: f.formattedSize || formatSizeBytes(sizeBytes),
      type: f.extension || ext,
      folderId: normalizeId(f.folderId),
      ownerId: userId,
      owner: 'You',
      status: 'ready',
      storageKey: storagePath,
      isStarred: false,
      isTrash: false,
      createdAt: f.createdAt || new Date().toISOString(),
      updatedAt: f.updatedAt || new Date().toISOString(),
    };
  },

  getSignedPreviewUrl: async (storageKeyOrFileId) => {
    if (!storageKeyOrFileId) return null;
    try {
      // If UUID fileId or storage key, call API download endpoint
      let fileId = storageKeyOrFileId;
      if (storageKeyOrFileId.includes('/')) {
        const parts = storageKeyOrFileId.split('/');
        const fileIdx = parts.indexOf('files');
        if (fileIdx !== -1 && parts[fileIdx + 1]) {
          fileId = parts[fileIdx + 1];
        }
      }
      const res = await api.get(`/files/${fileId}/download`);
      return res.data?.url || null;
    } catch (err) {
      console.warn('fileService.getSignedPreviewUrl fallback to storage:', err.message);
      try {
        const { data } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storageKeyOrFileId, 3600);
        return data?.signedUrl || null;
      } catch (e) {
        return null;
      }
    }
  },

  getSignedDownloadUrl: async (storageKeyOrFileId) => {
    if (!storageKeyOrFileId) return null;
    try {
      let fileId = storageKeyOrFileId;
      if (storageKeyOrFileId.includes('/')) {
        const parts = storageKeyOrFileId.split('/');
        const fileIdx = parts.indexOf('files');
        if (fileIdx !== -1 && parts[fileIdx + 1]) {
          fileId = parts[fileIdx + 1];
        }
      }
      const res = await api.get(`/files/${fileId}/download`);
      return res.data?.url || null;
    } catch (err) {
      console.warn('fileService.getSignedDownloadUrl fallback to storage:', err.message);
      try {
        const { data } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storageKeyOrFileId, 300, { download: true });
        return data?.signedUrl || null;
      } catch (e) {
        return null;
      }
    }
  },

  renameFile: async (fileId, newName) => {
    try {
      const res = await api.patch(`/files/${fileId}`, { name: newName.trim() });
      return res.data;
    } catch (err) {
      console.error('fileService.renameFile failed:', err.message);
      throw err;
    }
  },

  moveFile: async (fileId, targetFolderId) => {
    try {
      const res = await api.patch(`/files/${fileId}`, { folderId: targetFolderId || null });
      return res.data;
    } catch (err) {
      console.error('fileService.moveFile failed:', err.message);
      throw err;
    }
  },

  toggleStar: async (fileId, currentState) => {
    try {
      const res = await api.patch(`/files/${fileId}`, { isStarred: !currentState });
      return res.data;
    } catch (err) {
      console.error('fileService.toggleStar failed:', err.message);
      throw err;
    }
  },

  deleteFile: async (fileId) => {
    try {
      const res = await api.delete(`/files/${fileId}`);
      return res.data;
    } catch (err) {
      console.error('fileService.deleteFile failed:', err.message);
      throw err;
    }
  },

  restoreFile: async (fileId) => {
    try {
      const res = await api.patch(`/files/${fileId}`, { isTrash: false });
      return res.data;
    } catch (err) {
      console.error('fileService.restoreFile failed:', err.message);
      throw err;
    }
  },

  deletePermanently: async (fileId) => {
    try {
      await api.delete(`/trash/files/${fileId}`);
      return true;
    } catch (err) {
      console.error('fileService.deletePermanently failed:', err.message);
      throw err;
    }
  },
};

