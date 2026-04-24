import './parcheggio.css';

const parkingTypeLabels = {
	occupied: 'Occupato',
	electric: 'Elettrico',
	normal: 'Normale',
	disabled: 'Disabili',
	motorcycle: 'Moto',
};

function Parcheggio({ type = 'normal', label, style, size = 'medium', selected = false }) {
	const typeLabel = label || parkingTypeLabels[type] || 'Parcheggio';

	return (
		<div
			className={`pp-parcheggio pp-parcheggio--${type} pp-parcheggio--${size} ${selected ? 'is-selected' : ''}`.trim()}
			style={style}
			aria-label={typeLabel}
			title={typeLabel}
		>
			<span className="pp-parcheggio__label">{typeLabel}</span>
		</div>
	);
}

export default Parcheggio;
