"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAnon = exports.supabaseAdmin = void 0;
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const env_js_1 = require("./env.js");
const isMockKey = !env_js_1.env.SUPABASE_SERVICE_ROLE_KEY || env_js_1.env.SUPABASE_SERVICE_ROLE_KEY.includes('mock');
const adminKey = isMockKey ? env_js_1.env.SUPABASE_ANON_KEY : env_js_1.env.SUPABASE_SERVICE_ROLE_KEY;
// Service role or admin Supabase client for backend database & storage operations
exports.supabaseAdmin = (0, supabase_js_1.createClient)(env_js_1.env.SUPABASE_URL, adminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// User auth client for token verification using anon key
exports.supabaseAnon = (0, supabase_js_1.createClient)(env_js_1.env.SUPABASE_URL, env_js_1.env.SUPABASE_ANON_KEY);
function getSupabaseClient(token) {
    if (!isMockKey) {
        return exports.supabaseAdmin;
    }
    if (token) {
        return (0, supabase_js_1.createClient)(env_js_1.env.SUPABASE_URL, env_js_1.env.SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return exports.supabaseAnon;
}
