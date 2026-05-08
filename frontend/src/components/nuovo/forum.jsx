import { useState } from 'react';
import './forum.css';

function Forum({ type = 'auto' }) {
	const [formData, setFormData] = useState({
		marca: '',
		modello: '',
		targa: '',
		colore: '',
	});

	const [ticketData, setTicketData] = useState({
		tipoAbbonamento: 'orario',
		ore: '1',
		data: '',
		ora: '',
	});

	const handleAutoChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleTicketChange = (e) => {
		const { name, value } = e.target;
		setTicketData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleAutoSubmit = (e) => {
		e.preventDefault();
		console.log('Auto aggiunta:', formData);
		// Reset form
		setFormData({ marca: '', modello: '', targa: '', colore: '' });
	};

	const handleTicketSubmit = (e) => {
		e.preventDefault();
		console.log('Biglietto prenotato:', ticketData);
		// Reset form
		setTicketData({ tipoAbbonamento: 'orario', ore: '1', data: '', ora: '' });
	};

	return (
		<div className="pp-forum">
			{type === 'auto' && (
				<form className="pp-forum__form pp-forum__form--auto" onSubmit={handleAutoSubmit}>
					<h2 className="pp-forum__title">Aggiungi una Nuova Auto</h2>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="marca">
							Marca
						</label>
						<input
							className="pp-forum__input"
							type="text"
							id="marca"
							name="marca"
							value={formData.marca}
							onChange={handleAutoChange}
							placeholder="Es. Chevrolet"
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="modello">
							Modello
						</label>
						<input
							className="pp-forum__input"
							type="text"
							id="modello"
							name="modello"
							value={formData.modello}
							onChange={handleAutoChange}
							placeholder="Es. Luffy"
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="targa">
							Targa
						</label>
						<input
							className="pp-forum__input"
							type="text"
							id="targa"
							name="targa"
							value={formData.targa}
							onChange={handleAutoChange}
							placeholder="Es. TT 678 RR"
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="colore">
							Colore
						</label>
						<input
							className="pp-forum__input"
							type="text"
							id="colore"
							name="colore"
							value={formData.colore}
							onChange={handleAutoChange}
							placeholder="Es. Nero"
						/>
					</div>

					<button className="pp-forum__submit" type="submit">
						Aggiungi Auto
					</button>
				</form>
			)}

			{type === 'biglietto' && (
				<form className="pp-forum__form pp-forum__form--ticket" onSubmit={handleTicketSubmit}>
					<h2 className="pp-forum__title">Prenota un Biglietto</h2>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="tipoAbbonamento">
							Tipo Biglietto
						</label>
						<select
							className="pp-forum__input pp-forum__select"
							id="tipoAbbonamento"
							name="tipoAbbonamento"
							value={ticketData.tipoAbbonamento}
							onChange={handleTicketChange}
						>
							<option value="orario">Orario</option>
							<option value="giornaliero">Giornaliero</option>
							<option value="settimanale">Settimanale</option>
							<option value="mensile">Mensile</option>
						</select>
					</div>

					{ticketData.tipoAbbonamento === 'orario' && (
						<div className="pp-forum__group">
							<label className="pp-forum__label" htmlFor="ore">
								Ore
							</label>
							<select
								className="pp-forum__input pp-forum__select"
								id="ore"
								name="ore"
								value={ticketData.ore}
								onChange={handleTicketChange}
							>
								<option value="1">1 Ora</option>
								<option value="2">2 Ore</option>
								<option value="3">3 Ore</option>
								<option value="4">4 Ore</option>
								<option value="6">6 Ore</option>
								<option value="8">8 Ore</option>
								<option value="12">12 Ore</option>
							</select>
						</div>
					)}

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="data">
							Data
						</label>
						<input
							className="pp-forum__input"
							type="date"
							id="data"
							name="data"
							value={ticketData.data}
							onChange={handleTicketChange}
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="ora">
							Ora Inizio
						</label>
						<input
							className="pp-forum__input"
							type="time"
							id="ora"
							name="ora"
							value={ticketData.ora}
							onChange={handleTicketChange}
							required
						/>
					</div>

					<button className="pp-forum__submit" type="submit">
						Prenota Biglietto
					</button>
				</form>
			)}
		</div>
	);
}

export default Forum;
