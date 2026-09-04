import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function getAuthToken(forceRefresh = false) {
  try {
    if (forceRefresh) {
      const { data: refData } = await supabase.auth.refreshSession();
      if (refData.session?.access_token) {
        return refData.session.access_token;
      }
    }

    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      const expiresAt = data.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt <= now + 60) {
        const { data: refData } = await supabase.auth.refreshSession();
        if (refData.session?.access_token) {
          return refData.session.access_token;
        }
      }
      return data.session.access_token;
    }
  } catch (e) {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.access_token) return parsed.access_token;
          if (parsed?.currentSession?.access_token) return parsed.currentSession.access_token;
        }
      }
    }
  } catch (e) {}

  return null;
}

async function request(endpoint, options = {}, isRetry = false) {
  const token = await getAuthToken(isRetry);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (response.status === 401 && !isRetry) {
      console.warn(`[API 401] Retrying ${cleanEndpoint} with refreshed session...`);
      return await request(endpoint, options, true);
    }

    if (!response.ok) {
      const errorMsg = result?.error?.message || result?.message || `HTTP ${response.status} error`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (err) {
    console.error(`API Error [${options.method || 'GET'} ${cleanEndpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

