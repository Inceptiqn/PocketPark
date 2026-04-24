import Vehicle from './vehicle.jsx';
import './dashboard-card.css';

function DashboardCard({
	vehicleType = 'motorcycle',
	vehicleName = 'SUZUKI JABUBU 3',
	plate = 'TT 678 RR',
	address = 'Via Benedetto Marcello 26B',
	parkingType = 'Moto',
	onStop,
}) {
	return (
		<article className="pp-dashboard-card" aria-label="Parcheggio attivo">
			<header className="pp-dashboard-card__top">
				<Vehicle type={vehicleType} size="small" className="pp-dashboard-card__vehicle" />
				<div className="pp-dashboard-card__vehicle-info">
					<h2 className="pp-dashboard-card__title">{vehicleName}</h2>
					<p className="pp-dashboard-card__plate">{plate}</p>
				</div>
			</header>

			<div className="pp-dashboard-card__address-row">
				<p className="pp-dashboard-card__address">{address}</p>
				<img
					className="pp-dashboard-card__location"
					src="https://www.svgrepo.com/show/532548/map-pin-alt.svg"
					alt="Posizione"
				/>
			</div>

			<footer className="pp-dashboard-card__bottom">
				<div className="pp-dashboard-card__parking-type">
					<span className="pp-dashboard-card__parking-badge" aria-hidden="true">
						P
					</span>
					<span className="pp-dashboard-card__parking-label">{parkingType}</span>
				</div>

				<button type="button" className="pp-dashboard-card__stop-button" onClick={onStop}>
					Termina
				</button>
			</footer>
		</article>
	);
}

export default DashboardCard;