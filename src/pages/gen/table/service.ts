import { http } from '@/api/http';
import type { DictOption, FormConfigRecord, FormHistoryItem, GeneratedCodeFile, TableDatasource, TableDetail, TableRow } from './types';

export const fetchTablePage = (params: { current: number; size: number; dsName?: string; tableName?: string }) => {
    return http.get('/gen/table/page', { params }) as Promise<{ data: { records: TableRow[]; total: number } }>;
};

export const fetchDatasourceOptions = () => {
    return http.get('/gen/dsconf/list') as Promise<{ data: TableDatasource[] }>;
};

export const fetchTableDetail = (dsName: string, tableName: string) => {
    return http.get(`/gen/table/${dsName}/${tableName}`) as Promise<{ data: TableDetail }>;
};

export const syncTable = (dsName: string, tableName: string) => {
    return http.get(`/gen/table/sync/${dsName}/${tableName}`);
};

export const updateTableBase = (payload: Record<string, unknown>) => {
    return http.put('/gen/table', payload) as Promise<{ data: TableDetail }>;
};

export const updateTableFields = (dsName: string, tableName: string, fields: unknown[]) => {
    return http.put(`/gen/table/field/${dsName}/${tableName}`, fields);
};

export const generateCode = (tableIds: string) => {
    return http.get('/gen/generator/code', { params: { tableIds } });
};

export const downloadCodeZip = (tableIds: string) => {
    return http.get('/gen/generator/download', {
        params: { tableIds },
        responseType: 'blob',
    }) as Promise<Blob>;
};

export const fetchGeneratorPreview = (tableId: string) => {
    return http.get('/gen/generator/preview', { params: { tableId } }) as Promise<GeneratedCodeFile[]>;
};

export const fetchGeneratorForm = (dsName: string, tableName: string) => {
    return http.get('/gen/generator/vform', { params: { dsName, tableName } }) as Promise<Record<string, unknown>>;
};

export const saveFormConfig = (payload: { dsName: string; tableName: string; formInfo: string }) => {
    return http.post('/gen/form', payload) as Promise<{ data: { id: string } }>;
};

export const fetchFormHistoryPage = (params: { current: number; size: number; dsName: string; tableName: string }) => {
    return http.get('/gen/form/page', { params }) as Promise<{ data: { records: FormHistoryItem[]; total: number } }>;
};

export const fetchFormById = (id: string) => {
    return http.get(`/gen/form/${id}`) as Promise<{ data: FormConfigRecord }>;
};

export const deleteFormById = (id: string) => {
    return http.delete(`/gen/form/${id}`);
};

export const exportTables = (params: { dsName?: string; tableName?: string }) => {
    return http.get('/gen/table/export', {
        params,
        responseType: 'blob',
    }) as Promise<Blob>;
};

export const fetchDictList = () => {
    return http.get('/admin/dict/list') as Promise<{ data: DictOption[] }>;
};
