import type { RouteMeta } from '@/config/routes';

export type DashboardUserProfile = {
    userId: string;
    username: string;
    name: string;
    avatar?: string;
    dept?: {
        deptId: string;
        name: string;
    };
    postList?: Array<{
        postId: string;
        postName: string;
    }>;
    roleList?: Array<{
        roleId: string;
        roleName: string;
    }>;
};

export type DashboardLogItem = {
    id: string;
    title: string;
    remoteAddr: string;
    createTime: string;
};

export type DashboardFavoriteRoute = Pick<RouteMeta, 'path' | 'label' | 'description' | 'icon'>;
