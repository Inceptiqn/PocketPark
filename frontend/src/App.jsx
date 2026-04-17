import './App.css';
import { useState } from 'react';
import Menu from './components/menu';
import Stats from './components/stats';
import DashboardCard from './components/dashboard-card';

function App() {
	const [activeItem, setActiveItem] = useState('home');

	return (
		<main className="app-shell">
			<div className="phone-screen">
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

				<div className="phone-menu">
					<Menu activeId={activeItem} onItemClick={setActiveItem} />
				</div>
			</div>
		</main>
	);
}

export default App;
