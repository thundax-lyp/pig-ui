import { http } from '@/api/http';
import type { TemplateItem } from './types';

export const fetchTemplatePage = (params: { current: number; size: number; templateName?: string }) => {
	return http.get('/gen/template/page', { params }) as Promise<{ data: { records: TemplateItem[]; total: number } }>;
};

export const fetchTemplateList = () => {
	return http.get('/gen/template/list') as Promise<{ data: TemplateItem[] }>;
};

export const fetchTemplateDetail = (id: string) => {
	return http.get(`/gen/template/${id}`) as Promise<{ data: TemplateItem }>;
};

export const createTemplate = (payload: Record<string, unknown>) => {
	return http.post('/gen/template', payload);
};

export const updateTemplate = (payload: Record<string, unknown>) => {
	return http.put('/gen/template', payload);
};

export const deleteTemplates = (ids: string[]) => {
	return http.delete('/gen/template', { data: ids });
};

export const updateTemplatesOnline = () => {
	return http.get('/gen/template/online') as Promise<{ data: string }>;
};

export const checkTemplateVersion = () => {
	return http.get('/gen/template/checkVersion') as Promise<{ data: boolean }>;
};

export const exportTemplates = (params: { templateName?: string }) => {
	return http.get('/gen/template/export', {
		params,
		responseType: 'blob',
	}) as Promise<Blob>;
};
