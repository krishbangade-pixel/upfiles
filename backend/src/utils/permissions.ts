import { supabaseAdmin } from '../config/supabase.js';

export type ResourceRole = 'owner' | 'editor' | 'viewer';

export async function getUserFilePermission(
  userId: string,
  userEmail: string,
  fileId: string,
  client?: any
): Promise<{ canRead: boolean; canWrite: boolean; role: ResourceRole | null; file: any }> {
  const db = client || supabaseAdmin;
  const { data: file, error } = await db
    .from('files')
    .select('*')
    .eq('id', fileId)
    .maybeSingle();

  if (error || !file) {
    return { canRead: false, canWrite: false, role: null, file: null };
  }

  if (file.owner_id === userId) {
    return { canRead: true, canWrite: true, role: 'owner', file };
  }

  const { data: directShare } = await db
    .from('shares')
    .select('role')
    .eq('resource_type', 'file')
    .eq('resource_id', fileId)
    .or(`grantee_user_id.eq.${userId},grantee_email.eq.${userEmail}`)
    .maybeSingle();

  if (directShare) {
    const isEditor = directShare.role === 'editor';
    return { canRead: true, canWrite: isEditor, role: directShare.role as ResourceRole, file };
  }

  if (file.folder_id) {
    const parentPerm = await getUserFolderPermission(userId, userEmail, file.folder_id, db);
    if (parentPerm.canRead) {
      return { canRead: true, canWrite: parentPerm.canWrite, role: parentPerm.role, file };
    }
  }

  return { canRead: false, canWrite: false, role: null, file };
}

export async function getUserFolderPermission(
  userId: string,
  userEmail: string,
  folderId: string,
  client?: any
): Promise<{ canRead: boolean; canWrite: boolean; role: ResourceRole | null; folder: any }> {
  const db = client || supabaseAdmin;
  const { data: folder, error } = await db
    .from('folders')
    .select('*')
    .eq('id', folderId)
    .maybeSingle();

  if (error || !folder) {
    return { canRead: false, canWrite: false, role: null, folder: null };
  }

  if (folder.owner_id === userId) {
    return { canRead: true, canWrite: true, role: 'owner', folder };
  }

  let currFolderId: string | null = folderId;
  let highestRole: ResourceRole | null = null;

  while (currFolderId) {
    const targetId: string = currFolderId;
    const { data: parentFolder }: { data: { id: string; parent_id: string | null; owner_id: string } | null } = await db
      .from('folders')
      .select('id, parent_id, owner_id')
      .eq('id', targetId)
      .maybeSingle();

    if (!parentFolder) break;

    if (parentFolder.owner_id === userId) {
      return { canRead: true, canWrite: true, role: 'owner', folder };
    }

    const { data: share } = await db
      .from('shares')
      .select('role')
      .eq('resource_type', 'folder')
      .eq('resource_id', targetId)
      .or(`grantee_user_id.eq.${userId},grantee_email.eq.${userEmail}`)
      .maybeSingle();

    if (share) {
      if (share.role === 'editor') {
        return { canRead: true, canWrite: true, role: 'editor', folder };
      }
      if (share.role === 'viewer' && !highestRole) {
        highestRole = 'viewer';
      }
    }

    currFolderId = parentFolder.parent_id;
  }

  if (highestRole) {
    const canWrite = (highestRole as ResourceRole) === 'editor';
    return { canRead: true, canWrite, role: highestRole, folder };
  }

  return { canRead: false, canWrite: false, role: null, folder };
}

