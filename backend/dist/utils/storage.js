"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileStoragePath = getFileStoragePath;
exports.createSignedDownloadUrl = createSignedDownloadUrl;
const supabase_js_1 = require("../config/supabase.js");
const env_js_1 = require("../config/env.js");
const errors_js_1 = require("./errors.js");
function getFileStoragePath(userId, fileId, version = 1) {
    if (version === 1) {
        return `users/${userId}/files/${fileId}/original`;
    }
    return `users/${userId}/files/${fileId}/versions/${version}`;
}
async function createSignedDownloadUrl(storagePath, expiresInSeconds = 300, client) {
    try {
        const db = client || supabase_js_1.supabaseAdmin;
        const { data, error } = await db.storage
            .from(env_js_1.env.SUPABASE_STORAGE_BUCKET)
            .createSignedUrl(storagePath, expiresInSeconds);
        if (error) {
            console.error('[createSignedDownloadUrl Error]', error);
        }
        if (error || !data?.signedUrl) {
            // Fallback: construct public URL or return empty string
            const { data: pubData } = db.storage
                .from(env_js_1.env.SUPABASE_STORAGE_BUCKET)
                .getPublicUrl(storagePath);
            const publicUrl = pubData?.publicUrl || '';
            return { url: publicUrl, expiresIn: expiresInSeconds };
        }
        return {
            url: data.signedUrl,
            expiresIn: expiresInSeconds,
        };
    }
    catch (err) {
        throw new errors_js_1.StorageError('Failed to generate signed download URL');
    }
}
