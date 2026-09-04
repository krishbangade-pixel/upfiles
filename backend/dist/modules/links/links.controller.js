"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinkShareSchema = void 0;
exports.createLinkShare = createLinkShare;
exports.getLinkShare = getLinkShare;
exports.getLinkFile = getLinkFile;
exports.deleteLinkShare = deleteLinkShare;
const supabase_js_1 = require("../../config/supabase.js");
const errors_js_1 = require("../../utils/errors.js");
const permissions_js_1 = require("../../utils/permissions.js");
const storage_js_1 = require("../../utils/storage.js");
const filenames_js_1 = require("../../utils/filenames.js");
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
                publicUrl: `${req.protocol}://${req.get('host')}/share/${linkShare.token}`,
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
        const db = req.db || supabase_js_1.supabaseAnon;
        const { data: link, error } = await db
            .from('link_shares')
            .select('*')
            .eq('token', token)
            .maybeSingle();
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
            const { data: file } = await db.from('files').select('*').eq('id', link.resource_id).maybeSingle();
            if (!file || file.is_deleted)
                throw new errors_js_1.NotFoundError('Shared file unavailable');
            const key = file.storage_key || file.storage_path;
            const { url } = await (0, storage_js_1.createSignedDownloadUrl)(key, 3600, db);
            return res.status(200).json({
                data: {
                    resourceType: 'file',
                    file: {
                        id: file.id,
                        name: file.name,
                        size: file.size_bytes,
                        formattedSize: (0, filenames_js_1.formatSizeBytes)(file.size_bytes),
                        mimeType: file.mime_type,
                        downloadUrl: url,
                        createdAt: file.created_at,
                        updatedAt: file.updated_at,
                    },
                },
                message: 'Link resource retrieved',
            });
        }
        else {
            const { data: folder } = await db.from('folders').select('*').eq('id', link.resource_id).maybeSingle();
            if (!folder || folder.is_deleted)
                throw new errors_js_1.NotFoundError('Shared folder unavailable');
            const { data: childFiles } = await db.from('files').select('*').eq('folder_id', folder.id).eq('is_deleted', false);
            const { data: childFolders } = await db.from('folders').select('*').eq('parent_id', folder.id).eq('is_deleted', false);
            return res.status(200).json({
                data: {
                    resourceType: 'folder',
                    folder: {
                        id: folder.id,
                        name: folder.name,
                        createdAt: folder.created_at,
                        updatedAt: folder.updated_at,
                    },
                    items: [
                        ...(childFolders || []).map((f) => ({ id: f.id, name: f.name, type: 'folder', isFolder: true })),
                        ...(childFiles || []).map((f) => ({
                            id: f.id,
                            name: f.name,
                            size: f.size_bytes,
                            mimeType: f.mime_type,
                            type: 'file',
                            isFolder: false,
                        })),
                    ],
                },
                message: 'Link resource retrieved',
            });
        }
    }
    catch (err) {
        next(err);
    }
}
async function getLinkFile(req, res, next) {
    try {
        const { token, fileId } = req.params;
        const providedPassword = req.headers['x-link-password'];
        const db = req.db || supabase_js_1.supabaseAnon;
        const { data: link } = await db.from('link_shares').select('*').eq('token', token).maybeSingle();
        if (!link)
            throw new errors_js_1.NotFoundError('Shared link not found');
        if (link.expires_at && new Date(link.expires_at) < new Date()) {
            throw new errors_js_1.ForbiddenError('This link has expired');
        }
        if (link.password_hash) {
            if (!providedPassword)
                return res.status(401).json({ error: { code: 'PASSWORD_REQUIRED' } });
            const match = await bcryptjs_1.default.compare(providedPassword, link.password_hash);
            if (!match)
                throw new errors_js_1.ForbiddenError('Incorrect link password');
        }
        const { data: file } = await db.from('files').select('*').eq('id', fileId).maybeSingle();
        if (!file || file.is_deleted)
            throw new errors_js_1.NotFoundError('File not found');
        const key = file.storage_key || file.storage_path;
        const { url } = await (0, storage_js_1.createSignedDownloadUrl)(key, 3600, db);
        res.status(200).json({
            data: {
                id: file.id,
                name: file.name,
                size: file.size_bytes,
                formattedSize: (0, filenames_js_1.formatSizeBytes)(file.size_bytes),
                mimeType: file.mime_type,
                downloadUrl: url,
            },
            message: 'File retrieved',
        });
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
