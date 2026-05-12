const DEFAULT_BASE_URL = 'http://127.0.0.1:5000';
const USER_ID_STORAGE_KEY = 'pp_user_id';
const AUTH_TOKEN_STORAGE_KEY = 'pp_auth_token';

function getBaseUrl() {
	return import.meta?.env?.VITE_API_URL || DEFAULT_BASE_URL;
}

async function requestJson(path, options = {}) {
	const response = await fetch(`${getBaseUrl()}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	});

	if (!response.ok) {
		const message = `API error ${response.status} for ${path}`;
		throw new Error(message);
	}

	return response.json();
}

export async function getParcheggi() {
	const data = await requestJson('/api/parcheggi');
	return data.parcheggi || [];
}

export async function getVeicoli() {
	const data = await requestJson('/api/veicoli');
	return data.veicoli || [];
}

export async function getUsers() {
	const data = await requestJson('/api/users');
	return data.users || [];
}

export async function getTariffe() {
	const data = await requestJson('/api/tariffe');
	return data.tariffe || [];
}

export async function getPrenotazioni() {
	const data = await requestJson('/api/prenotazioni');
	return data.prenotazioni || [];
}

export async function getVeicoliByUtenteId(utenteId) {
	if (!utenteId) {
		return [];
	}
	const veicoli = await getVeicoli();
	return veicoli.filter((item) => item.utente_id === utenteId);
}

export async function getPrenotazioniByUtenteId(utenteId) {
	if (!utenteId) {
		return [];
	}
	const prenotazioni = await getPrenotazioni();
	return prenotazioni.filter((item) => item.utente_id === utenteId);
}

export function getCurrentUserId() {
	if (typeof window === 'undefined') {
		return '';
	}
	const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
	if (!token) {
		return '';
	}
	return localStorage.getItem(USER_ID_STORAGE_KEY) || '';
}

export async function login(email, password) {
	const res = await fetch(`${getBaseUrl()}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `login failed ${res.status}`);
	}
	const data = await res.json();
	localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
	localStorage.setItem(USER_ID_STORAGE_KEY, data.user.id);
	return data.user;
}

export function logout() {
	localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
	localStorage.removeItem(USER_ID_STORAGE_KEY);
}

export async function validateToken(token) {
	const res = await fetch(`${getBaseUrl()}/api/auth/validate?token=${encodeURIComponent(token)}`);
	if (!res.ok) return { valid: false };
	return res.json();
}

export async function createVeicolo(payload) {
	const data = await requestJson('/api/veicoli', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return data.veicolo;
}

export async function createPrenotazione(payload) {
	const data = await requestJson('/api/prenotazioni', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return data.prenotazione;
}

export async function getUserById(userId) {
	const data = await requestJson(`/api/users/${userId}`);
	return data.user || null;
}

export async function updateUser(userId, payload) {
	const data = await requestJson(`/api/users/${userId}`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	});
	return data.user;
}

export async function createUser(payload) {
	const data = await requestJson('/api/users', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	return data.user;
}
