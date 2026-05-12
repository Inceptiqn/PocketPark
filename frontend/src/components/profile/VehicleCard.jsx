const vehicleTypeColors = {
	auto: '#55b9e3',
	normal: '#55b9e3',
	electric: '#10b981',
	moto: '#9b5cff',
	scooter: '#9b5cff',
	motorcycle: '#9b5cff',
	furgone: '#f59e0b',
	camion: '#6b7280',
};

function getVehicleColor(tipo) {
	return vehicleTypeColors[tipo] || '#55b9e3';
}

export default function VehicleCard({ veicolo }) {
	const accentColor = getVehicleColor(veicolo.tipo);

	return (
		<div className="pp-vehicle-card" style={{ borderLeftColor: accentColor }}>
			<div className="pp-vehicle-card__header">
				<span className="pp-vehicle-card__targa">{veicolo.targa}</span>
				<span className="pp-vehicle-card__tipo" style={{ backgroundColor: accentColor }}>
					{veicolo.tipo}
				</span>
			</div>
			<div className="pp-vehicle-card__body">
				<p className="pp-vehicle-card__marca-modello">
					{veicolo.marca} {veicolo.modello}
				</p>
			</div>
		</div>
	);
}
