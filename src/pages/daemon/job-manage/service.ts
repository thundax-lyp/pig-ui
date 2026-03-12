import { http } from '@/api/http';
import type { JobItem, JobLogItem } from './types';

export async function fetchJobPage(params: {
	current: number;
	size: number;
	jobName?: string;
	jobStatus?: string;
	jobExecuteStatus?: string;
}) {
	return http.get('/job/sys-job/page', { params }) as Promise<{ data: { records: JobItem[]; total: number } }>;
}

export async function fetchJobDetail(id: string) {
	return http.get(`/job/sys-job/${id}`) as Promise<{ data: JobItem }>;
}

export async function createJob(payload: Record<string, unknown>) {
	return http.post('/job/sys-job', payload);
}

export async function updateJob(payload: Record<string, unknown>) {
	return http.put('/job/sys-job', payload);
}

export async function deleteJob(id: string) {
	return http.delete(`/job/sys-job/${id}`);
}

export async function startJob(id: string) {
	return http.post(`/job/sys-job/start-job/${id}`);
}

export async function shutdownJob(id: string) {
	return http.post(`/job/sys-job/shutdown-job/${id}`);
}

export async function runJob(id: string) {
	return http.post(`/job/sys-job/run-job/${id}`);
}

export async function fetchJobLogPage(params: { current: number; size: number; jobId: string }) {
	return http.get('/job/sys-job-log/page', { params }) as Promise<{ data: { records: JobLogItem[]; total: number } }>;
}

export async function deleteJobLogs(ids: string[]) {
	return http.delete('/job/sys-job-log', { data: ids });
}
