"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.starSchema = void 0;
exports.starResource = starResource;
exports.unstarResource = unstarResource;
exports.getStarred = getStarred;
const supabase_js_1 = require("../../config/supabase.js");
const zod_1 = require("zod");
exports.starSchema = zod_1.z.object({
    resourceType: zod_1.z.enum(['file', 'folder']),
    resourceId: zod_1.z.string().uuid(),
});
async function starResource(req, res, next) {
    try {
        const user = req.user;
        const { resourceType, resourceId } = req.body;
        // Toggle star on primary entity
        const table = resourceType === 'file' ? 'files' : 'folders';
        await supabase_js_1.supabaseAdmin.from(table).update({ is_starred: true }).eq('id', resourceId);
        // Upsert star record
        await supabase_js_1.supabaseAdmin
            .from('stars')
            .upsert({ user_id: user.id, resource_type: resourceType, resource_id: resourceId });
        res.status(200).json({ data: { resourceType, resourceId, isStarred: true }, message: 'Item starred' });
    }
    catch (err) {
        next(err);
    }
}
async function unstarResource(req, res, next) {
    try {
        const user = req.user;
        const { resourceType, resourceId } = req.body;
        const table = resourceType === 'file' ? 'files' : 'folders';
        await supabase_js_1.supabaseAdmin.from(table).update({ is_starred: false }).eq('id', resourceId);
        await supabase_js_1.supabaseAdmin
            .from('stars')
            .delete()
            .eq('user_id', user.id)
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId);
        res.status(200).json({ data: { resourceType, resourceId, isStarred: false }, message: 'Item unstarred' });
    }
    catch (err) {
        next(err);
    }
}
async function getStarred(req, res, next) {
    try {
        const user = req.user;
        const { data: files } = await supabase_js_1.supabaseAdmin
            .from('files')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_starred', true)
            .eq('is_trash', false);
        const { data: folders } = await supabase_js_1.supabaseAdmin
            .from('folders')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_starred', true)
            .eq('is_trash', false);
        res.status(200).json({
            data: {
                files: (files || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    extension: f.extension,
                    size: f.size_bytes,
                    formattedSize: f.formatted_size,
                    folderId: f.folder_id,
                    isStarred: true,
                    updatedAt: f.updated_at,
                })),
                folders: (folders || []).map((f) => ({
                    id: f.id,
                    name: f.name,
                    parentId: f.parent_id,
                    isStarred: true,
                    updatedAt: f.updated_at,
                })),
            },
            message: 'Starred resources listed',
        });
    }
    catch (err) {
        next(err);
    }
}
