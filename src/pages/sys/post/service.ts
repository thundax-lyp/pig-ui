import { http } from '@/api/http';
import type { PostDetail, PostItem } from './types';

export async function fetchPostPage(params: { current: number; size: number; postName?: string }) {
	return http.get('/admin/post/page', { params }) as Promise<{ data: { records: PostItem[]; total: number } }>;
}

export async function fetchPostDetail(postId: string) {
	return http.get(`/admin/post/details/${postId}`) as Promise<{ data: PostDetail }>;
}

export async function createPost(payload: Record<string, unknown>) {
	return http.post('/admin/post', payload);
}

export async function updatePost(payload: Record<string, unknown>) {
	return http.put('/admin/post', payload);
}

export async function deletePosts(ids: string[]) {
	return http.delete('/admin/post', { data: ids });
}
