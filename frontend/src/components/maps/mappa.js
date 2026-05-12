import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getParcheggi } from '../../API';

const LOCATION_CONSENT_COOKIE = 'pp_location_consent';
const MIN_CITY_ZOOM = 12;
const DEFAULT_CENTER = [45.48245, 9.2057];

const parkingStateColors = {
	disponibile: '#22c55e',
	occupato: '#ef4444',
	chiuso: '#9b5cff',
};

export const parkingLegend = [
	{ state: 'disponibile', label: 'Disponibili', color: parkingStateColors.disponibile },
	{ state: 'occupato', label: 'Occupati', color: parkingStateColors.occupato },
	{ state: 'chiuso', label: 'Chiusi', color: parkingStateColors.chiuso },
];

function getCookie(name) {
	if (typeof document === 'undefined') return '';
	const prefix = `${name}=`;
	const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
	return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

function setCookie(name, value) {
	if (typeof document === 'undefined') return;
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
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

export function useMappaController() {
	const mapNodeRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const parkingLayerRef = useRef(L.layerGroup());
	const userLayerRef = useRef(null);
	const watchIdRef = useRef(null);

	const [locationState, setLocationState] = useState(() => {
		const consent = getCookie(LOCATION_CONSENT_COOKIE);
		return consent === 'granted' ? 'granted' : consent === 'denied' ? 'dismissed' : 'prompt';
	});
	const [locationError, setLocationError] = useState('');
	const [currentPosition, setCurrentPosition] = useState(null);
	const [parcheggi, setParcheggi] = useState([]);
	const [isLoadingParcheggi, setIsLoadingParcheggi] = useState(true);
	const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

	const showConsentPopup = locationState === 'prompt';

	useEffect(() => {
		const loadParcheggi = async () => {
			try {
				const data = await getParcheggi();
				const valid = Array.isArray(data) ? data.filter((item) => item?.lat && item?.lng) : [];
				setParcheggi(valid);

				if (valid.length > 0) {
					const avgLat = valid.reduce((sum, item) => sum + item.lat, 0) / valid.length;
					const avgLng = valid.reduce((sum, item) => sum + item.lng, 0) / valid.length;
					setMapCenter([avgLat, avgLng]);
				}
			} catch (error) {
				console.warn('Caricamento parcheggi non disponibile:', error);
				setParcheggi([]);
			} finally {
				setIsLoadingParcheggi(false);
			}
		};

		loadParcheggi();
	}, []);

	useEffect(() => {
		if (!mapNodeRef.current || mapInstanceRef.current) return undefined;

		const map = L.map(mapNodeRef.current, {
			zoomControl: false,
			attributionControl: true,
			minZoom: MIN_CITY_ZOOM,
			maxZoom: 19,
		}).setView(mapCenter, 17);

		mapInstanceRef.current = map;
		parkingLayerRef.current.addTo(map);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: MIN_CITY_ZOOM,
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap contributors',
		}).addTo(map);

		return () => {
			parkingLayerRef.current.remove();
			if (userLayerRef.current) {
				userLayerRef.current.remove();
				userLayerRef.current = null;
			}
			map.remove();
			mapInstanceRef.current = null;
		};
	}, [mapCenter]);

	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map) return;

		if (!currentPosition) return;

		if (userLayerRef.current) {
			userLayerRef.current.remove();
		}

		const { latitude, longitude, accuracy } = currentPosition;
		const position = [latitude, longitude];

		userLayerRef.current = L.layerGroup([
			L.circle(position, {
				radius: Math.max(accuracy || 25, 18),
				color: '#2563eb',
				weight: 2,
				fillColor: '#60a5fa',
				fillOpacity: 0.18,
			}),
			L.circleMarker(position, {
				radius: 7,
				color: '#ffffff',
				weight: 3,
				fillColor: '#2563eb',
				fillOpacity: 1,
			}),
		]).addTo(map);

		map.setView(position, 18, { animate: true });
	}, [currentPosition]);

	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map) return;

		parkingLayerRef.current.clearLayers();

		parcheggi.forEach((parcheggio) => {
			const label = (parcheggio.nome || '?').substring(0, 1).toUpperCase();
			const marker = L.marker([parcheggio.lat, parcheggio.lng], {
				icon: createParkingIcon(parcheggio.stato, label),
				keyboard: false,
			});

			marker.bindPopup(`
				<div>
					<strong>${parcheggio.nome || 'Parcheggio'}</strong><br />
					Posti: ${parcheggio.posti_totali ?? '-'}<br />
					Stato: ${parcheggio.stato || '-'}<br />
					${parcheggio.via ? `Indirizzo: ${parcheggio.via}<br />` : ''}
					${parcheggio.citta ? `${parcheggio.citta}` : ''}
				</div>
			`);

			marker.addTo(parkingLayerRef.current);
		});
	}, [parcheggi]);

	useEffect(() => {
		if (locationState !== 'granted') return undefined;
		if (!navigator.geolocation) {
			setLocationState('error');
			setLocationError('Geolocalizzazione non supportata.');
			return undefined;
		}

		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
		}

		watchIdRef.current = navigator.geolocation.watchPosition(
			(position) => {
				setCurrentPosition({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracy: position.coords.accuracy,
				});
				setLocationError('');
			},
			(error) => {
				setLocationState('error');
				setLocationError(error.code === 1 ? 'Permesso negato.' : 'Impossibile ottenere la posizione.');
			},
			{ enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
		);

		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};
	}, [locationState]);

	useEffect(() => {
		if (!mapInstanceRef.current) return;
		if (locationState === 'granted') {
			mapInstanceRef.current.setView(mapCenter, 17);
		}
	}, [mapCenter, locationState]);

	const handleEnableLocation = () => {
		setCookie(LOCATION_CONSENT_COOKIE, 'granted');
		setLocationState('granted');
	};

	const handleDismissLocation = () => {
		setCookie(LOCATION_CONSENT_COOKIE, 'denied');
		setLocationState('dismissed');
		setLocationError('');
	};

	const handleGoToCurrentPosition = () => {
		if (!currentPosition || !mapInstanceRef.current) return;
		mapInstanceRef.current.setView([currentPosition.latitude, currentPosition.longitude], 18, { animate: true });
	};

	const handleSearchSelect = (item) => {
		if (!mapInstanceRef.current) return;
		mapInstanceRef.current.setView([item.latitude, item.longitude], 18, { animate: true });
	};

	useEffect(() => {
		return () => {
			if (watchIdRef.current !== null && navigator.geolocation) {
				navigator.geolocation.clearWatch(watchIdRef.current);
				watchIdRef.current = null;
			}
		};
	}, []);

	return {
		mapNodeRef,
		isLoadingParcheggi,
		locationState,
		locationError,
		showConsentPopup,
		handleGoToCurrentPosition,
		handleSearchSelect,
		handleEnableLocation,
		handleDismissLocation,
	};
}