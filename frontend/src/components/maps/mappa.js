import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getParcheggi } from '../../API';

const DEFAULT_CENTER = [45.4642, 9.19];
const DEFAULT_ZOOM = 13;
const LOCATION_CONSENT_KEY = 'pp_location_consent';
const LAST_LOCATION_KEY = 'pp_last_location';

const parkingStatusConfig = {
	disponibile: { label: 'Disponibile', color: '#2b7cff', pinLabel: 'P' },
	occupato: { label: 'Occupato', color: '#d92d20', pinLabel: 'X' },
	chiuso: { label: 'Chiuso', color: '#6b7280', pinLabel: '!' },
};

export const parkingLegend = Object.entries(parkingStatusConfig).map(([state, config]) => ({
	state,
	label: config.label,
	color: config.color,
}));

function buildParkingIcon({ color, pinLabel }) {
	return L.divIcon({
		className: 'pp-map-marker',
		html: `<div class="pp-map-marker__pin" style="background:${color}"><span>${pinLabel}</span></div>`,
		iconSize: [42, 42],
		iconAnchor: [16, 34],
		popupAnchor: [0, -32],
	});
}

function formatParcheggioAddress(parcheggio) {
	return [parcheggio.via, parcheggio.citta, parcheggio.cap].filter(Boolean).join(', ');
}

function readStoredLocation() {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(LAST_LOCATION_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!Number.isFinite(parsed?.lat) || !Number.isFinite(parsed?.lng)) return null;
		return parsed;
	} catch (error) {
		return null;
	}
}

function writeStoredLocation(location) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
	} catch (error) {
		// Ignore storage errors.
	}
}

function getLocationConsent() {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(LOCATION_CONSENT_KEY);
}

function setLocationConsent(value) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(LOCATION_CONSENT_KEY, value);
}

function getLocationErrorMessage(error) {
	if (!error) return 'Errore durante la geolocalizzazione.';
	if (error.code === 1) return 'Permesso di geolocalizzazione negato.';
	if (error.code === 2) return 'Posizione non disponibile.';
	if (error.code === 3) return 'Timeout della geolocalizzazione.';
	return 'Errore durante la geolocalizzazione.';
}

