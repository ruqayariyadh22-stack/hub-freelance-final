import { API_BASE } from '../shared/apiConfig.js';

// The admin session is stored under its own keys so that signing in (or out)
// as a client or freelancer in another tab never logs the admin out.
const ADMIN_TOKEN_KEY = 'hub_admin_token';
const ADMIN_USER_KEY = 'hub_admin_user';

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// One-time upgrade for admins who signed in before the keys were separated.
const migrateLegacyAdminSession = () => {
  if (localStorage.getItem(ADMIN_TOKEN_KEY)) return;
  const legacyUser = readJson('hub_user');
  const legacyToken = localStorage.getItem('hub_token');
  if (legacyToken && legacyUser?.role === 'admin') {
    localStorage.setItem(ADMIN_TOKEN_KEY, legacyToken);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(legacyUser));
    localStorage.removeItem('hub_token');
    localStorage.removeItem('hub_user');
    localStorage.removeItem('hub_role');
  }
};

const getToken = () => {
  migrateLegacyAdminSession();
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const getAdminUser = () => {
  migrateLegacyAdminSession();
  return readJson(ADMIN_USER_KEY);
};

export const saveAdminSession = (token, user) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  localStorage.removeItem('hub_admin_authenticated');
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem('hub_admin_authenticated');
};

export const isAdminSession = () => {
  const token = getToken();
  const user = getAdminUser();
  return Boolean(token && user?.role === 'admin');
};

export class AdminApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const adminRequest = async (path, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new AdminApiError('Authentication required', 401);
  }

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new AdminApiError('Unable to reach the server', 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    clearAdminSession();
    throw new AdminApiError(
      payload?.message || 'Session expired',
      401,
      payload,
    );
  }

  if (!response.ok || !payload?.success) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((e) => e.message).filter(Boolean).join(' ')
      : '';
    throw new AdminApiError(
      details || payload?.message || 'Request failed',
      response.status,
      payload,
    );
  }

  return payload.data;
};

export const adminGet = (path) => adminRequest(path);

export const adminPost = (path, body) =>
  adminRequest(path, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });

export const adminPatch = (path, body) =>
  adminRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });

export const adminDelete = (path) =>
  adminRequest(path, {
    method: 'DELETE',
    body: JSON.stringify({}),
  });

export const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};
