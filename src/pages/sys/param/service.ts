import { http } from '@/api/http';
import type { ParamDetail, ParamItem } from './types';

export async function fetchParamPage(params: {
	current: number;
	size: number;
	publicName?: string;
	publicKey?: string;
	systemFlag?: string;
}) {
	return http.get('/admin/param/page', { params }) as Promise<{ data: { records: ParamItem[]; total: number } }>;
}

export async function fetchParamDetail(id: string) {
	return http.get(`/admin/param/details/${id}`) as Promise<{ data: ParamDetail }>;
}

export async function createParam(payload: Record<string, unknown>) {
	return http.post('/admin/param', payload);
}

export async function updateParam(payload: Record<string, unknown>) {
	return http.put('/admin/param', payload);
}

export async function deleteParams(ids: string[]) {
	return http.delete('/admin/param', { data: ids });
}

export async function refreshParamCache() {
	return http.put('/admin/param/sync');
}
