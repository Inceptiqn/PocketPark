import './App.css';
import { useEffect, useMemo, useState } from 'react';
import Menu from './components/home/menu';
import Stats from './components/home/stats';
import DashboardCard from './components/home/dashboard-card';
import Mappa from './components/maps/mappa';
import Biglietti from './components/biglietti/Biglietti';
import Selector from './components/nuovo/selector';
import Forum from './components/nuovo/forum';
import { getPrenotazioniByUtenteId, getUsers, getVeicoliByUtenteId } from './API';

function PlaceholderPage({ title, subtitle }) {
	return (
		<section className="page-placeholder" aria-label={title}>
			<h1 className="page-placeholder__title">{title}</h1>
			<p className="page-placeholder__subtitle">{subtitle}</p>
		</section>
	);
}

function App() {
	const [activeItem, setActiveItem] = useState('home');
	const [selectorType, setSelectorType] = useState('auto');
	const [currentUser, setCurrentUser] = useState(null);
	const [veicoli, setVeicoli] = useState([]);
	const [prenotazioni, setPrenotazioni] = useState([]);

	useEffect(() => {
		let isMounted = true;
		const loadHomeData = async () => {
			try {
				const users = await getUsers();
				const user = users[0] || null;
				if (!user) {
					if (isMounted) {
						setCurrentUser(null);
						setVeicoli([]);
						setPrenotazioni([]);
					}
					return;
				}
				const [veicoliData, prenotazioniData] = await Promise.all([
					getVeicoliByUtenteId(user.id),
					getPrenotazioniByUtenteId(user.id),
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
	}, []);

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
						<Forum type={selectorType} />
					</div>
				);
			case 'cars':
				return <PlaceholderPage title="Le Tue Auto" subtitle="Qui puoi gestire i tuoi veicoli." />;
			case 'biglietti':
				return <Biglietti />;
			default:
				return null;
		}
	};

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
