"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShareSchema = void 0;
exports.createShare = createShare;
exports.getShares = getShares;
exports.removeShare = removeShare;
const supabase_js_1 = require("../../config/supabase.js");
const errors_js_1 = require("../../utils/errors.js");
const permissions_js_1 = require("../../utils/permissions.js");
const zod_1 = require("zod");
exports.createShareSchema = zod_1.z.object({
    resourceType: zod_1.z.enum(['file', 'folder']),
    resourceId: zod_1.z.string().uuid(),
    granteeEmail: zod_1.z.string().email(),
    role: zod_1.z.enum(['viewer', 'editor']).default('viewer'),
});
async function createShare(req, res, next) {
    try {
        const user = req.user;
        const { resourceType, resourceId, granteeEmail, role } = req.body;
        const db = req.db || supabase_js_1.supabaseAdmin;
        // Verify ownership or editor permissions
        if (resourceType === 'file') {
            const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, resourceId, db);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Only owner or editor can share file');
        }
        else {
            const perm = await (0, permissions_js_1.getUserFolderPermission)(user.id, user.email, resourceId, db);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Only owner or editor can share folder');
        }
        // Lookup grantee user ID if existing
        const { data: granteeProfile } = await supabase_js_1.supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', granteeEmail)
            .maybeSingle();
        // Upsert share record
        const { data: share, error } = await supabase_js_1.supabaseAdmin
            .from('shares')
            .upsert({
            resource_type: resourceType,
            resource_id: resourceId,
            grantee_user_id: granteeProfile?.id || null,
            grantee_email: granteeEmail,
            role,
        }, { onConflict: 'resource_type,resource_id,grantee_email' })
            .select()
            .single();
        if (error || !share) {
            throw new Error(error?.message || 'Failed to create share record');
        }
        // Log Activity
        await supabase_js_1.supabaseAdmin.from('activities').insert({
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
    }
    catch (err) {
        next(err);
    }
}
async function getShares(req, res, next) {
    try {
        const { resourceType, resourceId } = req.params;
        const { data: shares, error } = await supabase_js_1.supabaseAdmin
            .from('shares')
            .select('*')
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId);
        if (error)
            throw new Error(error.message);
        res.status(200).json({
            data: (shares || []).map((s) => ({
                id: s.id,
                resourceType: s.resource_type,
                resourceId: s.resource_id,
                granteeEmail: s.grantee_email,
                role: s.role,
                createdAt: s.created_at,
            })),
            message: 'Shares retrieved',
        });
    }
    catch (err) {
        next(err);
    }
}
async function removeShare(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { data: share } = await supabase_js_1.supabaseAdmin.from('shares').select('*').eq('id', id).single();
        if (!share)
            throw new errors_js_1.NotFoundError('Share record not found');
        if (share.resource_type === 'file') {
            const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, share.resource_id);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Access denied');
        }
        else {
            const perm = await (0, permissions_js_1.getUserFolderPermission)(user.id, user.email, share.resource_id);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Access denied');
        }
        await supabase_js_1.supabaseAdmin.from('shares').delete().eq('id', id);
        res.status(200).json({
            data: { id },
            message: 'Share revoked successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
