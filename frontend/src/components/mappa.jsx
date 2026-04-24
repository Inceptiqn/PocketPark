import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './mappa.css';
import { mapCenter, parkingLegend, parkingSpots, parkingTypeColors } from './mappa-data';

function createParkingIcon(type, label) {
	const color = parkingTypeColors[type] || parkingTypeColors.normal;

	return L.divIcon({
		className: 'pp-map-marker',
		html: `<span class="pp-map-marker__pin" style="background:${color}">${label}</span>`,
		iconSize: [42, 42],
		iconAnchor: [21, 42],
		popupAnchor: [0, -38],
	});
}

function Mappa() {
	const mapNodeRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const parkingLayersRef = useRef([]);
	const userLayerRef = useRef(null);
	const [locationState, setLocationState] = useState('prompt');
	const [locationError, setLocationError] = useState('');
	const [currentPosition, setCurrentPosition] = useState(null);

	const center = useMemo(() => mapCenter, []);
	const showConsentPopup = locationState === 'prompt';
	const showLocationAction = locationState === 'error' || locationState === 'dismissed';

	useEffect(() => {
		if (!mapNodeRef.current || mapInstanceRef.current) {
			return undefined;
		}

		const map = L.map(mapNodeRef.current, {
			zoomControl: false,
			attributionControl: true,
		}).setView(center, 17);

		mapInstanceRef.current = map;

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap contributors',
		}).addTo(map);

		parkingLayersRef.current = parkingSpots.map((spot) => {
			const marker = L.marker(spot.position, {
				icon: createParkingIcon(spot.type, spot.label),
				keyboard: false,
			});

			marker.bindPopup(`<strong>${spot.label}</strong><br />${spot.type}`);
			marker.addTo(map);
			return marker;
		});

		return () => {
			parkingLayersRef.current.forEach((marker) => marker.remove());
			parkingLayersRef.current = [];
			map.remove();
			mapInstanceRef.current = null;
		};
	}, [center]);

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

	const handleEnableLocation = () => {
		if (!navigator.geolocation) {
			setLocationState('error');
			setLocationError('Il browser non supporta la geolocalizzazione.');
			return;
		}

		setLocationState('locating');
		setLocationError('');

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setCurrentPosition({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracy: position.coords.accuracy,
				});
				setLocationState('ready');
			},
			(error) => {
				setCurrentPosition(null);
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

	const handleDismissLocation = () => {
		setLocationState('dismissed');
		setLocationError('');
	};

	return (
		<section className="pp-map-page" aria-label="Mappa parcheggi">
			<header className="pp-map-page__header">
				<div>
					<p className="pp-map-page__eyebrow">Area parcheggi</p>
					<h1 className="pp-map-page__title">Posizione</h1>
				</div>
				<div className="pp-map-page__status">OpenStreetMap</div>
			</header>

			<div className="pp-map-page__legend" aria-label="Legenda parcheggi">
				{parkingLegend.map((item) => (
					<div key={item.type} className="pp-map-page__legend-item">
						<span className="pp-map-page__legend-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
						<span>{item.label}</span>
					</div>
				))}
			</div>

			<div className="pp-map-page__map-card">
				<div ref={mapNodeRef} className="pp-map-page__map" aria-label="Mappa reale con parcheggi" />

				{showConsentPopup ? (
					<div className="pp-map-page__location-popup" role="dialog" aria-modal="true" aria-label="Usa la tua posizione">
						<div>
							<p className="pp-map-page__location-popup-title">Usare la tua posizione?</p>
							<p className="pp-map-page__location-popup-text">
								Se autorizzi, mostro la tua posizione sulla mappa per confrontarla con i parcheggi vicini.
							</p>
						</div>
						<div className="pp-map-page__location-popup-actions">
							<button type="button" className="pp-map-page__location-button pp-map-page__location-button--ghost" onClick={handleDismissLocation}>
								Non ora
							</button>
							<button type="button" className="pp-map-page__location-button" onClick={handleEnableLocation}>
								Consenti
							</button>
						</div>
					</div>
				) : null}

				{showLocationAction ? (
					<button type="button" className="pp-map-page__location-fab" onClick={handleEnableLocation}>
						Usa posizione
					</button>
				) : null}

				{locationState === 'locating' ? (
					<div className="pp-map-page__location-status">Sto cercando la tua posizione...</div>
				) : null}

				{locationState === 'error' && locationError ? (
					<div className="pp-map-page__location-status is-error">{locationError}</div>
				) : null}

				<div className="pp-map-page__pin-card">
					<span className="pp-map-page__pin-icon" aria-hidden="true">
						⌖
					</span>
					<div>
						<p className="pp-map-page__pin-title">Via Benedetto Marcello 26B</p>
						<p className="pp-map-page__pin-text">
							{currentPosition ? 'La tua posizione è visibile sulla mappa' : 'Parcheggi reali sovrapposti su mappa OSM'}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Mappa;
