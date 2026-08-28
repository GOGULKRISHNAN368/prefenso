import { api } from './client';
import { Block, Dashboard, Visitor } from '../types';
export async function getDashboard() { return (await api.get<{ data: Dashboard }>('/admin/dashboard')).data.data; }
export async function getBlocks() { return (await api.get<{ data: Block[] }>('/admin/blocks')).data.data; }
export async function createBlock(data: unknown) { return (await api.post<{ data: Block }>('/admin/blocks', data)).data.data; }
export async function updateBlock(id: string, data: unknown) { return (await api.patch<{ data: Block }>(`/admin/blocks/${id}`, data)).data.data; }
export async function setBlockStatus(id: string, isActive: boolean) { return (await api.patch<{ data: Block }>(`/admin/blocks/${id}/status`, { isActive })).data.data; }
export async function configureCredentials(id: string, data: unknown) { return (await api.put<{ data: Block }>(`/admin/blocks/${id}/credentials`, data)).data.data; }
export async function resetPassword(id: string, data: unknown) { return (await api.put<{ data: Block }>(`/admin/blocks/${id}/reset-password`, data)).data.data; }
export async function getVisitors(params: Record<string, string>) { return (await api.get<{ data: Visitor[]; meta: { page: number; limit: number; total: number; totalPages: number } }>('/admin/visitors', { params })).data; }
export async function getInside(blockId?: string) { return (await api.get<{ data: Visitor[] }>('/admin/visitors/inside', { params: blockId ? { blockId } : {} })).data.data; }
export async function getReports(params: Record<string, string>) { const [summary, trend, blocks] = await Promise.all([api.get('/admin/reports/summary', { params }), api.get('/admin/reports/visitor-trend', { params }), api.get('/admin/reports/block-summary', { params })]); return { summary: summary.data.data, trend: trend.data.data, blocks: blocks.data.data }; }
