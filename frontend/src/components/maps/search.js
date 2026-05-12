import { useCallback, useEffect, useRef, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 150;
const SEARCH_LIMIT = 5;
const SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const PHOTON_ENDPOINT = 'https://photon.komoot.io/api/';

function normalizeQuery(value) {
	return value.trim().replace(/\s+/g, ' ');
}

function buildSearchUrl(query) {
	const params = new URLSearchParams({
		q: query,
		format: 'json',
		addressdetails: '1',
		limit: String(SEARCH_LIMIT),
		'accept-language': 'it',
	});

	return `${SEARCH_ENDPOINT}?${params.toString()}`;
}

function buildPhotonUrl(query) {
	const params = new URLSearchParams({
		q: query,
		limit: String(SEARCH_LIMIT),
		lang: 'it',
	});

	return `${PHOTON_ENDPOINT}?${params.toString()}`;
}


function mapResults(data) {
	const items = Array.isArray(data) ? data : [];

	return items
		.map((item) => {
			const address = item.address || {};
			const nameParts = [
				address.road || address.pedestrian || address.footway || address.cycleway,
				address.house_number,
				address.postcode,
				address.city || address.town || address.village || address.state,
				address.country,
			].filter(Boolean);

			return {
				id: item.place_id,
				name: nameParts.length > 0 ? nameParts.join(', ') : item.display_name,
				latitude: Number(item.lat),
				longitude: Number(item.lon),
				type: item.type || item.class || 'indirizzo',
			};
		})
		.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}

function mapPhotonResults(data) {
	const features = Array.isArray(data?.features) ? data.features : [];

	return features
		.map((feature) => {
			const properties = feature.properties || {};
			const coordinates = feature.geometry?.coordinates || [];
			const nameParts = [
				properties.name,
				properties.street,
				properties.housenumber,
				properties.postcode,
				properties.city || properties.state,
				properties.country,
			].filter(Boolean);

			return {
				id: properties.osm_id || feature.id,
				name: nameParts.join(', '),
				latitude: Number(coordinates[1]),
				longitude: Number(coordinates[0]),
				type: properties.osm_type || properties.type || 'indirizzo',
			};
		})
		.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}


export function useSearchController({ onSelect } = {}) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const debounceRef = useRef(null);
	const controllerRef = useRef(null);
	const requestRef = useRef(0);
	const cacheRef = useRef(new Map());

	const runSearch = useCallback(async (rawQuery) => {
		const searchText = normalizeQuery(rawQuery);

		if (!searchText) {
			setResults([]);
			setLoading(false);
			setError('');
			return;
		}

		if (searchText.length < 3) {
			setResults([]);
			setLoading(false);
			setError('Inserisci almeno 3 caratteri.');
			return;
		}

		const cachedResults = cacheRef.current.get(searchText.toLowerCase());
		if (cachedResults) {
			setResults(cachedResults);
			setError('');
			setLoading(false);
			return;
		}

		const requestId = requestRef.current + 1;
		requestRef.current = requestId;

		if (controllerRef.current) {
			controllerRef.current.abort();
		}

		const controller = new AbortController();
		controllerRef.current = controller;

		setLoading(true);
		setError('');

		try {
			const response = await fetch(buildSearchUrl(searchText), {
				signal: controller.signal,
				headers: { 'Accept-Language': 'it' },
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			const mapped = mapResults(data);

			if (requestRef.current !== requestId) return;

			setResults(mapped);
			cacheRef.current.set(searchText.toLowerCase(), mapped);
			setError(mapped.length === 0 ? 'Nessun risultato. Prova a inserire anche citta o CAP.' : '');
		} catch (fetchError) {
			if (fetchError?.name === 'AbortError') return;

			try {
				const photonResponse = await fetch(buildPhotonUrl(searchText), {
					signal: controller.signal,
					headers: { 'Accept-Language': 'it' },
				});

				if (!photonResponse.ok) {
					throw new Error(`HTTP ${photonResponse.status}`);
				}

				const photonData = await photonResponse.json();
				const mapped = mapPhotonResults(photonData);

				if (requestRef.current !== requestId) return;

				setResults(mapped);
				cacheRef.current.set(searchText.toLowerCase(), mapped);
				setError(mapped.length === 0 ? 'Nessun risultato. Prova a inserire anche citta o CAP.' : '');
			} catch (fallbackError) {
				if (fallbackError?.name === 'AbortError') return;
				if (requestRef.current === requestId) {
					setResults([]);
					setError('Errore di rete durante la ricerca.');
				}
			}
		} finally {
			if (requestRef.current === requestId) {
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}

		if (!normalizeQuery(query)) {
			setResults([]);
			setLoading(false);
			setError('');
			if (controllerRef.current) {
				controllerRef.current.abort();
			}
			return undefined;
		}

		debounceRef.current = window.setTimeout(() => {
			runSearch(query);
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) {
				window.clearTimeout(debounceRef.current);
			}
		};
	}, [query, runSearch]);

	useEffect(() => {
		return () => {
			if (controllerRef.current) {
				controllerRef.current.abort();
			}
		};
	}, []);

	const handleSelect = (item) => {
		setQuery(item.name);
		setResults([]);
		setError('');
		onSelect?.(item);
	};

	const executeImmediateSearch = () => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}

		runSearch(query);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		executeImmediateSearch();
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			executeImmediateSearch();
		}
	};

	return {
		query,
		setQuery,
		results,
		loading,
		error,
		handleSelect,
		handleSubmit,
		handleKeyDown,
		executeImmediateSearch,
	};
}