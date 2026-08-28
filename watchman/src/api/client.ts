import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) throw new Error('VITE_API_BASE_URL is required');
let token: string | null = null; let refreshing: Promise<string> | null = null; let unauthorized: (() => void) | null = null;
export function setAccessToken(value: string | null) { token = value; }
export function setUnauthorizedHandler(fn: () => void) { unauthorized = fn; }
export const api = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => { if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, async (error) => { const original = error.config as typeof error.config & { _retry?: boolean }; if (error.response?.status === 401 && original && !original._retry && !String(original.url).includes('/auth/')) { original._retry = true; try { refreshing ??= axios.post(`${baseURL}/auth/watchman/refresh`, {}, { withCredentials: true }).then((response) => { setAccessToken(response.data.data.accessToken); return response.data.data.accessToken as string; }).finally(() => { refreshing = null; }); await refreshing; original.headers.Authorization = `Bearer ${token}`; return api(original); } catch (refreshError) { setAccessToken(null); unauthorized?.(); return Promise.reject(refreshError); } } return Promise.reject(error); });
export function apiError(error: unknown) { return axios.isAxiosError(error) ? error.response?.data?.message || 'Something went wrong. Please try again.' : 'Something went wrong. Please try again.'; }
