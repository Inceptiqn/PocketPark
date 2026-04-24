import { useEffect, useRef, useState } from 'react';
import './search.css';

const GEOCODING_ENDPOINT = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=';
const SEARCH_DEBOUNCE_MS = 1000;

function Search({ onSelect, placeholder = 'Cerca una via o un indirizzo' }) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const debounceRef = useRef(null);
	const requestRef = useRef(0);

	useEffect(() => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}

		if (!query.trim()) {
			setResults([]);
			setLoading(false);
			setError('');
			return undefined;
		}

		setLoading(true);
		setError('');

		debounceRef.current = window.setTimeout(async () => {
			const currentRequestId = requestRef.current + 1;
			requestRef.current = currentRequestId;

			try {
				const response = await fetch(`${GEOCODING_ENDPOINT}${encodeURIComponent(query.trim())}`, {
					headers: {
						'Accept-Language': 'it',
					},
				});

				if (!response.ok) {
					throw new Error('Errore durante la ricerca');
				}

				const data = await response.json();

				if (requestRef.current !== currentRequestId) {
					return;
				}

				setResults(
					data.map((item) => ({
						id: item.place_id,
						name: item.display_name,
						latitude: Number(item.lat),
						longitude: Number(item.lon),
						type: item.type,
					})),
				);
				setLoading(false);
			} catch {
				if (requestRef.current === currentRequestId) {
					setResults([]);
					setLoading(false);
					setError('Nessun risultato trovato');
				}
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) {
				window.clearTimeout(debounceRef.current);
			}
		};
	}, [query]);

	const handleSelect = (item) => {
		setQuery(item.name);
		setResults([]);
		setError('');
		onSelect?.(item);
	};

	return (
		<div className="pp-search" role="search">
			<label className="pp-search__label" htmlFor="pp-map-search">
				Cerca indirizzo
			</label>
			<div className="pp-search__field">
				<input
					id="pp-map-search"
					className="pp-search__input"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder={placeholder}
					autoComplete="off"
					spellCheck="false"
				/>
				{loading ? <span className="pp-search__status">...</span> : null}
			</div>

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
