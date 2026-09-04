import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { env } from '../../config/env.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { z } from 'zod';

export const restoreSchema = z.object({
  resourceType: z.enum(['file', 'folder']),
  resourceId: z.string().uuid(),
});

export async function getTrash(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;

    const { data: files } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('owner_id', user.id)
      .or('is_trash.eq.true,is_deleted.eq.true');

    const { data: folders } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('owner_id', user.id)
      .or('is_trash.eq.true,is_deleted.eq.true');

    res.status(200).json({
      data: {
        files: (files || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          extension: f.extension,
          size: f.size_bytes,
          formattedSize: f.formatted_size,
          deletedAt: f.deleted_at,
          isTrash: true,
        })),
        folders: (folders || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          deletedAt: f.deleted_at,
          isTrash: true,
        })),
      },
      message: 'Trash items retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function restoreItem(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { resourceType, resourceId } = req.body;

    if (resourceType === 'file') {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', resourceId).single();
      if (!file || file.owner_id !== user.id) throw new ForbiddenError('Access denied');

      // Check parent folder valid status
      let targetFolderId = file.folder_id;
      if (targetFolderId) {
        const { data: parentF } = await supabaseAdmin.from('folders').select('is_trash, is_deleted').eq('id', targetFolderId).maybeSingle();
        if (!parentF || parentF.is_trash || parentF.is_deleted) {
          // Fall back to root directory if parent was deleted
          targetFolderId = null;
        }
      }

      await supabaseAdmin
        .from('files')
        .update({ is_trash: false, is_deleted: false, deleted_at: null, folder_id: targetFolderId })
        .eq('id', resourceId);
    } else {
      const { data: folder } = await supabaseAdmin.from('folders').select('*').eq('id', resourceId).single();
      if (!folder || folder.owner_id !== user.id) throw new ForbiddenError('Access denied');

      let targetParentId = folder.parent_id;
      if (targetParentId) {
        const { data: parentF } = await supabaseAdmin.from('folders').select('is_trash, is_deleted').eq('id', targetParentId).maybeSingle();
        if (!parentF || parentF.is_trash || parentF.is_deleted) {
          targetParentId = null;
        }
      }

      await supabaseAdmin
        .from('folders')
        .update({ is_trash: false, is_deleted: false, deleted_at: null, parent_id: targetParentId })
        .eq('id', resourceId);
    }

    // Log Activity
    await supabaseAdmin.from('activities').insert({
      user_id: user.id,
      action: 'restore',
      resource_type: resourceType,
      resource_id: resourceId,
    });

    res.status(200).json({
      data: { resourceType, resourceId },
      message: 'Resource restored successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePermanently(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { id } = req.params;
    const resourceType = (req.query.type as string) || 'file';

    if (resourceType === 'file') {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', id).single();
      if (!file || file.owner_id !== user.id) throw new ForbiddenError('Access denied');

      // Remove from storage bucket if present
      if (file.storage_path && file.storage_path !== 'pending') {
        await supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([file.storage_path]);
      }

      await supabaseAdmin.from('files').delete().eq('id', id);
    } else {
      const { data: folder } = await supabaseAdmin.from('folders').select('*').eq('id', id).single();
      if (!folder || folder.owner_id !== user.id) throw new ForbiddenError('Access denied');

      await supabaseAdmin.from('folders').delete().eq('id', id);
    }

    res.status(200).json({
      data: { id, resourceType },
      message: 'Permanently deleted',
    });
  } catch (err) {
    next(err);
  }
}
