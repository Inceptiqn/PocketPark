import { useState } from 'react';
import './RegisterPage.css';
import { createUser, login } from '../../API';

export default function RegisterPage({ onRegistered, onCancel }) {
	const [nome, setNome] = useState('');
	const [cognome, setCognome] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const user = await createUser({ role_id: 2, email, password, nome, cognome });
			// auto-login
			await login(email, password);
			if (onRegistered) onRegistered(user);
		} catch (err) {
			setError(err.message || 'Errore durante la registrazione');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="pp-register-page">
			<form className="pp-register-box" onSubmit={handleSubmit}>
				<h2 className="pp-register-title">Crea un account</h2>
				<input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
				<input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
				<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				{error && <div className="pp-register-error">{error}</div>}
				<div className="pp-register-actions">
					<button type="button" className="pp-register-cancel" onClick={() => onCancel && onCancel()}>Annulla</button>
					<button type="submit" className="pp-register-submit" disabled={loading}>{loading ? 'Creazione...' : 'Registrati'}</button>
				</div>
			</form>
		</div>
	);
}
