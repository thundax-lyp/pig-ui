import axios from 'axios';
import { getTenantId, getToken } from '@/lib/session';

export const http = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 50000,
});

http.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	config.headers['TENANT-ID'] = getTenantId();
	return config;
});

http.interceptors.response.use(
	(response) => response.data,
	(error) => Promise.reject(error.response?.data ?? error)
);
