import { http } from '@/api/http';
import type { DepartmentDetail, DepartmentNode } from './types';

export async function fetchDepartmentTree(params?: Record<string, string>) {
    return http.get('/admin/dept/tree', { params }) as Promise<{ data: DepartmentNode[] }>;
}

export async function fetchDepartmentDetail(id: string) {
    return http.get(`/admin/dept/${id}`) as Promise<{ data: DepartmentDetail }>;
}

export async function createDepartment(payload: Record<string, unknown>) {
    return http.post('/admin/dept', payload);
}

export async function updateDepartment(payload: Record<string, unknown>) {
    return http.put('/admin/dept', payload);
}

export async function deleteDepartment(id: string) {
    return http.delete(`/admin/dept/${id}`);
}
