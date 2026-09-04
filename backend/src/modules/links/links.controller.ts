import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { getUserFilePermission, getUserFolderPermission } from '../../utils/permissions.js';
import { createSignedDownloadUrl } from '../../utils/storage.js';
import { formatSizeBytes } from '../../utils/filenames.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const createLinkShareSchema = z.object({
  resourceType: z.enum(['file', 'folder']),
  resourceId: z.string().uuid(),
  role: z.enum(['viewer', 'editor']).default('viewer'),
  password: z.string().optional(),
  expiresInDays: z.number().optional(),
});

export async function createLinkShare(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { resourceType, resourceId, role, password, expiresInDays } = req.body;

    const db = req.db || supabaseAdmin;

    if (resourceType === 'file') {
      const perm = await getUserFilePermission(user.id, user.email, resourceId, db);
      if (!perm.canWrite) throw new ForbiddenError('Access denied');
    } else {
      const perm = await getUserFolderPermission(user.id, user.email, resourceId, db);
      if (!perm.canWrite) throw new ForbiddenError('Access denied');
    }

    // Cryptographically random 32-char token
    const token = crypto.randomBytes(16).toString('hex');
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    let expiresAt: string | null = null;
    if (expiresInDays) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expiresInDays);
      expiresAt = expDate.toISOString();
    }

    const { data: linkShare, error } = await db
      .from('link_shares')
      .insert({
        resource_type: resourceType,
        resource_id: resourceId,
        token,
        role,
        password_hash: passwordHash,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !linkShare) throw new Error(error?.message || 'Failed to create link share');

    res.status(201).json({
      data: {
        id: linkShare.id,
        token: linkShare.token,
        publicUrl: `${req.protocol}://${req.get('host')}/share/${linkShare.token}`,
        hasPassword: !!passwordHash,
        expiresAt: linkShare.expires_at,
      },
      message: 'Public link created',
    });
  } catch (err) {
    next(err);
  }
}

export async function getLinkShare(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const providedPassword = req.headers['x-link-password'] as string | undefined;
    const db = req.db || supabaseAnon;

    const { data: link, error } = await db
      .from('link_shares')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !link) throw new NotFoundError('Shared link not found or invalid');

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      throw new ForbiddenError('This link has expired');
    }

    // Check password if required
    if (link.password_hash) {
      if (!providedPassword) {
        return res.status(401).json({
          error: {
            code: 'PASSWORD_REQUIRED',
            message: 'Password required to access this link',
          },
        });
      }
      const match = await bcrypt.compare(providedPassword, link.password_hash);
      if (!match) {
        throw new ForbiddenError('Incorrect link password');
      }
    }

    // Resolve resource metadata & download url if file
    if (link.resource_type === 'file') {
      const { data: file } = await db.from('files').select('*').eq('id', link.resource_id).maybeSingle();
      if (!file || file.is_deleted) throw new NotFoundError('Shared file unavailable');

      const key = file.storage_key || file.storage_path;
      const { url } = await createSignedDownloadUrl(key, 3600, db);

      return res.status(200).json({
        data: {
          resourceType: 'file',
          file: {
            id: file.id,
            name: file.name,
            size: file.size_bytes,
            formattedSize: formatSizeBytes(file.size_bytes),
            mimeType: file.mime_type,
            downloadUrl: url,
            createdAt: file.created_at,
            updatedAt: file.updated_at,
          },
        },
        message: 'Link resource retrieved',
      });
    } else {
      const { data: folder } = await db.from('folders').select('*').eq('id', link.resource_id).maybeSingle();
      if (!folder || folder.is_deleted) throw new NotFoundError('Shared folder unavailable');

      const { data: childFiles } = await db.from('files').select('*').eq('folder_id', folder.id).eq('is_deleted', false);
      const { data: childFolders } = await db.from('folders').select('*').eq('parent_id', folder.id).eq('is_deleted', false);

      return res.status(200).json({
        data: {
          resourceType: 'folder',
          folder: {
            id: folder.id,
            name: folder.name,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at,
          },
          items: [
            ...(childFolders || []).map((f: any) => ({ id: f.id, name: f.name, type: 'folder', isFolder: true })),
            ...(childFiles || []).map((f: any) => ({
              id: f.id,
              name: f.name,
              size: f.size_bytes,
              mimeType: f.mime_type,
              type: 'file',
              isFolder: false,
            })),
          ],
        },
        message: 'Link resource retrieved',
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function getLinkFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, fileId } = req.params;
    const providedPassword = req.headers['x-link-password'] as string | undefined;
    const db = req.db || supabaseAnon;

    const { data: link } = await db.from('link_shares').select('*').eq('token', token).maybeSingle();
    if (!link) throw new NotFoundError('Shared link not found');

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      throw new ForbiddenError('This link has expired');
    }

    if (link.password_hash) {
      if (!providedPassword) return res.status(401).json({ error: { code: 'PASSWORD_REQUIRED' } });
      const match = await bcrypt.compare(providedPassword, link.password_hash);
      if (!match) throw new ForbiddenError('Incorrect link password');
    }

    const { data: file } = await db.from('files').select('*').eq('id', fileId).maybeSingle();
    if (!file || file.is_deleted) throw new NotFoundError('File not found');

    const key = file.storage_key || file.storage_path;
    const { url } = await createSignedDownloadUrl(key, 3600, db);

    res.status(200).json({
      data: {
        id: file.id,
        name: file.name,
        size: file.size_bytes,
        formattedSize: formatSizeBytes(file.size_bytes),
        mimeType: file.mime_type,
        downloadUrl: url,
      },
      message: 'File retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteLinkShare(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await supabaseAdmin.from('link_shares').delete().eq('id', id);
    res.status(200).json({ data: { id }, message: 'Public link deleted' });
  } catch (err) {
    next(err);
  }
}
