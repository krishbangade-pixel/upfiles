import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';

export async function searchResources(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const q = ((req.query.q as string) || '').trim();
    const type = req.query.type as string | undefined;
    const starredOnly = req.query.starred === 'true';

    // Search files
    let filesQuery = supabaseAdmin
      .from('files')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_trash', false);

    if (q) {
      filesQuery = filesQuery.ilike('name', `%${q}%`);
    }

    if (starredOnly) {
      filesQuery = filesQuery.eq('is_starred', true);
    }

    if (type) {
      if (type === 'image') {
        filesQuery = filesQuery.in('extension', ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']);
      } else if (type === 'pdf') {
        filesQuery = filesQuery.eq('extension', 'pdf');
      } else if (type === 'document') {
        filesQuery = filesQuery.in('extension', ['doc', 'docx', 'txt', 'pdf']);
      }
    }

    const { data: files } = await filesQuery;

    // Search folders
    let foldersQuery = supabaseAdmin
      .from('folders')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_trash', false);

    if (q) {
      foldersQuery = foldersQuery.ilike('name', `%${q}%`);
    }

    if (starredOnly) {
      foldersQuery = foldersQuery.eq('is_starred', true);
    }

    const { data: folders } = await foldersQuery;

    res.status(200).json({
      data: {
        files: (files || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          extension: f.extension,
          size: f.size_bytes,
          formattedSize: f.formatted_size,
          folderId: f.folder_id,
          isStarred: f.is_starred,
          updatedAt: f.updated_at,
        })),
        folders: (folders || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id,
          isStarred: f.is_starred,
          updatedAt: f.updated_at,
        })),
      },
      message: 'Search completed',
    });
  } catch (err) {
    next(err);
  }
}
