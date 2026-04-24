import './vehicle.css';
import normalCarImage from '../../assets/normal-car.png';
import electricCarImage from '../../assets/electric-car.png';
import motorcycleImage from '../../assets/motocycle.png';

const vehicleImages = {
	normal: {
		src: normalCarImage,
		alt: 'Macchina normale',
	},
	electric: {
		src: electricCarImage,
		alt: 'Macchina elettrica',
	},
	motorcycle: {
		src: motorcycleImage,
		alt: 'Moto',
	},
};

function Vehicle({ type = 'normal', className = '', size = 'medium' }) {
	const vehicle = vehicleImages[type] || vehicleImages.normal;

	return (
		<div className={`pp-vehicle pp-vehicle--${size} ${className}`.trim()}>
			<img className="pp-vehicle__image" src={vehicle.src} alt={vehicle.alt} />
		</div>
	);
}

export default Vehicle;