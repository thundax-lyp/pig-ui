import { http } from '@/api/http';
import type { FieldTypeItem } from './types';

export const fetchFieldTypePage = (params: { current: number; size: number; columnType?: string }) => {
    return http.get('/gen/fieldtype/page', { params }) as Promise<{ data: { records: FieldTypeItem[]; total: number } }>;
};

export const fetchFieldTypeList = () => {
    return http.get('/gen/fieldtype/list') as Promise<{ data: FieldTypeItem[] }>;
};

export const fetchFieldTypeDetail = (id: string) => {
    return http.get(`/gen/fieldtype/details/${id}`) as Promise<{ data: FieldTypeItem }>;
};

export const fetchFieldTypeDetailByColumnType = (columnType: string) => {
    return http.get('/gen/fieldtype/details', { params: { columnType } }) as Promise<{ data: FieldTypeItem | null }>;
};

export const createFieldType = (payload: Record<string, unknown>) => {
    return http.post('/gen/fieldtype', payload);
};

export const updateFieldType = (payload: Record<string, unknown>) => {
    return http.put('/gen/fieldtype', payload);
};

export const deleteFieldTypes = (ids: string[]) => {
    return http.delete('/gen/fieldtype', { data: ids });
};

export const exportFieldTypes = (params: { columnType?: string }) => {
    return http.get('/gen/fieldtype/export', {
        params,
        responseType: 'blob',
    }) as Promise<Blob>;
};
