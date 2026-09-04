"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinkShareSchema = void 0;
exports.createLinkShare = createLinkShare;
exports.getLinkShare = getLinkShare;
exports.deleteLinkShare = deleteLinkShare;
const supabase_js_1 = require("../../config/supabase.js");
const errors_js_1 = require("../../utils/errors.js");
const permissions_js_1 = require("../../utils/permissions.js");
const storage_js_1 = require("../../utils/storage.js");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
exports.createLinkShareSchema = zod_1.z.object({
    resourceType: zod_1.z.enum(['file', 'folder']),
    resourceId: zod_1.z.string().uuid(),
    role: zod_1.z.enum(['viewer', 'editor']).default('viewer'),
    password: zod_1.z.string().optional(),
    expiresInDays: zod_1.z.number().optional(),
});
async function createLinkShare(req, res, next) {
    try {
        const user = req.user;
        const { resourceType, resourceId, role, password, expiresInDays } = req.body;
        const db = req.db || supabase_js_1.supabaseAdmin;
        if (resourceType === 'file') {
            const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, resourceId, db);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Access denied');
        }
        else {
            const perm = await (0, permissions_js_1.getUserFolderPermission)(user.id, user.email, resourceId, db);
            if (!perm.canWrite)
                throw new errors_js_1.ForbiddenError('Access denied');
        }
        // Cryptographically random 32-char token
        const token = crypto_1.default.randomBytes(16).toString('hex');
        let passwordHash = null;
        if (password) {
            passwordHash = await bcryptjs_1.default.hash(password, 10);
        }
        let expiresAt = null;
        if (expiresInDays) {
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + expiresInDays);
            expiresAt = expDate.toISOString();
        }
        const { data: linkShare, error } = await db
            .from('link_shares')
            .insert({
            resource_type: resourceType,
            resource_id: resourceId,
            token,
            role,
            password_hash: passwordHash,
            expires_at: expiresAt,
            created_by: user.id,
        })
            .select()
            .single();
        if (error || !linkShare)
            throw new Error(error?.message || 'Failed to create link share');
        res.status(201).json({
            data: {
                id: linkShare.id,
                token: linkShare.token,
                publicUrl: `${req.protocol}://${req.get('host')}/api/link/${linkShare.token}`,
                hasPassword: !!passwordHash,
                expiresAt: linkShare.expires_at,
            },
            message: 'Public link created',
        });
    }
    catch (err) {
        next(err);
    }
}
async function getLinkShare(req, res, next) {
    try {
        const { token } = req.params;
        const providedPassword = req.headers['x-link-password'];
        const { data: link, error } = await supabase_js_1.supabaseAdmin
            .from('link_shares')
            .select('*')
            .eq('token', token)
            .single();
        if (error || !link)
            throw new errors_js_1.NotFoundError('Shared link not found or invalid');
        // Check expiration
        if (link.expires_at && new Date(link.expires_at) < new Date()) {
            throw new errors_js_1.ForbiddenError('This link has expired');
        }
        // Check password if required
        if (link.password_hash) {
            if (!providedPassword) {
                return res.status(401).json({
                    error: {
                        code: 'PASSWORD_REQUIRED',
                        message: 'Password required to access this link',
                    },
                });
            }
            const match = await bcryptjs_1.default.compare(providedPassword, link.password_hash);
            if (!match) {
                throw new errors_js_1.ForbiddenError('Incorrect link password');
            }
        }
        // Resolve resource metadata & download url if file
        if (link.resource_type === 'file') {
            const { data: file } = await supabase_js_1.supabaseAdmin.from('files').select('*').eq('id', link.resource_id).single();
            if (!file || file.is_trash)
                throw new errors_js_1.NotFoundError('Shared file unavailable');
            const key = file.storage_key || file.storage_path;
            const { url } = await (0, storage_js_1.createSignedDownloadUrl)(key, 300);
            return res.status(200).json({
                data: {
                    resourceType: 'file',
                    file: {
                        id: file.id,
                        name: file.name,
                        size: file.size_bytes,
                        formattedSize: file.formatted_size,
                        mimeType: file.mime_type,
                        downloadUrl: url,
                    },
                },
                message: 'Link resource retrieved',
            });
        }
        else {
            const { data: folder } = await supabase_js_1.supabaseAdmin.from('folders').select('*').eq('id', link.resource_id).single();
            if (!folder || folder.is_trash)
                throw new errors_js_1.NotFoundError('Shared folder unavailable');
            return res.status(200).json({
                data: {
                    resourceType: 'folder',
                    folder: {
                        id: folder.id,
                        name: folder.name,
                    },
                },
                message: 'Link resource retrieved',
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function deleteLinkShare(req, res, next) {
    try {
        const { id } = req.params;
        await supabase_js_1.supabaseAdmin.from('link_shares').delete().eq('id', id);
        res.status(200).json({ data: { id }, message: 'Public link deleted' });
    }
    catch (err) {
        next(err);
    }
}
