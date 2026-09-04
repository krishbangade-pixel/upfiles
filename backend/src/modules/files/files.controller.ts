import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { env } from '../../config/env.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { getUserFilePermission, getUserFolderPermission } from '../../utils/permissions.js';
import { getFileStoragePath, createSignedDownloadUrl } from '../../utils/storage.js';
import { sanitizeFilename, getExtension, formatSizeBytes } from '../../utils/filenames.js';
import { z } from 'zod';

export const initUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  sizeBytes: z.number().nonnegative('Size cannot be negative'),
  folderId: z.string().uuid().nullable().optional(),
});

export const completeUploadSchema = z.object({
  fileId: z.string().uuid(),
});

export const updateFileSchema = z.object({
  name: z.string().min(1).trim().optional(),
  folderId: z.string().uuid().nullable().optional(),
  isStarred: z.boolean().optional(),
  isTrash: z.boolean().optional(),
});

export async function initUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { name, mimeType, sizeBytes, folderId } = req.body;
    const targetFolderId = folderId || null;

    if (targetFolderId) {
      const perm = await getUserFolderPermission(user.id, user.email, targetFolderId, db);
      if (!perm.canWrite) {
        throw new ForbiddenError('No write permission in target folder');
      }
    }

    const cleanName = sanitizeFilename(name);

    const { data: file, error } = await db
      .from('files')
      .insert({
        name: cleanName,
        size_bytes: sizeBytes,
        mime_type: mimeType,
        storage_key: 'pending',
        folder_id: targetFolderId,
        owner_id: user.id,
        status: 'uploading',
        is_deleted: false,
      })
      .select()
      .single();

    if (error || !file) {
      throw new Error(error?.message || 'Failed to initialize file record');
    }

    const storagePath = getFileStoragePath(user.id, file.id);

    await db
      .from('files')
      .update({ storage_key: storagePath })
      .eq('id', file.id);

    let uploadUrl: string | null = null;
    let token: string | null = null;
    try {
      const { data: uploadUrlData } = await supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .createSignedUploadUrl(storagePath);
      uploadUrl = uploadUrlData?.signedUrl || null;
      token = uploadUrlData?.token || null;
    } catch (e) {}

    res.status(201).json({
      data: {
        fileId: file.id,
        name: cleanName,
        storagePath,
        bucket: env.SUPABASE_STORAGE_BUCKET,
        uploadUrl,
        token,
      },
      message: 'Upload initialized successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function completeUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { fileId } = req.body;

    const perm = await getUserFilePermission(user.id, user.email, fileId, db);
    if (!perm.canWrite) {
      throw new ForbiddenError('Access denied');
    }

    const { data: file, error } = await db
      .from('files')
      .update({
        status: 'ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .select()
      .single();

    if (error || !file) {
      throw new NotFoundError('File not found');
    }

    try {
      await db.from('activities').insert({
        user_id: user.id,
        action: 'upload',
        resource_type: 'file',
        resource_id: file.id,
        context: { name: file.name, size: file.size_bytes },
      });
    } catch (e) {}

    const ext = getExtension(file.name);
    res.status(200).json({
      data: {
        id: file.id,
        name: file.name,
        extension: ext,
        size: file.size_bytes,
        formattedSize: formatSizeBytes(file.size_bytes),
        type: ext,
        folderId: file.folder_id,
        status: file.status,
        createdAt: file.created_at,
        updatedAt: file.updated_at,
      },
      message: 'File upload completed',
    });
  } catch (err) {
    next(err);
  }
}

export async function getFile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;

    const perm = await getUserFilePermission(user.id, user.email, id, db);
    if (!perm.canRead) {
      throw new ForbiddenError('Access denied');
    }

    const ext = getExtension(perm.file.name);
    res.status(200).json({
      data: {
        id: perm.file.id,
        name: perm.file.name,
        extension: ext,
        size: perm.file.size_bytes,
        formattedSize: formatSizeBytes(perm.file.size_bytes),
        mimeType: perm.file.mime_type,
        folderId: perm.file.folder_id,
        ownerId: perm.file.owner_id,
        status: perm.file.status,
        isStarred: !!perm.file.is_starred,
        isTrash: !!perm.file.is_deleted,
        createdAt: perm.file.created_at,
        updatedAt: perm.file.updated_at,
        permission: perm.role,
      },
      message: 'File metadata retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;

    const perm = await getUserFilePermission(user.id, user.email, id, db);
    if (!perm.canRead || perm.file.is_deleted) {
      throw new ForbiddenError('File access forbidden or file in trash');
    }

    const key = perm.file.storage_key || perm.file.storage_path;
    const { url, expiresIn } = await createSignedDownloadUrl(key, 3600, db);

    try {
      await db.from('activities').insert({
        user_id: user.id,
        action: 'download',
        resource_type: 'file',
        resource_id: id,
        context: { name: perm.file.name },
      });
    } catch (e) {}

    res.status(200).json({
      data: {
        url,
        expiresIn,
        filename: perm.file.name,
      },
      message: 'Download URL generated',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;
    const { name, folderId, isTrash } = req.body;

    const perm = await getUserFilePermission(user.id, user.email, id, db);
    if (!perm.canWrite) {
      throw new ForbiddenError('No write permission for this file');
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (name !== undefined) {
      updates.name = sanitizeFilename(name);
    }

    if (folderId !== undefined) {
      if (folderId) {
        const folderPerm = await getUserFolderPermission(user.id, user.email, folderId, db);
        if (!folderPerm.canWrite) {
          throw new ForbiddenError('No write permission for target folder');
        }
      }
      updates.folder_id = folderId;
    }

    if (isTrash !== undefined) {
      updates.is_deleted = isTrash;
    }

    const { data: updated, error } = await db
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const ext = getExtension(updated.name);
    res.status(200).json({
      data: {
        id: updated.id,
        name: updated.name,
        extension: ext,
        folderId: updated.folder_id,
        isStarred: !!updated.is_starred,
        isTrash: !!updated.is_deleted,
        updatedAt: updated.updated_at,
      },
      message: 'File updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;

    const perm = await getUserFilePermission(user.id, user.email, id, db);
    if (!perm.canWrite) {
      throw new ForbiddenError('No write permission for this file');
    }

    await db
      .from('files')
      .update({ is_deleted: true })
      .eq('id', id);

    res.status(200).json({
      data: { id },
      message: 'File moved to trash',
    });
  } catch (err) {
    next(err);
  }
}

export async function listAllFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { data: files, error } = await db
      .from('files')
      .select('*')
      .eq('owner_id', user.id);

    if (error) throw new Error(error.message);

    res.status(200).json({
      data: (files || []).map((f: any) => {
        const ext = getExtension(f.name);
        return {
          id: f.id,
          name: f.name,
          extension: ext,
          size: f.size_bytes,
          formattedSize: formatSizeBytes(f.size_bytes),
          type: ext,
          folderId: f.folder_id,
          ownerId: f.owner_id,
          owner: 'You',
          isStarred: !!f.is_starred,
          isTrash: !!f.is_deleted,
          createdAt: f.created_at,
          updatedAt: f.updated_at,
        };
      }),
      message: 'Files listed',
    });
  } catch (err) {
    next(err);
  }
}

