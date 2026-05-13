
import { useState } from 'react';
import { logout } from '../../API';
import './SettingsModal.css';

const sections = [
	'Privacy',
	'Accessibilità',
	'Lingua',
	'Notifiche',
	'Dati personali',
	'Cronologia',
	'Logout',
	'Termini e condizioni',
];

const contentMap = {
	Privacy: 'Gestisci le tue impostazioni di privacy e visibilità del profilo.',
	Accessibilità: 'Configura le opzioni di accessibilità per una migliore esperienza.',
	Lingua: 'Seleziona la lingua preferita per l\'app.',
	Notifiche: 'Controlla quali notifiche vuoi ricevere.',
	'Dati personali': 'Visualizza e scarica i tuoi dati personali.',
	Cronologia: 'Cancella la tua cronologia di ricerca e prenotazioni.',
	'Termini e condizioni': 'Leggi i termini e le condizioni di utilizzo.',
};

export default function SettingsModal({ onClose }) {
	const [activeSection, setActiveSection] = useState(null);
	const content = activeSection ? contentMap[activeSection] : '';

	const handleMenuClick = (section) => {
		if (section === 'Logout') {
			logout();
			window.location.href = '/';
			return;
		}
		setActiveSection(section);
	};

	return (
		<div className="pp-settings-modal-overlay" onClick={onClose}>
			<div className="pp-settings-modal" onClick={(e) => e.stopPropagation()}>
				<button
					className="pp-settings-modal__close"
					onClick={onClose}
					aria-label="Chiudi"
				>
					✕
				</button>

				<div className="pp-settings-modal__layout">
					<div className="pp-settings-modal__menu">
						<h2 className="pp-settings-modal__title">Impostazioni</h2>
						<nav className="pp-settings-modal__nav">
							{sections.map((section) => (
								<button
									key={section}
									className={`pp-settings-modal__menu-item ${
										activeSection === section ? 'pp-settings-modal__menu-item--active' : ''
									}`}
									onClick={() => handleMenuClick(section)}
								>
									{section}
								</button>
							))}
						</nav>
					</div>

					<div className="pp-settings-modal__view">
						{content ? (
							<div className="pp-settings-modal__content">
								<h3 className="pp-settings-modal__content-title">{activeSection}</h3>
								<p className="pp-settings-modal__content-text">{content}</p>
							</div>
						) : (
							<div className="pp-settings-modal__placeholder">
								<p>Seleziona una voce dal menu</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
