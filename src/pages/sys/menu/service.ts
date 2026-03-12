import { http } from '@/api/http';
import type { MenuDetail, MenuNode } from './types';

export async function fetchMenuTree(params?: Record<string, string>) {
	return http.get('/admin/menu/tree', { params }) as Promise<{ data: MenuNode[] }>;
}

export async function fetchMenuDetail(id: string) {
	return http.get(`/admin/menu/${id}`) as Promise<{ data: MenuDetail }>;
}

export async function createMenu(payload: Record<string, unknown>) {
	return http.post('/admin/menu', payload);
}

export async function updateMenu(payload: Record<string, unknown>) {
	return http.put('/admin/menu', payload);
}

export async function deleteMenu(id: string) {
	return http.delete(`/admin/menu/${id}`);
}
