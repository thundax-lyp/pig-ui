import { http } from '@/api/http';
import type { CacheResponse } from './types';

export const fetchSystemCache = () => {
	return http.get('/admin/system/cache') as Promise<{ data: CacheResponse }>;
};
