import Cookies from 'js-cookie';

const storageKey = (key: string) => `${__NEXT_NAME__}:${key}`;

export const getToken = () => {
    return Cookies.get('token');
};

export const setToken = (token: string) => {
    Cookies.set('token', token);
};

export const clearToken = () => {
    Cookies.remove('token');
};

export const getRefreshToken = () => {
    return Cookies.get('refresh_token');
};

export const setRefreshToken = (token: string) => {
    Cookies.set('refresh_token', token);
};

export const clearRefreshToken = () => {
    Cookies.remove('refresh_token');
};

export const getBasicAuth = () => {
    return window.sessionStorage.getItem(storageKey('basicAuth'));
};

export const setBasicAuth = (value: string) => {
    window.sessionStorage.setItem(storageKey('basicAuth'), value);
};

export const getSessionValue = <T,>(key: string) => {
    const value = window.sessionStorage.getItem(storageKey(key));
    if (!value) return null;

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

export const setSessionValue = <T,>(key: string, value: T) => {
    window.sessionStorage.setItem(storageKey(key), JSON.stringify(value));
};

export const removeSessionValue = (key: string) => {
    window.sessionStorage.removeItem(storageKey(key));
};

export const clearAuthSession = () => {
    clearToken();
    clearRefreshToken();
    removeSessionValue('basicAuth');
    removeSessionValue('currentUser');
};

export const getTenantId = () => {
    const localValue = window.localStorage.getItem(storageKey('tenantId'));
    if (!localValue) return '1';

    try {
        return JSON.parse(localValue);
    } catch {
        return '1';
    }
};
