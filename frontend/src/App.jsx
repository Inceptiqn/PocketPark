import './App.css';
import Button from './components/button';

function App() {
	return (
		<main className="app-shell">
			<section className="demo-card">
				<h1 className="demo-title">PocketPark Buttons</h1>
				<p className="demo-subtitle">
					Componente base riutilizzabile per mobile e desktop.
				</p>

				<div className="demo-actions">
					<Button label="Accedi" />

					<Button
						imageSrc="https://www.svgrepo.com/show/512352/home-1393.svg"
						imageAlt="Home icon"
						ariaLabel="Torna alla home"
					/>
				</div>
			</section>
		</main>
	);
}

export default App;
