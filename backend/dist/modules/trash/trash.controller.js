"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreSchema = void 0;
exports.getTrash = getTrash;
exports.restoreItem = restoreItem;
exports.deletePermanently = deletePermanently;
const supabase_js_1 = require("../../config/supabase.js");
const env_js_1 = require("../../config/env.js");
const errors_js_1 = require("../../utils/errors.js");
const zod_1 = require("zod");
exports.restoreSchema = zod_1.z.object({
    resourceType: zod_1.z.enum(['file', 'folder']),
    resourceId: zod_1.z.string().uuid(),
});
async function getTrash(req, res, next) {
    try {
        const user = req.user;
        const { data: files } = await supabase_js_1.supabaseAdmin
            .from('files')
            .select('*')
            .eq('owner_id', user.id)
            .or('is_trash.eq.true,is_deleted.eq.true');
        const { data: folders } = await supabase_js_1.supabaseAdmin
            .from('folders')
            .select('*')
            .eq('owner_id', user.id)
            .or('is_trash.eq.true,is_deleted.eq.true');
        res.status(200).json({
            data: {
                files: (files || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    extension: f.extension,
                    size: f.size_bytes,
                    formattedSize: f.formatted_size,
                    deletedAt: f.deleted_at,
                    isTrash: true,
                })),
                folders: (folders || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    deletedAt: f.deleted_at,
                    isTrash: true,
                })),
            },
            message: 'Trash items retrieved',
        });
    }
    catch (err) {
        next(err);
    }
}
async function restoreItem(req, res, next) {
    try {
        const user = req.user;
        const { resourceType, resourceId } = req.body;
        if (resourceType === 'file') {
            const { data: file } = await supabase_js_1.supabaseAdmin.from('files').select('*').eq('id', resourceId).single();
            if (!file || file.owner_id !== user.id)
                throw new errors_js_1.ForbiddenError('Access denied');
            // Check parent folder valid status
            let targetFolderId = file.folder_id;
            if (targetFolderId) {
                const { data: parentF } = await supabase_js_1.supabaseAdmin.from('folders').select('is_trash, is_deleted').eq('id', targetFolderId).maybeSingle();
                if (!parentF || parentF.is_trash || parentF.is_deleted) {
                    // Fall back to root directory if parent was deleted
                    targetFolderId = null;
                }
            }
            await supabase_js_1.supabaseAdmin
                .from('files')
                .update({ is_trash: false, is_deleted: false, deleted_at: null, folder_id: targetFolderId })
                .eq('id', resourceId);
        }
        else {
            const { data: folder } = await supabase_js_1.supabaseAdmin.from('folders').select('*').eq('id', resourceId).single();
            if (!folder || folder.owner_id !== user.id)
                throw new errors_js_1.ForbiddenError('Access denied');
            let targetParentId = folder.parent_id;
            if (targetParentId) {
                const { data: parentF } = await supabase_js_1.supabaseAdmin.from('folders').select('is_trash, is_deleted').eq('id', targetParentId).maybeSingle();
                if (!parentF || parentF.is_trash || parentF.is_deleted) {
                    targetParentId = null;
                }
            }
            await supabase_js_1.supabaseAdmin
                .from('folders')
                .update({ is_trash: false, is_deleted: false, deleted_at: null, parent_id: targetParentId })
                .eq('id', resourceId);
        }
        // Log Activity
        await supabase_js_1.supabaseAdmin.from('activities').insert({
            user_id: user.id,
            action: 'restore',
            resource_type: resourceType,
            resource_id: resourceId,
        });
        res.status(200).json({
            data: { resourceType, resourceId },
            message: 'Resource restored successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function deletePermanently(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;
        const resourceType = req.query.type || 'file';
        if (resourceType === 'file') {
            const { data: file } = await supabase_js_1.supabaseAdmin.from('files').select('*').eq('id', id).single();
            if (!file || file.owner_id !== user.id)
                throw new errors_js_1.ForbiddenError('Access denied');
            // Remove from storage bucket if present
            if (file.storage_path && file.storage_path !== 'pending') {
                await supabase_js_1.supabaseAdmin.storage.from(env_js_1.env.SUPABASE_STORAGE_BUCKET).remove([file.storage_path]);
            }
            await supabase_js_1.supabaseAdmin.from('files').delete().eq('id', id);
        }
        else {
            const { data: folder } = await supabase_js_1.supabaseAdmin.from('folders').select('*').eq('id', id).single();
            if (!folder || folder.owner_id !== user.id)
                throw new errors_js_1.ForbiddenError('Access denied');
            await supabase_js_1.supabaseAdmin.from('folders').delete().eq('id', id);
        }
        res.status(200).json({
            data: { id, resourceType },
            message: 'Permanently deleted',
        });
    }
    catch (err) {
        next(err);
    }
}
