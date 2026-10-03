import { API_BASE } from '../shared/apiConfig.js';

const getToken = () => localStorage.getItem('hub_token');

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('hub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearFreelancerSession = () => {
  localStorage.removeItem('hub_token');
  localStorage.removeItem('hub_user');
  localStorage.removeItem('hub_role');
};

export const getFreelancerProfileId = () => {
  const user = getStoredUser();
  const id = user?.profile?.id;
  if (id === undefined || id === null || id === '') {
    return null;
  }
  return id;
};

export class FreelancerApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'FreelancerApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const freelancerRequest = async (path, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new FreelancerApiError('Authentication required', 401);
  }

  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(options.body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
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
    throw new FreelancerApiError('Unable to reach the server', 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    clearFreelancerSession();
    throw new FreelancerApiError(
      payload?.message || 'Session expired',
      401,
      payload,
    );
  }

  if (!response.ok || !payload?.success) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((e) => e.message).filter(Boolean).join('; ')
      : '';
    throw new FreelancerApiError(
      details || payload?.message || 'Request failed',
      response.status,
      payload,
    );
  }

  return payload.data;
};

export const freelancerGet = (path) => freelancerRequest(path);

export const freelancerPost = (path, body = {}) =>
  freelancerRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const freelancerPatch = (path, body = {}) =>
  freelancerRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const freelancerUpload = (path, file, fields = {}) => {
  const form = new FormData();
  form.append('file', file);
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value);
    }
  });
  return freelancerRequest(path, { method: 'POST', body: form });
};

export const freelancerDelete = (path) =>
  freelancerRequest(path, {
    method: 'DELETE',
  });

export const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return `$${amount.toFixed(2)}`;
};

export const errorMessage = (error, fallback = 'Request failed') => {
  if (error instanceof FreelancerApiError) {
    if (error.status === 403) {
      return error.message || 'Access denied';
    }
    if (error.status === 404) {
      return error.message || 'Resource not found';
    }
    if (error.status === 409) {
      return error.message || 'Conflict';
    }
    if (error.status === 429) {
      return error.message || 'Usage limit reached';
    }
    return error.message || fallback;
  }
  return fallback;
};
