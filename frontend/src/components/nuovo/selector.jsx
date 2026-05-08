import { useState } from 'react';
import './selector.css';

function Selector({ onSelectionChange, defaultSelected = 'auto' }) {
	const [selected, setSelected] = useState(defaultSelected);

	const handleSelect = (option) => {
		setSelected(option);
		onSelectionChange?.(option);
	};

	return (
		<div className="pp-selector">
			<div className="pp-selector__container">
				{/* Slider background animated */}
				<div className={`pp-selector__slider ${selected === 'auto' ? 'auto' : 'biglietto'}`}></div>

				{/* Auto option */}
				<button
					className={`pp-selector__option ${selected === 'auto' ? 'is-active' : ''}`}
					onClick={() => handleSelect('auto')}
					aria-label="Aggiungi Auto"
				>
					<span className="pp-selector__text">Aggiungi Auto</span>
				</button>

				{/* Biglietto option */}
				<button
					className={`pp-selector__option ${selected === 'biglietto' ? 'is-active' : ''}`}
					onClick={() => handleSelect('biglietto')}
					aria-label="Prenotare Biglietto"
				>
					<span className="pp-selector__text">Prenotare Biglietto</span>
				</button>
			</div>
		</div>
	);
}

export default Selector;
