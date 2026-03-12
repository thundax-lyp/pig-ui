import Cookies from 'js-cookie';

export function getToken() {
	return Cookies.get('token');
}

export function getTenantId() {
	const storageKey = `${__NEXT_NAME__}:tenantId`;
	const localValue = window.localStorage.getItem(storageKey);
	if (!localValue) return '1';

	try {
		return JSON.parse(localValue);
	} catch {
		return '1';
	}
}
