import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './mappa.css';
import Search from './search';

const LOCATION_CONSENT_COOKIE = 'pp_location_consent';
const LAST_POSITION_COOKIE = 'pp_last_position';
const LOCATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const MIN_CITY_ZOOM = 12;
const BACKEND_URL = 'http://127.0.0.1:5000';

// Mappa degli stati ai colori
const parkingStateColors = {
	disponibile: '#22c55e',  // Verde
	occupato: '#ef4444',      // Rosso
	chiuso: '#9b5cff',        // Viola
};

const parkingLegend = [
	{ state: 'disponibile', label: 'Disponibili', color: parkingStateColors.disponibile },
	{ state: 'occupato', label: 'Occupati', color: parkingStateColors.occupato },
	{ state: 'chiuso', label: 'Chiusi', color: parkingStateColors.chiuso },
];

function getCookie(name) {
	if (typeof document === 'undefined') {
		return '';
	}

	const prefix = `${name}=`;
	const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
	return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

function setCookie(name, value, maxAgeSeconds = LOCATION_COOKIE_MAX_AGE) {
	if (typeof document === 'undefined') {
		return;
	}

	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function parseSavedPosition(rawValue) {
	if (!rawValue) {
		return null;
	}

	const [latitudeRaw, longitudeRaw, accuracyRaw] = rawValue.split(',');
	const latitude = Number(latitudeRaw);
	const longitude = Number(longitudeRaw);
	const accuracy = Number(accuracyRaw);

	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return null;
	}

	return {
		latitude,
		longitude,
		accuracy: Number.isFinite(accuracy) ? accuracy : 25,
	};
}

function createParkingIcon(stato, label) {
	const color = parkingStateColors[stato] || parkingStateColors.disponibile;

	return L.divIcon({
		className: 'pp-map-marker',
		html: `<span class="pp-map-marker__pin" style="background:${color}">${label}</span>`,
		iconSize: [42, 42],
		iconAnchor: [21, 42],
		popupAnchor: [0, -38],
	});
}

function Mappa() {
	const consentCookie = getCookie(LOCATION_CONSENT_COOKIE);
	const mapNodeRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const parkingLayersRef = useRef([]);
	const userLayerRef = useRef(null);
	const [locationState, setLocationState] = useState(
		consentCookie === 'granted' ? 'idle' : consentCookie === 'denied' ? 'dismissed' : 'prompt',
	);
	const [locationError, setLocationError] = useState('');
	const [currentPosition, setCurrentPosition] = useState(() => parseSavedPosition(getCookie(LAST_POSITION_COOKIE)));
	const [parcheggi, setParcheggi] = useState([]);
	const [isLoadingParcheggi, setIsLoadingParcheggi] = useState(true);
	const [mapCenter, setMapCenter] = useState([45.48245, 9.2057]); // Default Milan

	const showConsentPopup = locationState === 'prompt';

	// Fetch parcheggi dal backend
	useEffect(() => {
		const fetchParcheggi = async () => {
			setIsLoadingParcheggi(true);
			try {
				const response = await fetch(`${BACKEND_URL}/api/parcheggi`);
				if (!response.ok) {
					throw new Error(`Errore ${response.status}`);
				}
				const data = await response.json();
				const parcheggiArray = data.parcheggi || [];
				setParcheggi(parcheggiArray);

				// Calcola il centro della mappa basato su tutti i parcheggi
				if (parcheggiArray.length > 0) {
					const validParcheggi = parcheggiArray.filter((p) => p.lat && p.lng);
					if (validParcheggi.length > 0) {
						const avgLat = validParcheggi.reduce((sum, p) => sum + p.lat, 0) / validParcheggi.length;
						const avgLng = validParcheggi.reduce((sum, p) => sum + p.lng, 0) / validParcheggi.length;
						setMapCenter([avgLat, avgLng]);
					}
				}
			} catch (error) {
				console.error('Errore nel caricamento dei parcheggi:', error);
			} finally {
				setIsLoadingParcheggi(false);
			}
		};

		fetchParcheggi();
	}, []);

	// Inizializza la mappa
	useEffect(() => {
		if (!mapNodeRef.current || mapInstanceRef.current) {
			return undefined;
		}

		const map = L.map(mapNodeRef.current, {
			zoomControl: false,
			attributionControl: true,
			minZoom: MIN_CITY_ZOOM,
			maxZoom: 19,
		}).setView(mapCenter, 17);

		mapInstanceRef.current = map;

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: MIN_CITY_ZOOM,
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap contributors',
		}).addTo(map);

		return () => {
			parkingLayersRef.current.forEach((marker) => marker.remove());
			parkingLayersRef.current = [];
			map.remove();
			mapInstanceRef.current = null;
		};
	}, [mapCenter]);

	// Aggiungi i marker dei parcheggi alla mappa
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || parcheggi.length === 0) {
			return;
		}

		// Rimuovi i marker precedenti
		parkingLayersRef.current.forEach((marker) => marker.remove());
		parkingLayersRef.current = [];

		// Aggiungi i nuovi marker
		parcheggi.forEach((parcheggio) => {
			if (!parcheggio.lat || !parcheggio.lng) {
				return; // Salta i parcheggi senza coordinate
			}

			const position = [parcheggio.lat, parcheggio.lng];
			const label = parcheggio.nome.substring(0, 1).toUpperCase();
			const marker = L.marker(position, {
				icon: createParkingIcon(parcheggio.stato, label),
				keyboard: false,
			});

			const popupContent = `<div>
				<strong>${parcheggio.nome}</strong><br />
				Posti: ${parcheggio.posti_totali}<br />
				Stato: ${parcheggio.stato}<br />
				${parcheggio.via ? `Indirizzo: ${parcheggio.via}<br />` : ''}
				${parcheggio.citta ? `${parcheggio.citta}` : ''}
			</div>`;

			marker.bindPopup(popupContent);
			marker.addTo(map);
			parkingLayersRef.current.push(marker);
		});
	}, [parcheggi]);

	// Gestisci la posizione dell'utente
	useEffect(() => {
		const map = mapInstanceRef.current;

		if (!map) {
			return undefined;
		}

		if (userLayerRef.current) {
			userLayerRef.current.remove();
			userLayerRef.current = null;
		}

		if (!currentPosition) {
			return undefined;
		}

		const { latitude, longitude, accuracy } = currentPosition;
		const position = [latitude, longitude];

		const accuracyCircle = L.circle(position, {
			radius: Math.max(accuracy || 25, 18),
			color: '#2563eb',
			weight: 2,
			fillColor: '#60a5fa',
			fillOpacity: 0.18,
		});

		const positionDot = L.circleMarker(position, {
			radius: 7,
			color: '#ffffff',
			weight: 3,
			fillColor: '#2563eb',
			fillOpacity: 1,
		});

		userLayerRef.current = L.layerGroup([accuracyCircle, positionDot]).addTo(map);
		map.setView(position, 18);

		return () => {
			if (userLayerRef.current) {
				userLayerRef.current.remove();
				userLayerRef.current = null;
			}
		};
	}, [currentPosition]);

	const requestCurrentPosition = () => {
		if (!navigator.geolocation) {
			setLocationState('error');
			setLocationError('Il browser non supporta la geolocalizzazione.');
			return;
		}

		setLocationState('locating');
		setLocationError('');

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const savedPosition = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracy: position.coords.accuracy,
				};

				setCurrentPosition(savedPosition);
				setCookie(LOCATION_CONSENT_COOKIE, 'granted');
				setCookie(
					LAST_POSITION_COOKIE,
					`${savedPosition.latitude},${savedPosition.longitude},${savedPosition.accuracy}`,
				);
				setLocationState('ready');
			},
			(error) => {
				setCookie(LOCATION_CONSENT_COOKIE, 'denied');
				setLocationState('error');
				if (error.code === 1) {
					setLocationError('Permesso negato. Puoi attivarlo dal browser e riprovare.');
					return;
				}

				setLocationError('Impossibile ottenere la posizione in questo momento.');
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			},
		);
	};

	const handleEnableLocation = () => {
		requestCurrentPosition();
	};

	const handleDismissLocation = () => {
		setLocationState('dismissed');
		setLocationError('');
		setCookie(LOCATION_CONSENT_COOKIE, 'denied');
	};

	useEffect(() => {
		if (consentCookie === 'granted' && currentPosition) {
			setLocationState('ready');
		}
	}, [consentCookie, currentPosition]);

	const handleGoToCurrentPosition = () => {
		if (currentPosition && mapInstanceRef.current) {
			mapInstanceRef.current.setView([currentPosition.latitude, currentPosition.longitude], 18, { animate: true });
			return;
		}

		requestCurrentPosition();
	};

	const handleSearchSelect = (item) => {
		if (!mapInstanceRef.current) {
			return;
		}

		mapInstanceRef.current.setView([item.latitude, item.longitude], 18, { animate: true });
	};

	return (
		<section className="pp-map-page" aria-label="Mappa parcheggi">
			<header className="pp-map-page__header">
				<div>
					<p className="pp-map-page__eyebrow">Area parcheggi</p>
					<h1 className="pp-map-page__title">Posizione</h1>
				</div>
				<div className="pp-map-page__status">PocketPark</div>
			</header>

			<div className="pp-map-page__legend" aria-label="Legenda parcheggi">
				{parkingLegend.map((item) => (
				<div key={item.state} className="pp-map-page__legend-item">
					</div>
				))}
			</div>

			<Search onSelect={handleSearchSelect} />

			<div className="pp-map-page__map-card">
				<div ref={mapNodeRef} className="pp-map-page__map" aria-label="Mappa reale con parcheggi" />

			{isLoadingParcheggi && (
				<div className="pp-map-page__location-status">Caricamento parcheggi...</div>
			)}

			<button type="button" className="pp-map-page__recenter-fab" onClick={handleGoToCurrentPosition} aria-label="Vai alla mia posizione">
				<img
					className="pp-map-page__recenter-icon"
					src="https://www.svgrepo.com/show/535486/location-target.svg"
					alt=""
					aria-hidden="true"
				/>
			</button>

				{locationState === 'locating' ? (
					<div className="pp-map-page__location-status">Sto cercando la tua posizione...</div>
				) : null}

				{locationState === 'error' && locationError ? (
					<div className="pp-map-page__location-status is-error">{locationError}</div>
				) : null}
			</div>

			{showConsentPopup ? (
				<div className="pp-map-page__permission-backdrop" role="dialog" aria-modal="true" aria-label="Permesso posizione">
					<div className="pp-map-page__permission-modal">
						<p className="pp-map-page__permission-title">Vuoi attivare la geolocalizzazione?</p>
						<p className="pp-map-page__permission-text">
							Ti chiediamo il consenso una sola volta. Poi salviamo la scelta e l'ultima posizione nei cookie.
						</p>
						<div className="pp-map-page__permission-actions">
							<button type="button" className="pp-map-page__location-button pp-map-page__location-button--ghost" onClick={handleDismissLocation}>
								Non ora
							</button>
							<button type="button" className="pp-map-page__location-button" onClick={handleEnableLocation}>
								Consenti
							</button>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}

export default Mappa;
