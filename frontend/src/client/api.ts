import { API_BASE } from '../shared/apiConfig.js';

export class ClientApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ClientApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  form?: FormData;
};

export const clientRequest = async <T = unknown>(
  path: string,
  { method = 'GET', body, form }: RequestOptions = {}
): Promise<T> => {
  const token = localStorage.getItem('hub_token');
  if (!token) {
    throw new ClientApiError('Authentication required', 401);
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body !== undefined && !form) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body))
    });
  } catch {
    throw new ClientApiError('Unable to reach the server', 0);
  }

  let payload: { success?: boolean; data?: T; message?: string; errors?: { message?: string }[] } | null =
    null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const details = Array.isArray(payload?.errors)
      ? payload.errors.map((e) => e.message).filter(Boolean).join(' ')
      : '';
    throw new ClientApiError(details || payload?.message || 'Request failed', response.status);
  }

  return payload.data as T;
};

export const uploadFile = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return clientRequest<{ file_name: string; file_url: string; mime_type: string; size_bytes: number }>(
    '/uploads',
    { method: 'POST', form }
  );
};

export const errorText = (error: unknown, fallback: string) =>
  error instanceof ClientApiError && error.message ? error.message : fallback;
