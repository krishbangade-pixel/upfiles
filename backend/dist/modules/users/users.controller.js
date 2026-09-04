"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
exports.getUserProfile = getUserProfile;
exports.updateUserProfile = updateUserProfile;
const supabase_js_1 = require("../../config/supabase.js");
const errors_js_1 = require("../../utils/errors.js");
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
});
async function getUserProfile(req, res, next) {
    try {
        const user = req.user;
        if (!user)
            throw new errors_js_1.AuthenticationError();
        const { data: profile, error } = await supabase_js_1.supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (error || !profile) {
            throw new errors_js_1.NotFoundError('User profile not found');
        }
        res.status(200).json({
            data: {
                id: profile.id,
                email: profile.email,
                name: profile.full_name,
                avatarUrl: profile.avatar_url,
                createdAt: profile.created_at,
            },
            message: 'Profile retrieved successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function updateUserProfile(req, res, next) {
    try {
        const user = req.user;
        if (!user)
            throw new errors_js_1.AuthenticationError();
        const { fullName, avatarUrl } = req.body;
        const updates = { updated_at: new Date().toISOString() };
        if (fullName !== undefined)
            updates.full_name = fullName;
        if (avatarUrl !== undefined)
            updates.avatar_url = avatarUrl;
        const { data: updated, error } = await supabase_js_1.supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
        res.status(200).json({
            data: {
                id: updated.id,
                email: updated.email,
                name: updated.full_name,
                avatarUrl: updated.avatar_url,
                updatedAt: updated.updated_at,
            },
            message: 'Profile updated successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
