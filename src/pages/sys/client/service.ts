import { http } from '@/api/http';
import type { ClientDetail, ClientItem } from './types';

export async function fetchClientPage(params: { current: number; size: number; clientId?: string; clientSecret?: string }) {
    return http.get('/admin/client/page', { params }) as Promise<{ data: { records: ClientItem[]; total: number } }>;
}

export async function fetchClientDetail(id: string) {
    return http.get(`/admin/client/${id}`) as Promise<{ data: ClientDetail }>;
}

export async function createClient(payload: Record<string, unknown>) {
    return http.post('/admin/client', payload);
}

export async function updateClient(payload: Record<string, unknown>) {
    return http.put('/admin/client', payload);
}

export async function deleteClients(ids: string[]) {
    return http.delete('/admin/client', { data: ids });
}

export async function refreshClientCache() {
    return http.put('/admin/client/sync');
}
