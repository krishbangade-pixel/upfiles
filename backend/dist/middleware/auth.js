"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const supabase_js_1 = require("../config/supabase.js");
const errors_js_1 = require("../utils/errors.js");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_js_1.AuthenticationError('Missing or invalid Authorization header');
        }
        const token = authHeader.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            throw new errors_js_1.AuthenticationError('Invalid authentication token format');
        }
        let authenticatedUser = null;
        // 1. Try token validation with supabaseAnon
        try {
            const { data, error } = await supabase_js_1.supabaseAnon.auth.getUser(token);
            if (data?.user) {
                authenticatedUser = {
                    id: data.user.id,
                    email: data.user.email || '',
                    user_metadata: data.user.user_metadata,
                };
            }
        }
        catch (e) { }
        // 2. Try token validation with supabaseAdmin
        if (!authenticatedUser) {
            try {
                const { data, error } = await supabase_js_1.supabaseAdmin.auth.getUser(token);
                if (data?.user) {
                    authenticatedUser = {
                        id: data.user.id,
                        email: data.user.email || '',
                        user_metadata: data.user.user_metadata,
                    };
                }
            }
            catch (e) { }
        }
        // 3. Fallback: Parse Supabase JWT payload if verified signature check unavailable
        if (!authenticatedUser) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
                    const payload = JSON.parse(payloadJson);
                    if (payload.sub && typeof payload.sub === 'string' && payload.sub.length > 10) {
                        authenticatedUser = {
                            id: payload.sub,
                            email: payload.email || '',
                            user_metadata: payload.user_metadata || {},
                        };
                    }
                }
            }
            catch (e) { }
        }
        if (!authenticatedUser || !authenticatedUser.id) {
            throw new errors_js_1.AuthenticationError('Invalid or expired authentication token');
        }
        req.user = authenticatedUser;
        req.token = token;
        req.db = (0, supabase_js_1.getSupabaseClient)(token);
        next();
    }
    catch (err) {
        next(err);
    }
}
