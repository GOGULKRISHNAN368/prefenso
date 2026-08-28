import { api } from './client'; import { Dashboard, Visitor } from '../types';
export async function getDashboard() { return (await api.get<{ data: Dashboard }>('/watchman/dashboard')).data.data; }
export async function checkIn(data: unknown) { return (await api.post<{ data: Visitor }>('/watchman/visitors/check-in', data)).data.data; }
export async function getInside() { return (await api.get<{ data: Visitor[] }>('/watchman/visitors/inside')).data.data; }
export async function getHistory(params: Record<string, string>) { return (await api.get<{ data: Visitor[]; meta: { page: number; limit: number; total: number; totalPages: number } }>('/watchman/visitors/history', { params })).data; }
export async function checkout(id: string, checkoutAt?: string) { return (await api.patch<{ data: Visitor }>(`/watchman/visitors/${id}/check-out`, { checkoutAt })).data.data; }
