const rawOrigin =
  typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim()
    ? import.meta.env.VITE_API_URL.trim()
    : 'http://localhost:5000';

export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');
export const API_BASE = `${API_ORIGIN}/api`;
