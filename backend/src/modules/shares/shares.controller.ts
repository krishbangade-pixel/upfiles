import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors.js';
import { getUserFilePermission, getUserFolderPermission } from '../../utils/permissions.js';
import { z } from 'zod';

export const createShareSchema = z.object({
  resourceType: z.enum(['file', 'folder']),
  resourceId: z.string().uuid(),
  granteeEmail: z.string().email(),
  role: z.enum(['viewer', 'editor']).default('viewer'),
});

export async function createShare(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { resourceType, resourceId, granteeEmail, role } = req.body;

    const db = req.db || supabaseAdmin;

    // Verify ownership or editor permissions
    if (resourceType === 'file') {
      const perm = await getUserFilePermission(user.id, user.email, resourceId, db);
      if (!perm.canWrite) throw new ForbiddenError('Only owner or editor can share file');
    } else {
      const perm = await getUserFolderPermission(user.id, user.email, resourceId, db);
      if (!perm.canWrite) throw new ForbiddenError('Only owner or editor can share folder');
    }

    // Lookup grantee user ID if existing
    const { data: granteeProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', granteeEmail)
      .maybeSingle();

    // Upsert share record
    const { data: share, error } = await supabaseAdmin
      .from('shares')
      .upsert(
        {
          resource_type: resourceType,
          resource_id: resourceId,
          grantee_user_id: granteeProfile?.id || null,
          grantee_email: granteeEmail,
          role,
        },
        { onConflict: 'resource_type,resource_id,grantee_email' }
      )
      .select()
      .single();

    if (error || !share) {
      throw new Error(error?.message || 'Failed to create share record');
    }

    // Log Activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      action: 'share',
      resource_type: resourceType,
      resource_id: resourceId,
      context: { granteeEmail, role },
    });

    res.status(201).json({
      data: {
        id: share.id,
        resourceType: share.resource_type,
        resourceId: share.resource_id,
        granteeEmail: share.grantee_email,
        role: share.role,
        createdAt: share.created_at,
      },
      message: 'Resource shared successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getShares(req: Request, res: Response, next: NextFunction) {
  try {
    const { resourceType, resourceId } = req.params;
    const { data: shares, error } = await supabaseAdmin
      .from('shares')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);

    if (error) throw new Error(error.message);

    res.status(200).json({
      data: (shares || []).map((s: any) => ({
        id: s.id,
        resourceType: s.resource_type,
        resourceId: s.resource_id,
        granteeEmail: s.grantee_email,
        role: s.role,
        createdAt: s.created_at,
      })),
      message: 'Shares retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function removeShare(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { id } = req.params;

    const { data: share } = await supabaseAdmin.from('shares').select('*').eq('id', id).single();
    if (!share) throw new NotFoundError('Share record not found');

    if (share.resource_type === 'file') {
      const perm = await getUserFilePermission(user.id, user.email, share.resource_id);
      if (!perm.canWrite) throw new ForbiddenError('Access denied');
    } else {
      const perm = await getUserFolderPermission(user.id, user.email, share.resource_id);
      if (!perm.canWrite) throw new ForbiddenError('Access denied');
    }

    await supabaseAdmin.from('shares').delete().eq('id', id);

    res.status(200).json({
      data: { id },
      message: 'Share revoked successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getSharesForUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;

    const { data: shares, error } = await supabaseAdmin
      .from('shares')
      .select('*')
      .or(`grantee_user_id.eq.${user.id},grantee_email.eq.${user.email}`);

    if (error) throw new Error(error.message);

    if (!shares || shares.length === 0) {
      return res.status(200).json({ data: { files: [], folders: [] }, message: 'No shares found' });
    }

    const fileIds = shares.filter((s: any) => s.resource_type === 'file').map((s: any) => s.resource_id);
    const folderIds = shares.filter((s: any) => s.resource_type === 'folder').map((s: any) => s.resource_id);

    let sharedFiles: any[] = [];
    let sharedFolders: any[] = [];

    if (fileIds.length > 0) {
      const { data: files } = await supabaseAdmin
        .from('files')
        .select('*')
        .in('id', fileIds)
        .eq('is_trash', false);

      sharedFiles = (files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        formattedSize: f.formatted_size || `${((f.size || 0) / 1024).toFixed(1)} KB`,
        extension: f.name.split('.').pop(),
        type: f.mime_type,
        storageKey: f.id,
        isSharedWithMe: true,
        owner: 'Shared with me',
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));
    }

    if (folderIds.length > 0) {
      const { data: folders } = await supabaseAdmin
        .from('folders')
        .select('*')
        .in('id', folderIds)
        .eq('is_trash', false);

      sharedFolders = (folders || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        isSharedWithMe: true,
        owner: 'Shared with me',
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));
    }

    res.status(200).json({
      data: { files: sharedFiles, folders: sharedFolders },
      message: 'User shares retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
}

