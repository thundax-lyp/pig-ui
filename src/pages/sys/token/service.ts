import { http } from '@/api/http';
import type { TokenItem } from './types';

export async function fetchTokenPage(payload: { current: number; size: number; username?: string }) {
	return http.post('/admin/sys-token/page', payload) as Promise<{ data: { records: TokenItem[]; total: number } }>;
}

export async function offlineTokens(accessTokens: string[]) {
	return http.delete('/admin/sys-token/delete', { data: accessTokens });
}
