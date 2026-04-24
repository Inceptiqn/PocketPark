import './App.css';
import { useState } from 'react';
import Menu from './components/menu';
import Stats from './components/stats';
import DashboardCard from './components/dashboard-card';

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

	const renderPage = () => {
		switch (activeItem) {
			case 'home':
				return (
					<div className="dashboard-content">
						<DashboardCard
							vehicleType="normal"
							vehicleName="CHEVROLET LUFFY"
							plate="TT 678 RR"
							address="Via Benedetto Marcello 26B"
							parkingType="Standard"
						/>

						<section className="stats-grid" aria-label="Statistiche">
							<Stats label="TEMPO RIMASTO" current={62} max={100} value="6:07" fillColor="#4e69ea" />
							<Stats label="CREDITO RESIDUO" variant="empty" />
							<Stats label="SPESA" variant="empty" />
							<Stats label="PARCHEGGI" variant="empty" />
						</section>
					</div>
				);
			case 'position':
				return <PlaceholderPage title="Posizione" subtitle="Qui puoi vedere la mappa e la tua posizione." />;
			case 'add':
				return <PlaceholderPage title="Nuovo Parcheggio" subtitle="Qui puoi iniziare un nuovo parcheggio." />;
			case 'cars':
				return <PlaceholderPage title="Le Tue Auto" subtitle="Qui puoi gestire i tuoi veicoli." />;
			case 'profile':
				return <PlaceholderPage title="Profilo" subtitle="Qui puoi modificare il tuo account." />;
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
