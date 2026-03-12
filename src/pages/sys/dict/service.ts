import { http } from '@/api/http';
import type { DictItem, DictOption, DictTypeItem } from './types';

export async function fetchDictTypes(name?: string) {
    return http.get('/admin/dict/list', { params: name ? { name } : undefined }) as Promise<{ data: DictTypeItem[] }>;
}

export async function fetchDictOptions(type: string) {
    return http.get(`/admin/dict/type/${type}`) as Promise<{ data: DictOption[] }>;
}

export async function fetchDictTypeDetail(id: string) {
    return http.get(`/admin/dict/details/${id}`) as Promise<{ data: DictTypeItem }>;
}

export async function createDictType(payload: Record<string, unknown>) {
    return http.post('/admin/dict', payload);
}

export async function updateDictType(payload: Record<string, unknown>) {
    return http.put('/admin/dict', payload);
}

export async function deleteDictTypes(ids: string[]) {
    return http.delete('/admin/dict', { data: ids });
}

export async function refreshDictCache() {
    return http.put('/admin/dict/sync');
}

export async function fetchDictItems(params: { dictId: string; dictType: string; current: number; size: number }) {
    return http.get('/admin/dict/item/page', { params }) as Promise<{ data: { records: DictItem[]; total: number } }>;
}

export async function fetchDictItemDetail(id: string) {
    return http.get(`/admin/dict/item/details/${id}`) as Promise<{ data: DictItem }>;
}

export async function createDictItem(payload: Record<string, unknown>) {
    return http.post('/admin/dict/item', payload);
}

export async function updateDictItem(payload: Record<string, unknown>) {
    return http.put('/admin/dict/item', payload);
}

export async function deleteDictItem(id: string) {
    return http.delete(`/admin/dict/item/${id}`);
}
