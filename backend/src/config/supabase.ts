import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

const isMockKey = !env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY.includes('mock');
const adminKey = isMockKey ? env.SUPABASE_ANON_KEY : env.SUPABASE_SERVICE_ROLE_KEY;

// Service role or admin Supabase client for backend database & storage operations
export const supabaseAdmin = createClient(env.SUPABASE_URL, adminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// User auth client for token verification using anon key
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export function getSupabaseClient(token?: string): SupabaseClient {
  if (!isMockKey) {
    return supabaseAdmin;
  }
  if (token) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
  return supabaseAnon;
}


