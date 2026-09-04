import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { ForbiddenError, NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { getUserFolderPermission } from '../../utils/permissions.js';
import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').trim(),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).trim().optional(),
  parentId: z.string().uuid().nullable().optional(),
  isStarred: z.boolean().optional(),
  isTrash: z.boolean().optional(),
});

export async function createFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { name, parentId } = req.body;
    const targetParentId = parentId || null;

    if (targetParentId) {
      const perm = await getUserFolderPermission(user.id, user.email, targetParentId);
      if (!perm.canWrite) {
        throw new ForbiddenError('No write permission for target parent folder');
      }
    }

    let dupQuery = db
      .from('folders')
      .select('id')
      .eq('owner_id', user.id)
      .eq('name', name)
      .eq('is_deleted', false);

    if (targetParentId) {
      dupQuery = dupQuery.eq('parent_id', targetParentId);
    } else {
      dupQuery = dupQuery.is('parent_id', null);
    }

    const { data: existing } = await dupQuery.maybeSingle();
    if (existing) {
      throw new ConflictError(`A folder named "${name}" already exists in this directory.`);
    }

    const { data: created, error } = await db
      .from('folders')
      .insert({
        name,
        parent_id: targetParentId,
        owner_id: user.id,
        is_deleted: false,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(error?.message || 'Failed to create folder');
    }

    try {
      await db.from('activities').insert({
        user_id: user.id,
        action: 'create_folder',
        resource_type: 'folder',
        resource_id: created.id,
        context: { name: created.name, parentId: targetParentId },
      });
    } catch (e) {}

    res.status(201).json({
      data: {
        id: created.id,
        name: created.name,
        parentId: created.parent_id,
        ownerId: created.owner_id,
        isStarred: !!created.is_starred,
        isTrash: !!created.is_deleted,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      },
      message: 'Folder created successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { id } = req.params;

    const perm = await getUserFolderPermission(user.id, user.email, id);
    if (!perm.canRead) {
      throw new ForbiddenError('Access denied');
    }

    res.status(200).json({
      data: {
        id: perm.folder.id,
        name: perm.folder.name,
        parentId: perm.folder.parent_id,
        ownerId: perm.folder.owner_id,
        isStarred: !!perm.folder.is_starred,
        isTrash: !!perm.folder.is_deleted,
        createdAt: perm.folder.created_at,
        updatedAt: perm.folder.updated_at,
        permission: perm.role,
      },
      message: 'Folder metadata retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function getFolderChildren(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;
    const parentId = id === 'root' ? null : id;

    if (parentId) {
      const perm = await getUserFolderPermission(user.id, user.email, parentId);
      if (!perm.canRead) {
        throw new ForbiddenError('Access denied');
      }
    }

    let query = db
      .from('folders')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_deleted', false);

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data: children, error } = await query;
    if (error) throw new Error(error.message);

    res.status(200).json({
      data: (children || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        ownerId: f.owner_id,
        isStarred: !!f.is_starred,
        isTrash: !!f.is_deleted,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
      message: 'Folder children retrieved',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;
    const { name, parentId, isTrash } = req.body;

    const perm = await getUserFolderPermission(user.id, user.email, id);
    if (!perm.canWrite) {
      throw new ForbiddenError('No write permission for this folder');
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (name !== undefined && name !== perm.folder.name) {
      const targetParent = parentId !== undefined ? parentId : perm.folder.parent_id;
      let dupQuery = db
        .from('folders')
        .select('id')
        .eq('owner_id', user.id)
        .eq('name', name)
        .eq('is_deleted', false)
        .neq('id', id);

      if (targetParent) dupQuery = dupQuery.eq('parent_id', targetParent);
      else dupQuery = dupQuery.is('parent_id', null);

      const { data: dup } = await dupQuery.maybeSingle();
      if (dup) {
        throw new ConflictError(`Folder named "${name}" already exists in target directory.`);
      }
      updates.name = name;
    }

    if (parentId !== undefined && parentId !== perm.folder.parent_id) {
      if (parentId) {
        if (id === parentId) {
          throw new ValidationError('Cannot move folder into itself');
        }

        let currId: string | null = parentId;
        while (currId) {
          if (currId === id) {
            throw new ValidationError('Cannot move folder into one of its descendants');
          }
          const { data: parentF } = await db.from('folders').select('parent_id').eq('id', currId).single();
          currId = parentF?.parent_id || null;
        }

        const targetPerm = await getUserFolderPermission(user.id, user.email, parentId);
        if (!targetPerm.canWrite) {
          throw new ForbiddenError('No write permission for target directory');
        }
      }
      updates.parent_id = parentId;
    }

    if (isTrash !== undefined) {
      updates.is_deleted = isTrash;
    }

    const { data: updated, error } = await db
      .from('folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    try {
      const action = name ? 'rename' : parentId !== undefined ? 'move' : isTrash ? 'delete' : 'update';
      await db.from('activities').insert({
        user_id: user.id,
        action,
        resource_type: 'folder',
        resource_id: id,
        context: { oldName: perm.folder.name, newName: updated.name, parentId: updated.parent_id },
      });
    } catch (e) {}

    res.status(200).json({
      data: {
        id: updated.id,
        name: updated.name,
        parentId: updated.parent_id,
        isStarred: !!updated.is_starred,
        isTrash: !!updated.is_deleted,
        updatedAt: updated.updated_at,
      },
      message: 'Folder updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { id } = req.params;

    const perm = await getUserFolderPermission(user.id, user.email, id);
    if (!perm.canWrite) {
      throw new ForbiddenError('No write permission for this folder');
    }

    await db
      .from('folders')
      .update({ is_deleted: true })
      .eq('id', id);

    res.status(200).json({
      data: { id },
      message: 'Folder moved to trash',
    });
  } catch (err) {
    next(err);
  }
}

export async function listAllFolders(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const db = req.db || supabaseAdmin;
    const { data: folders, error } = await db
      .from('folders')
      .select('*')
      .eq('owner_id', user.id);

    if (error) throw new Error(error.message);

    res.status(200).json({
      data: (folders || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        ownerId: f.owner_id,
        isStarred: !!f.is_starred,
        isTrash: !!f.is_deleted,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
      message: 'Folders listed',
    });
  } catch (err) {
    next(err);
  }
}

