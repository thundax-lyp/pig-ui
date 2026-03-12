import { http } from '@/api/http';
import type { FileItem } from './types';

export async function fetchFilePage(params: { current: number; size: number; original?: string }) {
    return http.get('/admin/sys-file/page', { params }) as Promise<{ data: { records: FileItem[]; total: number } }>;
}

export async function deleteFiles(ids: string[]) {
    return http.delete('/admin/sys-file', { data: ids });
}

export async function uploadFile(file: File, dir = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dir', dir);
    return http.post('/admin/sys-file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }) as Promise<{ data?: { fileName?: string; url?: string } }>;
}
