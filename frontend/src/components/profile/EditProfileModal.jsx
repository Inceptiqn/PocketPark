import { useState } from 'react';
import { updateUser } from '../../API';
import './EditProfileModal.css';

export default function EditProfileModal({ user, onClose, onUpdate }) {
	const [nome, setNome] = useState(user.nome);
	const [cognome, setCognome] = useState(user.cognome);
	const [email, setEmail] = useState(user.email);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			setLoading(true);
			setError(null);
			await updateUser(user.id, {
				nome,
				cognome,
				email,
			});
			onUpdate();
		} catch (err) {
			setError(err.message || 'Errore nell\'aggiornamento');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="pp-edit-profile-modal-overlay" onClick={onClose}>
			<div className="pp-edit-profile-modal" onClick={(e) => e.stopPropagation()}>
				<button
					className="pp-edit-profile-modal__close"
					onClick={onClose}
					aria-label="Chiudi"
				>
					✕
				</button>

				<h2 className="pp-edit-profile-modal__title">Modifica profilo</h2>

				{error && <div className="pp-edit-profile-modal__error">{error}</div>}

				<form onSubmit={handleSubmit} className="pp-edit-profile-modal__form">
					<div className="pp-edit-profile-modal__group">
						<label className="pp-edit-profile-modal__label">Nome</label>
						<input
							type="text"
							className="pp-edit-profile-modal__input"
							value={nome}
							onChange={(e) => setNome(e.target.value)}
							required
						/>
					</div>

					<div className="pp-edit-profile-modal__group">
						<label className="pp-edit-profile-modal__label">Cognome</label>
						<input
							type="text"
							className="pp-edit-profile-modal__input"
							value={cognome}
							onChange={(e) => setCognome(e.target.value)}
							required
						/>
					</div>

					<div className="pp-edit-profile-modal__group">
						<label className="pp-edit-profile-modal__label">Email</label>
						<input
							type="email"
							className="pp-edit-profile-modal__input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						className="pp-edit-profile-modal__submit"
						disabled={loading}
					>
						{loading ? 'Aggiornamento...' : 'Salva'}
					</button>
				</form>
			</div>
		</div>
	);
}
