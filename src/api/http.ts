import axios from 'axios';
import { clearAuthSession, getTenantId, getToken } from '@/lib/session';

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
});

let isRedirectingToLogin = false;

function redirectToLogin() {
    if (typeof window === 'undefined') return;
    if (isRedirectingToLogin) return;
    if (window.location.pathname === '/login') return;

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    isRedirectingToLogin = true;
    clearAuthSession();
    window.location.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
}

function isTokenExpiredResponse(status?: number, data?: { code?: number | string; msg?: string; message?: string }) {
    if (status === 401 || status === 424) return true;

    const code = data?.code;
    if (code === 1 || code === '1' || code === 401 || code === '401' || code === 424 || code === '424') return true;

    const message = `${data?.msg ?? data?.message ?? ''}`.toLowerCase();
    return [
        'token',
        'expired',
        'unauthorized',
        'invalid_token',
        'full authentication',
        '令牌',
        '过期',
        '重新登录',
        '登录已过期',
    ].some((keyword) => message.includes(keyword));
}

http.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['TENANT-ID'] = getTenantId();
    return config;
});

http.interceptors.response.use(
    (response) => {
        if (isTokenExpiredResponse(response.status, response.data)) {
            redirectToLogin();
            return Promise.reject(response.data);
        }

        if (response.data?.code === 1 || response.data?.code === '1') {
            return Promise.reject(response.data);
        }

        return response.data;
    },
    (error) => {
        const responseData = error.response?.data;
        if (isTokenExpiredResponse(error.response?.status, responseData)) {
            redirectToLogin();
        }

        return Promise.reject(responseData ?? error);
    }
);
