import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) throw new Error('VITE_API_BASE_URL is required');
let accessToken: string | null = null;
let refreshing: Promise<string> | null = null;
let onUnauthorized: (() => void) | null = null;
export function setAccessToken(token: string | null) { accessToken = token; }
export function setUnauthorizedHandler(handler: () => void) { onUnauthorized = handler; }

export const api = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`; return config; });
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config as typeof error.config & { _retry?: boolean };
  if (error.response?.status === 401 && original && !original._retry && !String(original.url).includes('/auth/')) {
    original._retry = true;
    try {
      refreshing ??= axios.post(`${baseURL}/auth/admin/refresh`, {}, { withCredentials: true }).then((response) => { const token = response.data.data.accessToken as string; setAccessToken(token); return token; }).finally(() => { refreshing = null; });
      await refreshing;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) { setAccessToken(null); onUnauthorized?.(); return Promise.reject(refreshError); }
  }
  return Promise.reject(error);
});

export function apiError(error: unknown): string { return axios.isAxiosError(error) ? error.response?.data?.message || 'Something went wrong. Please try again.' : 'Something went wrong. Please try again.'; }
