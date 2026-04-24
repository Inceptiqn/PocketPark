import { useCallback, useEffect, useRef, useState } from 'react';
import './search.css';

const GEOCODING_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 8;

function normalizeQuery(value) {
        return value.trim().replace(/\s+/g, ' ');
}

function parseAddress(query) {
	// Estrae numero civico dal formato "Via Roma 42"
	// Usa regex per separare strada e numero civico
	const match = query.match(/^(.+?)\s+(\d+)(?:[a-zA-Z])?(?:\s|,|$)/i);
	if (match) {
		const [, street, number] = match;
		return { street: street.trim(), number, hasNumber: true };
	}
	return { fullQuery: query, hasNumber: false };
}

function buildSearchUrl(query, useStructured = false) {
	if (useStructured) {
		const { street, number, hasNumber } = parseAddress(query);
		// Se rileva numero civico, usa parametri strutturati
		if (hasNumber && street && number) {
			const params = new URLSearchParams({
				format: 'jsonv2',
				addressdetails: '1',
				limit: String(SEARCH_LIMIT),
				countrycodes: 'it',
				dedupe: '1',
				street: `${street} ${number}`,
				city: 'Brescia',
			});
			return `${GEOCODING_ENDPOINT}?${params.toString()}`;
		}
	}
	// Ricerca normale per testo libero
        const params = new URLSearchParams({
                format: 'jsonv2',
                addressdetails: '1',
                limit: String(SEARCH_LIMIT),
                countrycodes: 'it',
                dedupe: '1',
                q: query,
        });

        return `${GEOCODING_ENDPOINT}?${params.toString()}`;
}

function buildFallbackQueries(rawQuery) {
        const base = normalizeQuery(rawQuery);
        const normalized = base.toLowerCase();
        const fallbacks = [base];

        if (!normalized.includes('brescia')) {
                fallbacks.push(`${base}, Brescia`);
                fallbacks.push(`${base}, Provincia di Brescia`);
        }

        if (!normalized.includes('lombardia')) {
                fallbacks.push(`${base}, Lombardia`);
        }

        if (!normalized.includes('italia')) {
                fallbacks.push(`${base}, Italia`);
        }

        return [...new Set(fallbacks)];
}

function mapResults(data) {
        return data.map((item) => ({
                id: item.place_id,
                name: item.display_name,
                latitude: Number(item.lat),
                longitude: Number(item.lon),
                type: item.type,
        }));
}

function Search({ onSelect, placeholder = 'Cerca una via o un indirizzo' }) {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const debounceRef = useRef(null);
        const controllerRef = useRef(null);
        const requestRef = useRef(0);

        const runSearch = useCallback(async (rawQuery) => {
                const searchText = normalizeQuery(rawQuery);

                if (!searchText) {
                        setResults([]);
                        setLoading(false);
                        setError('');
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
			let mapped = [];
			const addressInfo = parseAddress(searchText);

			// Se contiene numero civico, prova prima con ricerca strutturata
			if (addressInfo.hasNumber) {
				try {
					const response = await fetch(buildSearchUrl(searchText, true), {
						signal: controller.signal,
						headers: {
							'Accept-Language': 'it,en',
						},
					});

					if (response.ok) {
						const data = await response.json();
						mapped = mapResults(data);
						if (mapped.length > 0) {
							if (requestRef.current !== requestId) return;
							setResults(mapped);
							setError('');
							setLoading(false);
							return;
						}
					}
				} catch (e) {
					// Continua al fallback se fallisce
					if (e?.name === 'AbortError') throw e;
				}
			}

			// Fallback: prova varie varianti di query
			for (const candidate of buildFallbackQueries(searchText)) {
				const response = await fetch(buildSearchUrl(candidate, false), {
					signal: controller.signal,
					headers: {
						'Accept-Language': 'it,en',
					},
				});

				if (!response.ok) {
					continue;
				}

				const data = await response.json();
				mapped = mapResults(data);

				if (mapped.length > 0) {
					break;
				}
			}

			if (requestRef.current !== requestId) {
				return;
			}

			setResults(mapped);
			setError(mapped.length === 0 ? 'Nessun risultato. Prova a inserire anche citta o CAP.' : '');
		} catch (fetchError) {
			if (fetchError?.name === 'AbortError') {
				return;
			}

			if (requestRef.current === requestId) {
				setResults([]);
				setError('Errore di rete durante la ricerca.');
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

        return (
                <div className="pp-search" role="search">
                        <label className="pp-search__label" htmlFor="pp-map-search">
                                Cerca indirizzo
                        </label>
                        <form className="pp-search__field" onSubmit={handleSubmit}>
                                <input
                                        id="pp-map-search"
                                        className="pp-search__input"
                                        type="search"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        autoComplete="off"
                                        spellCheck="false"
                                />
                                <button type="submit" className="pp-search__submit" aria-label="Cerca indirizzo" onClick={executeImmediateSearch}>
                                        🔍
                                </button>
                                {loading ? <span className="pp-search__status">...</span> : null}
                        </form>

                        {error && !loading ? <p className="pp-search__message">{error}</p> : null}

                        {results.length > 0 ? (
                                <ul className="pp-search__results" aria-label="Suggerimenti indirizzi">
                                        {results.map((item) => (
                                                <li key={item.id}>
                                                        <button type="button" className="pp-search__result" onClick={() => handleSelect(item)}>
                                                                <span className="pp-search__result-title">{item.name}</span>
                                                                <span className="pp-search__result-meta">{item.type}</span>
                                                        </button>
                                                </li>
                                        ))}
                                </ul>
                        ) : null}
                </div>
        );
}

export default Search;
