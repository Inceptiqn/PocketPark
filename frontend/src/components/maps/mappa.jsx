import './mappa.css';
import Search from './search.jsx';
import { parkingLegend, useMappaController } from './mappa.js';

function Mappa() {
	const {
		mapNodeRef,
		isLoadingParcheggi,
		locationState,
		locationError,
		showConsentPopup,
		handleGoToCurrentPosition,
		handleSearchSelect,
		handleEnableLocation,
		handleDismissLocation,
	} = useMappaController();

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
						<span className="pp-map-page__legend-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
						<span>{item.label}</span>
					</div>
				))}
			</div>

			<div className="pp-map-page__map-card">
				<div ref={mapNodeRef} className="pp-map-page__map" aria-label="Mappa reale con parcheggi" />
				<Search onSelect={handleSearchSelect} />

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

				{locationState === 'locating' && (
					<div className="pp-map-page__location-status">Sto cercando la tua posizione...</div>
				)}

				{locationState === 'error' && locationError && (
					<div className="pp-map-page__location-status is-error">{locationError}</div>
				)}
			</div>

			{showConsentPopup && (
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
			)}
		</section>
	);
}

export default Mappa;
