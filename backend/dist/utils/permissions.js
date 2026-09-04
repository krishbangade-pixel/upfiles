"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFilePermission = getUserFilePermission;
exports.getUserFolderPermission = getUserFolderPermission;
const supabase_js_1 = require("../config/supabase.js");
async function getUserFilePermission(userId, userEmail, fileId, client) {
    const db = client || supabase_js_1.supabaseAdmin;
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
        return { canRead: true, canWrite: isEditor, role: directShare.role, file };
    }
    if (file.folder_id) {
        const parentPerm = await getUserFolderPermission(userId, userEmail, file.folder_id, db);
        if (parentPerm.canRead) {
            return { canRead: true, canWrite: parentPerm.canWrite, role: parentPerm.role, file };
        }
    }
    return { canRead: false, canWrite: false, role: null, file };
}
async function getUserFolderPermission(userId, userEmail, folderId, client) {
    const db = client || supabase_js_1.supabaseAdmin;
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
    let currFolderId = folderId;
    let highestRole = null;
    while (currFolderId) {
        const targetId = currFolderId;
        const { data: parentFolder } = await db
            .from('folders')
            .select('id, parent_id, owner_id')
            .eq('id', targetId)
            .maybeSingle();
        if (!parentFolder)
            break;
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
        const canWrite = highestRole === 'editor';
        return { canRead: true, canWrite, role: highestRole, folder };
    }
    return { canRead: false, canWrite: false, role: null, folder };
}
