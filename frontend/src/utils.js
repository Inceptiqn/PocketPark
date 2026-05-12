export function getBaseUrl() {
    return import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:5000';
}

export function getAuthToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('pp_auth_token') : null;
}

export function isLoggedIn() {
    return !!getAuthToken();
}
