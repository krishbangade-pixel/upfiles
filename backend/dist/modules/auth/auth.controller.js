"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const supabase_js_1 = require("../../config/supabase.js");
const errors_js_1 = require("../../utils/errors.js");
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    fullName: zod_1.z.string().min(1, 'Full name is required'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
async function register(req, res, next) {
    try {
        const { email, password, fullName } = req.body;
        const { data, error } = await supabase_js_1.supabaseAnon.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        if (error) {
            throw new errors_js_1.ValidationError(error.message);
        }
        // Ensure profile row exists
        if (data.user) {
            await supabase_js_1.supabaseAdmin.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email,
                full_name: fullName,
            });
        }
        res.status(201).json({
            data: {
                user: data.user,
                session: data.session,
            },
            message: 'User registered successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase_js_1.supabaseAnon.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new errors_js_1.AuthenticationError(error.message);
        }
        res.status(200).json({
            data: {
                user: data.user,
                session: data.session,
            },
            message: 'Sign in successful',
        });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await supabase_js_1.supabaseAdmin.auth.admin.signOut(token);
        }
        res.status(200).json({
            data: null,
            message: 'Signed out successfully',
        });
    }
    catch (err) {
        next(err);
    }
}
async function getMe(req, res, next) {
    try {
        const user = req.user;
        if (!user)
            throw new errors_js_1.AuthenticationError();
        const { data: profile } = await supabase_js_1.supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
                    avatarUrl: profile?.avatar_url || null,
                    createdAt: profile?.created_at,
                },
            },
            message: 'Current user fetched',
        });
    }
    catch (err) {
        next(err);
    }
}
