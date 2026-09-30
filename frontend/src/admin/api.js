const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('hub_token');

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('hub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem('hub_token');
  localStorage.removeItem('hub_user');
  localStorage.removeItem('hub_role');
  localStorage.removeItem('hub_admin_authenticated');
};

export const isAdminSession = () => {
  const token = getToken();
  const user = getStoredUser();
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
    throw new AdminApiError(
      payload?.message || 'Request failed',
      response.status,
      payload,
    );
  }

  return payload.data;
};

export const adminGet = (path) => adminRequest(path);

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
