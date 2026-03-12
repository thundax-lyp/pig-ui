import { http } from '@/api/http';
import type { MenuTreeNode, RoleItem } from './types';

export async function fetchRolePage(params: { current: number; size: number; roleName?: string }) {
	return http.get('/admin/role/page', { params }) as Promise<{ data: { records: RoleItem[]; total: number } }>;
}

export async function fetchRoleDetails(roleId: string) {
	return http.get(`/admin/role/details/${roleId}`) as Promise<{ data: RoleItem }>;
}

export async function createRole(payload: Record<string, unknown>) {
	return http.post('/admin/role', payload);
}

export async function updateRole(payload: Record<string, unknown>) {
	return http.put('/admin/role', payload);
}

export async function deleteRoles(ids: string[]) {
	return http.delete('/admin/role', { data: ids });
}

export async function fetchRolePermissionIds(roleId: string) {
	return http.get(`/admin/menu/tree/${roleId}`) as Promise<{ data: string[] }>;
}

export async function fetchMenuTree() {
	return http.get('/admin/menu/tree') as Promise<{ data: MenuTreeNode[] }>;
}

export async function updateRolePermissions(roleId: string, menuIds: string[]) {
	return http.put('/admin/role/menu', {
		roleId,
		menuIds: menuIds.join(','),
	});
}
