import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { z } from 'zod';

export const starSchema = z.object({
  resourceType: z.enum(['file', 'folder']),
  resourceId: z.string().uuid(),
});

export async function starResource(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { resourceType, resourceId } = req.body;

    // Toggle star on primary entity
    const table = resourceType === 'file' ? 'files' : 'folders';
    await supabaseAdmin.from(table).update({ is_starred: true }).eq('id', resourceId);

    // Upsert star record
    await supabaseAdmin
      .from('stars')
      .upsert({ user_id: user.id, resource_type: resourceType, resource_id: resourceId });

    res.status(200).json({ data: { resourceType, resourceId, isStarred: true }, message: 'Item starred' });
  } catch (err) {
    next(err);
  }
}

export async function unstarResource(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { resourceType, resourceId } = req.body;

    const table = resourceType === 'file' ? 'files' : 'folders';
    await supabaseAdmin.from(table).update({ is_starred: false }).eq('id', resourceId);

    await supabaseAdmin
      .from('stars')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);

    res.status(200).json({ data: { resourceType, resourceId, isStarred: false }, message: 'Item unstarred' });
  } catch (err) {
    next(err);
  }
}

export async function getStarred(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;

    const { data: files } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_starred', true)
      .eq('is_trash', false);

    const { data: folders } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_starred', true)
      .eq('is_trash', false);

    res.status(200).json({
      data: {
        files: (files || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          extension: f.extension,
          size: f.size_bytes,
          formattedSize: f.formatted_size,
          folderId: f.folder_id,
          isStarred: true,
          updatedAt: f.updated_at,
        })),
        folders: (folders || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id,
          isStarred: true,
          updatedAt: f.updated_at,
        })),
      },
      message: 'Starred resources listed',
    });
  } catch (err) {
    next(err);
  }
}
