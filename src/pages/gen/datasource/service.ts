import { http } from '@/api/http';
import type { DatasourceItem } from './types';

export const fetchDatasourcePage = (params: { current: number; size: number; dsName?: string }) => {
	return http.get('/gen/dsconf/page', { params }) as Promise<{ data: { records: DatasourceItem[]; total: number } }>;
};

export const fetchDatasourceList = () => {
	return http.get('/gen/dsconf/list') as Promise<{ data: DatasourceItem[] }>;
};

export const fetchDatasourceDetail = (id: string) => {
	return http.get(`/gen/dsconf/${id}`) as Promise<{ data: DatasourceItem & { password?: string } }>;
};

export const createDatasource = (payload: Record<string, unknown>) => {
	return http.post('/gen/dsconf', payload);
};

export const updateDatasource = (payload: Record<string, unknown>) => {
	return http.put('/gen/dsconf', payload);
};

export const deleteDatasources = (ids: string[]) => {
	return http.delete('/gen/dsconf', { data: ids });
};

export const downloadDatasourceDoc = (dsName: string) => {
	return http.get('/gen/dsconf/doc', {
		params: { dsName },
		responseType: 'blob',
	}) as Promise<Blob>;
};
