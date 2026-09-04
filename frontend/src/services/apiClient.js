import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

export const apiClient = {
  get: async (endpoint, customHeaders = {}) => {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...customHeaders,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'API request failed');
    }
    return json;
  },

  post: async (endpoint, body = {}, customHeaders = {}) => {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...customHeaders,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'API request failed');
    }
    return json;
  },

  patch: async (endpoint, body = {}, customHeaders = {}) => {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...customHeaders,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'API request failed');
    }
    return json;
  },

  delete: async (endpoint, customHeaders = {}) => {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...customHeaders,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'API request failed');
    }
    return json;
  },
};
