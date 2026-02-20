/**
 * API Client untuk PustakaPlus Backend
 * Menggantikan Supabase client dengan REST API calls ke Express backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/** Ambil token JWT dari localStorage */
function getToken(): string | null {
  return localStorage.getItem('pustakaplus_token');
}

/** Simpan token JWT ke localStorage */
export function setToken(token: string): void {
  localStorage.setItem('pustakaplus_token', token);
}

/** Hapus token JWT dari localStorage */
export function removeToken(): void {
  localStorage.removeItem('pustakaplus_token');
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Core fetch wrapper dengan auto-auth header injection
 */
async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json() as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.message || `HTTP ${response.status}`);
  }

  return json;
}

/** HTTP method shortcuts */
export const api = {
  get: <T = unknown>(path: string) =>
    request<T>(path, { method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};

export default api;
