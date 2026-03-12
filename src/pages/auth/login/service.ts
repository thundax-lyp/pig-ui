import CryptoJS from 'crypto-js';
import { http } from '@/api/http';
import { getBasicAuth, setBasicAuth } from '@/lib/session';
import type { CurrentUserInfo, MobileLoginPayload, OAuthTokenResponse, PasswordLoginPayload, RegisterPayload } from './types';

const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

const isMicro = () => String(import.meta.env.VITE_IS_MICRO ?? '').trim() !== 'false';
const getServicePrefix = () => isMicro() ? '/auth' : '/admin';


function buildBasicAuth(client: string) {
    return `Basic ${window.btoa(client)}`;
}

function extractClientId(client: string) {
    return client.split(':')[0]?.trim() ?? '';
}

function encryptPassword(password: string) {
    const keyWord = import.meta.env.VITE_PWD_ENC_KEY?.replace(/^['"]|['"]$/g, '');
    if (!keyWord) return password;

    const key = CryptoJS.enc.Utf8.parse(keyWord);
    return CryptoJS.AES.encrypt(password, key, {
        iv: key,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding,
    }).toString();
}

function toFormData(payload: Record<string, string>) {
    const form = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            form.append(key, value);
        }
    });
    return form;
}

export const generateRandomStr = () => {
    if (typeof crypto === 'object') {
        if (typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
            const callback = (value: string) => {
                const num = Number(value);
                return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
            };
            return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback);
        }
    }

    let timestamp = new Date().getTime();
    let performanceNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        let random = Math.random() * 16;
        if (timestamp > 0) {
            random = (timestamp + random) % 16 | 0;
            timestamp = Math.floor(timestamp / 16);
        } else {
            random = (performanceNow + random) % 16 | 0;
            performanceNow = Math.floor(performanceNow / 16);
        }
        return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });
};

export const buildVerifyCodeUrl = (randomStr: string) => {
    const apiBase = String(import.meta.env.VITE_API_URL ?? '')
        .trim()
        .replace(/\/$/, '');
    const servicePrefix = getServicePrefix();
    const query = new URLSearchParams({
        randomStr,
    });
    return `${apiBase}${servicePrefix}/code/image?${query.toString()}`;
};

export async function loginByPassword(payload: PasswordLoginPayload): Promise<OAuthTokenResponse> {
    const passwordClient = String(import.meta.env.VITE_OAUTH2_PASSWORD_CLIENT).replace(/^['"]|['"]$/g, '');
    const basicAuth = buildBasicAuth(passwordClient);
    setBasicAuth(basicAuth);

    const servicePrefix = getServicePrefix();
    return http.post(
        `${servicePrefix}/oauth2/token`,
        toFormData({
            ...payload,
            password: encryptPassword(payload.password),
            grant_type: 'password',
        } as Record<string, string>),
        {
            headers: {
                skipToken: true,
                Authorization: basicAuth,
                'Content-Type': FORM_CONTENT_TYPE,
            },
        }
    ) as Promise<OAuthTokenResponse>;
}

export async function loginByMobile(payload: MobileLoginPayload): Promise<OAuthTokenResponse> {
    const mobileClient = String(import.meta.env.VITE_OAUTH2_MOBILE_CLIENT).replace(/^['"]|['"]$/g, '');
    const basicAuth = buildBasicAuth(mobileClient);
    const clientId = extractClientId(mobileClient);
    setBasicAuth(basicAuth);

    return http.post(
        '/auth/oauth2/token',
        toFormData({
            client_id: clientId,
            mobile: payload.mobile,
            code: payload.code,
            grant_type: 'mobile',
            scope: 'server',
        }),
        {
            headers: {
                Authorization: basicAuth,
                'Content-Type': FORM_CONTENT_TYPE,
            },
        }
    ) as Promise<OAuthTokenResponse>;
}

export async function refreshTokenRequest(refreshToken: string): Promise<OAuthTokenResponse> {
    const basicAuth = getBasicAuth();
    const basicClient = basicAuth ? window.atob(basicAuth.replace(/^Basic\s+/i, '')) : '';
    const clientId = extractClientId(basicClient);
    return http.post(
        '/auth/oauth2/token',
        toFormData({
            client_id: clientId,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            scope: 'server',
        }),
        {
            headers: {
                Authorization: basicAuth ?? '',
                'Content-Type': FORM_CONTENT_TYPE,
            },
        }
    ) as Promise<OAuthTokenResponse>;
}

export async function fetchCurrentUserInfo() {
    return http.get('/admin/user/info') as Promise<{ data: CurrentUserInfo }>;
}

export async function sendMobileCode(mobile: string) {
    return http.get(`/admin/mobile/${mobile}`) as Promise<{ data: boolean; msg?: string }>;
}

export async function registerUser(payload: RegisterPayload) {
    return http.post('/admin/register/user', payload);
}

export async function logoutRequest() {
    return http.delete('/auth/token/logout');
}
