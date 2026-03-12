import { http } from '@/api/http';
import type { CurrentUserInfo } from '@/pages/auth/login/types';
import type { DashboardLogItem, DashboardUserProfile } from './types';

export async function fetchDashboardCurrentUser() {
    return http.get('/admin/user/info') as Promise<{ data: CurrentUserInfo }>;
}

export async function fetchDashboardUserProfile(userId: string) {
    return http.get(`/admin/user/details/${userId}`) as Promise<{ data: DashboardUserProfile }>;
}

export async function fetchDashboardLogs() {
    return http.get('/admin/log/page', {
        params: {
            current: 1,
            size: 4,
            descs: 'create_time',
        },
    }) as Promise<{ data: { records: DashboardLogItem[] } }>;
}
