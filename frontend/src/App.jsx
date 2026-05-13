import './App.css';
import { useEffect, useMemo, useState } from 'react';
import Menu from './components/home/menu';
import Stats from './components/home/stats';
import DashboardCard from './components/home/dashboard-card';
import Mappa from './components/maps/mappa.jsx';
import Biglietti from './components/biglietti/biglietti';
import Selector from './components/nuovo/selector';
import Forum from './components/nuovo/forum';
import ProfilePage from './components/profile/ProfilePage.jsx';
import VehicleCard from './components/profile/VehicleCard.jsx';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import {
	getCurrentUserId,
	getPrenotazioniByUtenteId,
	getUserById,
	getVeicoliByUtenteId,
	getAuthToken,
	isLoggedIn,
	logout,
	validateToken,
} from './API';

function App() {
	const [activeItem, setActiveItem] = useState('home');
	const [selectorType, setSelectorType] = useState('auto');
	const [currentUser, setCurrentUser] = useState(null);
	const [currentUserId, setCurrentUserId] = useState('');
	const [veicoli, setVeicoli] = useState([]);
	const [prenotazioni, setPrenotazioni] = useState([]);
	const [isAuthChecking, setIsAuthChecking] = useState(true);

	const [authenticated, setAuthenticated] = useState(() => {
		try {
			return isLoggedIn();
		} catch (e) {
			return false;
		}
	});
	const [authView, setAuthView] = useState('login');

	useEffect(() => {
		let isMounted = true;
		const checkAuth = async () => {
			const token = getAuthToken();
			if (!token) {
				if (isMounted) {
					setAuthenticated(false);
					setCurrentUserId('');
					setIsAuthChecking(false);
				}
				return;
			}
			try {
				const result = await validateToken(token);
				if (result.valid && result.user_id) {
					if (isMounted) {
						setAuthenticated(true);
						setCurrentUserId(result.user_id);
					}
				} else {
					logout();
					if (isMounted) {
						setAuthenticated(false);
						setCurrentUserId('');
					}
				}
			} catch (error) {
				console.error('Errore validazione token:', error);
				logout();
				if (isMounted) {
					setAuthenticated(false);
					setCurrentUserId('');
				}
			} finally {
				if (isMounted) {
					setIsAuthChecking(false);
				}
			}
		};

		checkAuth();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		const loadHomeData = async () => {
			if (!authenticated || !currentUserId) {
				if (isMounted) {
					setCurrentUser(null);
					setVeicoli([]);
					setPrenotazioni([]);
				}
				return;
			}
			try {
				const [user, veicoliData, prenotazioniData] = await Promise.all([
					getUserById(currentUserId),
					getVeicoliByUtenteId(currentUserId),
					getPrenotazioniByUtenteId(currentUserId),
				]);
				if (isMounted) {
					setCurrentUser(user);
					setVeicoli(veicoliData);
					setPrenotazioni(prenotazioniData);
				}
			} catch (error) {
				console.error('Errore nel caricamento home:', error);
			}
		};

		loadHomeData();
		return () => {
			isMounted = false;
		};
	}, [authenticated, currentUserId]);

	const activePrenotazione = useMemo(() => {
		const now = new Date();
		return prenotazioni.find((item) => {
			const start = new Date(item.inizio);
			const end = new Date(item.fine);
			return now >= start && now <= end;
		});
	}, [prenotazioni]);

	const remainingMinutes = useMemo(() => {
		if (!activePrenotazione) {
			return null;
		}
		const end = new Date(activePrenotazione.fine);
		const diffMs = end - new Date();
		return diffMs > 0 ? Math.ceil(diffMs / 60000) : 0;
	}, [activePrenotazione]);

	const totalSpesa = useMemo(() => {
		return prenotazioni.reduce((sum, item) => sum + Number(item.importo_totale || 0), 0);
	}, [prenotazioni]);

	const renderPage = () => {
		switch (activeItem) {
			case 'home':
				return (
					<div className="dashboard-content">
						<DashboardCard
							vehicleType={veicoli[0]?.tipo || 'normal'}
							vehicleName={
								veicoli[0]
									? `${veicoli[0].marca || 'Veicolo'} ${veicoli[0].modello || ''}`.trim()
									: currentUser
									? `${currentUser.nome} ${currentUser.cognome}`.trim()
									: 'Nessun veicolo'
							}
							plate={veicoli[0]?.targa || '---'}
							address={activePrenotazione?.note || 'Nessuna prenotazione attiva'}
							parkingType={activePrenotazione?.stato || 'Standard'}
						/>

						<section className="stats-grid" aria-label="Statistiche">
							<Stats
								label="TEMPO RIMASTO"
								current={remainingMinutes || 0}
								max={remainingMinutes ? Math.max(remainingMinutes, 60) : 60}
								value={remainingMinutes !== null ? `${remainingMinutes} min` : '--'}
								fillColor="#4e69ea"
								variant={remainingMinutes === null ? 'empty' : 'progress'}
							/>
							<Stats label="CREDITO RESIDUO" variant="empty" />
							<Stats label="SPESA" current={totalSpesa} max={Math.max(totalSpesa, 100)} value={`${totalSpesa.toFixed(2)}€`} />
							<Stats label="PARCHEGGI" current={prenotazioni.length} max={Math.max(prenotazioni.length, 10)} value={`${prenotazioni.length}`} />
						</section>
					</div>
				);
			case 'position':
				return <Mappa />;
			case 'add':
				return (
					<div className="add-page-content">
						<Selector 
							defaultSelected={selectorType}
							onSelectionChange={(option) => {
								setSelectorType(option);
							}}
						/>
						<div className="add-page-content__forum-scroll">
							<Forum type={selectorType} />
						</div>
					</div>
				);
			case 'cars':
				return (
					<section className="pp-cars-page" aria-label="Le Tue Auto">
						<header className="pp-cars-page__header">
							<h1 className="pp-cars-page__title">Le Tue Auto</h1>
							<p className="pp-cars-page__subtitle">Qui puoi gestire i tuoi veicoli.</p>
						</header>
						<div className="pp-cars-page__list">
							{veicoli.length > 0 ? (
								veicoli.map((veicolo) => (
									<VehicleCard key={veicolo.id} veicolo={veicolo} />
								))
							) : (
								<p className="pp-cars-page__empty">Nessun veicolo registrato</p>
							)}
						</div>
					</section>
				);
			case 'biglietti':
				return <Biglietti />;
			case 'profile':
				return <ProfilePage />;
			default:
				return null;
		}
	};

	const handleLogin = (user) => {
		setAuthenticated(true);
		setCurrentUserId(user?.id || getCurrentUserId());
	};

	if (isAuthChecking) {
		return (
			<main className="app-shell">
				<div className="phone-screen auth-mode">
					<div className="phone-page">
						<section className="page-placeholder" aria-label="Caricamento">
							<h1 className="page-placeholder__title">Caricamento...</h1>
							<p className="page-placeholder__subtitle">Verifica sessione in corso.</p>
						</section>
					</div>
				</div>
			</main>
		);
	}

	if (!authenticated) {
		return (
			<main className="app-shell">
				<div className="phone-screen auth-mode">
					<div className="phone-page">
						{authView === 'login' && (
							<LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />
						)}
						{authView === 'register' && (
							<RegisterPage onRegistered={handleLogin} onCancel={() => setAuthView('login')} />
						)}
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="app-shell">
			<div className="phone-screen">
				<div className="phone-page">{renderPage()}</div>

				<div className="phone-menu">
					<Menu activeId={activeItem} onItemClick={setActiveItem} />
				</div>
			</div>
		</main>
	);
}

export default App;
