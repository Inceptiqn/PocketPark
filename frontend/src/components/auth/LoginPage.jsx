import { useState } from 'react';
import './LoginPage.css';
import { login } from '../../API';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const user = await login(email, password);
			if (onLogin) onLogin(user);
		} catch (err) {
			setError(err.message || 'Connessione fallita');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="pp-login-page">
			<form className="pp-login-box" onSubmit={handleSubmit}>
				<h1 className="pp-login-title">PocketPark</h1>
				<p className="pp-login-sub">Accedi con la tua email</p>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				{error && <div className="pp-login-error">{error}</div>}
				<button className="pp-login-submit" type="submit" disabled={loading}>
					{loading ? 'Caricamento...' : 'Accedi'}
				</button>

				<div style={{textAlign:'center', marginTop:'0.4rem'}}>
					<button type="button" onClick={() => onSwitchToRegister && onSwitchToRegister()} style={{background:'none',border:'none',color:'#55b9e3',cursor:'pointer',fontWeight:600}}>Non hai un account? Registrati</button>
				</div>
			</form>
		</div>
	);
}
