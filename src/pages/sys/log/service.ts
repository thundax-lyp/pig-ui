import { http } from '@/api/http';
import type { LogItem } from './types';

export async function fetchLogPage(params: {
	current: number;
	size: number;
	logType?: string;
	createTime?: string[];
	descs?: string;
}) {
	return http.get('/admin/log/page', { params }) as Promise<{ data: { records: LogItem[]; total: number } }>;
}

export async function deleteLogs(ids: string[]) {
	return http.delete('/admin/log', { data: ids });
}
