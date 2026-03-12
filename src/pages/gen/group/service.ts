import { http } from '@/api/http';
import type { GroupItem, TemplateOption } from './types';

export const fetchGroupPage = (params: { current: number; size: number; groupName?: string }) => {
    return http.get('/gen/group/page', { params }) as Promise<{ data: { records: GroupItem[]; total: number } }>;
};

export const fetchGroupList = () => {
    return http.get('/gen/group/list') as Promise<{ data: GroupItem[] }>;
};

export const fetchGroupDetail = (id: string) => {
    return http.get(`/gen/group/${id}`) as Promise<{ data: GroupItem }>;
};

export const createGroup = (payload: Record<string, unknown>) => {
    return http.post('/gen/group', payload);
};

export const updateGroup = (payload: Record<string, unknown>) => {
    return http.put('/gen/group', payload);
};

export const deleteGroups = (ids: string[]) => {
    return http.delete('/gen/group', { data: ids });
};

export const exportGroups = (params: { groupName?: string }) => {
    return http.get('/gen/group/export', {
        params,
        responseType: 'blob',
    }) as Promise<Blob>;
};

export const fetchTemplateOptions = () => {
    return http.get('/gen/template/list') as Promise<{ data: TemplateOption[] }>;
};
