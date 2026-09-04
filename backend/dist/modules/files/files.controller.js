"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFileSchema = exports.completeUploadSchema = exports.initUploadSchema = void 0;
exports.initUpload = initUpload;
exports.completeUpload = completeUpload;
exports.getFile = getFile;
exports.downloadFile = downloadFile;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;
exports.listAllFiles = listAllFiles;
const supabase_js_1 = require("../../config/supabase.js");
const env_js_1 = require("../../config/env.js");
const errors_js_1 = require("../../utils/errors.js");
const permissions_js_1 = require("../../utils/permissions.js");
const storage_js_1 = require("../../utils/storage.js");
const filenames_js_1 = require("../../utils/filenames.js");
const zod_1 = require("zod");
exports.initUploadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'File name is required'),
    mimeType: zod_1.z.string().min(1, 'MIME type is required'),
    sizeBytes: zod_1.z.number().nonnegative('Size cannot be negative'),
    folderId: zod_1.z.string().uuid().nullable().optional(),
});
exports.completeUploadSchema = zod_1.z.object({
    fileId: zod_1.z.string().uuid(),
});
exports.updateFileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).trim().optional(),
    folderId: zod_1.z.string().uuid().nullable().optional(),
    isStarred: zod_1.z.boolean().optional(),
    isTrash: zod_1.z.boolean().optional(),
});
async function initUpload(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { name, mimeType, sizeBytes, folderId } = req.body;
        const targetFolderId = folderId || null;
        if (targetFolderId) {
            const perm = await (0, permissions_js_1.getUserFolderPermission)(user.id, user.email, targetFolderId, db);
            if (!perm.canWrite) {
                throw new errors_js_1.ForbiddenError('No write permission in target folder');
            }
        }
        const cleanName = (0, filenames_js_1.sanitizeFilename)(name);
        const { data: file, error } = await db
            .from('files')
            .insert({
            name: cleanName,
            size_bytes: sizeBytes,
            mime_type: mimeType,
            storage_key: 'pending',
            folder_id: targetFolderId,
            owner_id: user.id,
            status: 'uploading',
            is_deleted: false,
        })
            .select()
            .single();
        if (error || !file) {
            throw new Error(error?.message || 'Failed to initialize file record');
        }
        const storagePath = (0, storage_js_1.getFileStoragePath)(user.id, file.id);
        await db
            .from('files')
            .update({ storage_key: storagePath })
            .eq('id', file.id);
        let uploadUrl = null;
        let token = null;
        try {
            const { data: uploadUrlData } = await supabase_js_1.supabaseAdmin.storage
                .from(env_js_1.env.SUPABASE_STORAGE_BUCKET)
                .createSignedUploadUrl(storagePath);
            uploadUrl = uploadUrlData?.signedUrl || null;
            token = uploadUrlData?.token || null;
        }
        catch (e) { }
        res.status(201).json({
            data: {
                fileId: file.id,
                name: cleanName,
                storagePath,
                bucket: env_js_1.env.SUPABASE_STORAGE_BUCKET,
                uploadUrl,
                token,
            },
            message: 'Upload initialized successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function completeUpload(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { fileId } = req.body;
        const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, fileId, db);
        if (!perm.canWrite) {
            throw new errors_js_1.ForbiddenError('Access denied');
        }
        const { data: file, error } = await db
            .from('files')
            .update({
            status: 'ready',
            updated_at: new Date().toISOString(),
        })
            .eq('id', fileId)
            .select()
            .single();
        if (error || !file) {
            throw new errors_js_1.NotFoundError('File not found');
        }
        try {
            await db.from('activities').insert({
                user_id: user.id,
                action: 'upload',
                resource_type: 'file',
                resource_id: file.id,
                context: { name: file.name, size: file.size_bytes },
            });
        }
        catch (e) { }
        const ext = (0, filenames_js_1.getExtension)(file.name);
        res.status(200).json({
            data: {
                id: file.id,
                name: file.name,
                extension: ext,
                size: file.size_bytes,
                formattedSize: (0, filenames_js_1.formatSizeBytes)(file.size_bytes),
                type: ext,
                folderId: file.folder_id,
                status: file.status,
                createdAt: file.created_at,
                updatedAt: file.updated_at,
            },
            message: 'File upload completed',
        });
    }
    catch (err) {
        next(err);
    }
}
async function getFile(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { id } = req.params;
        const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, id, db);
        if (!perm.canRead) {
            throw new errors_js_1.ForbiddenError('Access denied');
        }
        const ext = (0, filenames_js_1.getExtension)(perm.file.name);
        res.status(200).json({
            data: {
                id: perm.file.id,
                name: perm.file.name,
                extension: ext,
                size: perm.file.size_bytes,
                formattedSize: (0, filenames_js_1.formatSizeBytes)(perm.file.size_bytes),
                mimeType: perm.file.mime_type,
                folderId: perm.file.folder_id,
                ownerId: perm.file.owner_id,
                status: perm.file.status,
                isStarred: !!perm.file.is_starred,
                isTrash: !!perm.file.is_deleted,
                createdAt: perm.file.created_at,
                updatedAt: perm.file.updated_at,
                permission: perm.role,
            },
            message: 'File metadata retrieved',
        });
    }
    catch (err) {
        next(err);
    }
}
async function downloadFile(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { id } = req.params;
        const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, id, db);
        if (!perm.canRead || perm.file.is_deleted) {
            throw new errors_js_1.ForbiddenError('File access forbidden or file in trash');
        }
        const key = perm.file.storage_key || perm.file.storage_path;
        const { url, expiresIn } = await (0, storage_js_1.createSignedDownloadUrl)(key, 3600, db);
        try {
            await db.from('activities').insert({
                user_id: user.id,
                action: 'download',
                resource_type: 'file',
                resource_id: id,
                context: { name: perm.file.name },
            });
        }
        catch (e) { }
        res.status(200).json({
            data: {
                url,
                expiresIn,
                filename: perm.file.name,
            },
            message: 'Download URL generated',
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateFile(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { id } = req.params;
        const { name, folderId, isTrash } = req.body;
        const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, id, db);
        if (!perm.canWrite) {
            throw new errors_js_1.ForbiddenError('No write permission for this file');
        }
        const updates = { updated_at: new Date().toISOString() };
        if (name !== undefined) {
            updates.name = (0, filenames_js_1.sanitizeFilename)(name);
        }
        if (folderId !== undefined) {
            if (folderId) {
                const folderPerm = await (0, permissions_js_1.getUserFolderPermission)(user.id, user.email, folderId, db);
                if (!folderPerm.canWrite) {
                    throw new errors_js_1.ForbiddenError('No write permission for target folder');
                }
            }
            updates.folder_id = folderId;
        }
        if (isTrash !== undefined) {
            updates.is_deleted = isTrash;
        }
        const { data: updated, error } = await db
            .from('files')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        const ext = (0, filenames_js_1.getExtension)(updated.name);
        res.status(200).json({
            data: {
                id: updated.id,
                name: updated.name,
                extension: ext,
                folderId: updated.folder_id,
                isStarred: !!updated.is_starred,
                isTrash: !!updated.is_deleted,
                updatedAt: updated.updated_at,
            },
            message: 'File updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function deleteFile(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { id } = req.params;
        const perm = await (0, permissions_js_1.getUserFilePermission)(user.id, user.email, id, db);
        if (!perm.canWrite) {
            throw new errors_js_1.ForbiddenError('No write permission for this file');
        }
        await db
            .from('files')
            .update({ is_deleted: true })
            .eq('id', id);
        res.status(200).json({
            data: { id },
            message: 'File moved to trash',
        });
    }
    catch (err) {
        next(err);
    }
}
async function listAllFiles(req, res, next) {
    try {
        const user = req.user;
        const db = req.db || supabase_js_1.supabaseAdmin;
        const { data: files, error } = await db
            .from('files')
            .select('*')
            .eq('owner_id', user.id);
        if (error)
            throw new Error(error.message);
        res.status(200).json({
            data: (files || []).map((f) => {
                const ext = (0, filenames_js_1.getExtension)(f.name);
                return {
                    id: f.id,
                    name: f.name,
                    extension: ext,
                    size: f.size_bytes,
                    formattedSize: (0, filenames_js_1.formatSizeBytes)(f.size_bytes),
                    type: ext,
                    folderId: f.folder_id,
                    ownerId: f.owner_id,
                    owner: 'You',
                    isStarred: !!f.is_starred,
                    isTrash: !!f.is_deleted,
                    createdAt: f.created_at,
                    updatedAt: f.updated_at,
                };
            }),
            message: 'Files listed',
        });
    }
    catch (err) {
        next(err);
    }
}
