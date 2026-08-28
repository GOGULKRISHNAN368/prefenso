import axios from 'axios';
import { api, setAccessToken } from './client';
import { User } from '../types';
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) throw new Error('VITE_API_BASE_URL is required');
export async function login(username: string, password: string) { const response = await axios.post(`${baseURL}/auth/admin/login`, { username, password }, { withCredentials: true }); setAccessToken(response.data.data.accessToken); return response.data.data.user as User; }
export async function refresh() { try { const response = await axios.post(`${baseURL}/auth/admin/refresh`, {}, { withCredentials: true }); setAccessToken(response.data.data.accessToken); return response.data.data.user as User; } catch { setAccessToken(null); return null; } }
export async function logout() { await api.post('/auth/admin/logout').catch(() => undefined); setAccessToken(null); }
