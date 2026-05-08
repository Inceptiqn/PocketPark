const DEFAULT_BASE_URL = 'http://127.0.0.1:5000';

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
