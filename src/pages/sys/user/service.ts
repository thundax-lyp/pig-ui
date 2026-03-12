import { http } from '@/api/http';
import type { DeptTreeNode, PagedResult, PostOption, RoleOption, UserDetails, UserListItem, UserQuery } from './types';

export async function fetchUserPage(params: UserQuery): Promise<PagedResult<UserListItem>> {
    return http.get('/admin/user/page', { params });
}

export async function fetchUserDetails(userId: string): Promise<{ data: UserDetails }> {
    return http.get(`/admin/user/details/${userId}`);
}

export async function createUser(payload: Record<string, unknown>) {
    return http.post('/admin/user', payload);
}

export async function updateUser(payload: Record<string, unknown>) {
    return http.put('/admin/user', payload);
}

export async function deleteUsers(ids: string[]) {
    return http.delete('/admin/user', { data: ids });
}

export async function fetchDeptTree(deptName?: string): Promise<{ data: DeptTreeNode[] }> {
    return http.get('/admin/dept/tree', { params: deptName ? { deptName } : undefined });
}

export async function fetchRoleList(): Promise<{ data: RoleOption[] }> {
    return http.get('/admin/role/list');
}

export async function fetchPostList(): Promise<{ data: PostOption[] }> {
    return http.get('/admin/post/list');
}