export function useMappaController() {
	const mapNodeRef = useRef(null);
	const mapRef = useRef(null);
	const markersLayerRef = useRef(null);
	const userMarkerRef = useRef(null);
	const accuracyCircleRef = useRef(null);
	const searchMarkerRef = useRef(null);
	const hasAutoCenteredRef = useRef(false);
	const locateRequestRef = useRef(0);

	const [parcheggi, setParcheggi] = useState([]);
	const [isLoadingParcheggi, setIsLoadingParcheggi] = useState(true);
	const [locationState, setLocationState] = useState('idle');
	const [locationError, setLocationError] = useState('');
	const [showConsentPopup, setShowConsentPopup] = useState(false);

	const initialLocation = useMemo(() => readStoredLocation(), []);

	const updateUserLocation = useCallback((location, mapInstance) => {
		const map = mapInstance || mapRef.current;
		if (!map) return;

		const latLng = [location.lat, location.lng];
		if (!userMarkerRef.current) {
			userMarkerRef.current = L.circleMarker(latLng, {
				radius: 7,
				color: '#1d4ed8',
				weight: 2,
				fillColor: '#3b82f6',
				fillOpacity: 0.9,
			}).addTo(map);
		} else {
			userMarkerRef.current.setLatLng(latLng);
		}

		const accuracy = Number.isFinite(location.accuracy) ? location.accuracy : 0;
		if (accuracy > 0) {
			if (!accuracyCircleRef.current) {
				accuracyCircleRef.current = L.circle(latLng, {
					radius: accuracy,
					color: '#60a5fa',
					weight: 1,
					fillColor: '#93c5fd',
					fillOpacity: 0.2,
				}).addTo(map);
			} else {
				accuracyCircleRef.current.setLatLng(latLng);
				accuracyCircleRef.current.setRadius(accuracy);
			}
		}
	}, []);

	useEffect(() => {
		if (!mapNodeRef.current || mapRef.current) return;

		const map = L.map(mapNodeRef.current, {
			zoomControl: true,
			attributionControl: true,
		}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors',
			maxZoom: 19,
		}).addTo(map);

		markersLayerRef.current = L.layerGroup().addTo(map);
		mapRef.current = map;

		if (initialLocation?.lat && initialLocation?.lng) {
			map.setView([initialLocation.lat, initialLocation.lng], 15);
			updateUserLocation(initialLocation, map);
			hasAutoCenteredRef.current = true;
		}

		requestAnimationFrame(() => {
			map.invalidateSize();
		});

		return () => {
			map.remove();
			mapRef.current = null;
			markersLayerRef.current = null;
		};
	}, [initialLocation, updateUserLocation]);

	useEffect(() => {
		let isMounted = true;

		const loadParcheggi = async () => {
			setIsLoadingParcheggi(true);
			try {
				const data = await getParcheggi();
				if (!isMounted) return;
				setParcheggi(Array.isArray(data) ? data : []);
			} catch (error) {
				if (!isMounted) return;
				setParcheggi([]);
			} finally {
				if (isMounted) {
					setIsLoadingParcheggi(false);
				}
			}
		};

		loadParcheggi();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		const map = mapRef.current;
		const layerGroup = markersLayerRef.current;
		if (!map || !layerGroup) return;

		layerGroup.clearLayers();

		const bounds = [];

		parcheggi.forEach((parcheggio) => {
			if (!Number.isFinite(parcheggio?.lat) || !Number.isFinite(parcheggio?.lng)) return;

			const stateKey = parcheggio.stato || 'disponibile';
			const config = parkingStatusConfig[stateKey] || parkingStatusConfig.disponibile;
			const icon = buildParkingIcon(config);

			const marker = L.marker([parcheggio.lat, parcheggio.lng], { icon });

			const address = formatParcheggioAddress(parcheggio);
			const popupLines = [
				`<strong>${parcheggio.nome || 'Parcheggio'}</strong>`,
				address ? `<div>${address}</div>` : '',
				parcheggio.posti_totali ? `<div>Posti: ${parcheggio.posti_totali}</div>` : '',
			];
			marker.bindPopup(popupLines.filter(Boolean).join(''));

			marker.addTo(layerGroup);
			bounds.push([parcheggio.lat, parcheggio.lng]);
		});

		if (!hasAutoCenteredRef.current && bounds.length > 0) {
			map.fitBounds(bounds, { padding: [40, 40] });
			hasAutoCenteredRef.current = true;
		}
	}, [parcheggi]);

	const requestLocation = useCallback(() => {
		if (!navigator?.geolocation) {
			setLocationState('error');
			setLocationError('Geolocalizzazione non disponibile.');
			return;
		}

		const requestId = locateRequestRef.current + 1;
		locateRequestRef.current = requestId;
		setLocationState('locating');
		setLocationError('');

		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (locateRequestRef.current !== requestId) return;
				const location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					accuracy: position.coords.accuracy,
					timestamp: position.timestamp,
				};

				setLocationState('ready');
				setLocationError('');
				writeStoredLocation(location);
				updateUserLocation(location);

				if (mapRef.current) {
					mapRef.current.setView([location.lat, location.lng], 16);
				}
			},
			(error) => {
				if (locateRequestRef.current !== requestId) return;
				setLocationState('error');
				setLocationError(getLocationErrorMessage(error));
			},
			{ enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
		);
	}, [updateUserLocation]);

	const handleEnableLocation = useCallback(() => {
		setLocationConsent('granted');
		setShowConsentPopup(false);
		requestLocation();
	}, [requestLocation]);

	const handleDismissLocation = useCallback(() => {
		setLocationConsent('denied');
		setShowConsentPopup(false);
	}, []);

	const handleGoToCurrentPosition = useCallback(() => {
		const consent = getLocationConsent();
		if (consent === 'granted') {
			requestLocation();
			return;
		}
		if (consent === 'denied') {
			setLocationState('error');
			setLocationError('Permesso posizione negato nelle preferenze.');
			return;
		}
		setShowConsentPopup(true);
	}, [requestLocation]);

	const handleSearchSelect = useCallback((item) => {
		if (!item || !Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) return;
		const map = mapRef.current;
		if (!map) return;

		const latLng = [item.latitude, item.longitude];
		if (!searchMarkerRef.current) {
			searchMarkerRef.current = L.circleMarker(latLng, {
				radius: 7,
				color: '#111827',
				weight: 2,
				fillColor: '#fbbf24',
				fillOpacity: 0.95,
			}).addTo(map);
		} else {
			searchMarkerRef.current.setLatLng(latLng);
		}
		map.setView(latLng, 16);
	}, []);

	useEffect(() => {
		const consent = getLocationConsent();
		if (!consent && !initialLocation) {
			setShowConsentPopup(true);
		}
	}, [initialLocation]);

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
