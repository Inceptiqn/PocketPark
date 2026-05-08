import { useState } from 'react';
import './forum.css';

function Forum({ type = 'auto' }) {
	const [formData, setFormData] = useState({
		targa: '',
		marca: '',
		modello: '',
		tipo: 'auto',
	});

	const [ticketData, setTicketData] = useState({
		parcheggio_id: '',
		veicolo_id: '',
		inizio: '',
		fine: '',
		note: '',
	});

	// Mock data - in produzione verrebbe dal backend
	const parcheggi = [
		{ id: '1', nome: 'Parcheggio Centro' },
		{ id: '2', nome: 'Parcheggio Stazione' },
		{ id: '3', nome: 'Parcheggio Ospedale' },
	];

	const veicoli = [
		{ id: '1', marca: 'Chevrolet', modello: 'Luffy', targa: 'TT 678 RR' },
		{ id: '2', marca: 'Fiat', modello: '500', targa: 'AB 123 CD' },
	];

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
		console.log('Veicolo aggiunto:', formData);
		setFormData({ targa: '', marca: '', modello: '', tipo: 'auto' });
	};

	const handleTicketSubmit = (e) => {
		e.preventDefault();
		console.log('Prenotazione creata:', ticketData);
		setTicketData({
			parcheggio_id: '',
			veicolo_id: '',
			inizio: '',
			fine: '',
			note: '',
		});
	};

	return (
		<div className="pp-forum">
			{type === 'auto' && (
				<form className="pp-forum__form pp-forum__form--auto" onSubmit={handleAutoSubmit}>
					<h2 className="pp-forum__title">Aggiungi un Veicolo</h2>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="targa">
							Targa *
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
						<label className="pp-forum__label" htmlFor="marca">
							Marca *
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
							Modello *
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
						<label className="pp-forum__label" htmlFor="tipo">
							Tipo di Veicolo *
						</label>
						<select
							className="pp-forum__input pp-forum__select"
							id="tipo"
							name="tipo"
							value={formData.tipo}
							onChange={handleAutoChange}
							required
						>
							<option value="auto">Auto</option>
							<option value="moto">Moto</option>
							<option value="furgone">Furgone</option>
							<option value="camion">Camion</option>
						</select>
					</div>

					<button className="pp-forum__submit" type="submit">
						Aggiungi Veicolo
					</button>
				</form>
			)}

			{type === 'biglietto' && (
				<form className="pp-forum__form pp-forum__form--ticket" onSubmit={handleTicketSubmit}>
					<h2 className="pp-forum__title">Prenota un Parcheggio</h2>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="parcheggio_id">
							Parcheggio *
						</label>
						<select
							className="pp-forum__input pp-forum__select"
							id="parcheggio_id"
							name="parcheggio_id"
							value={ticketData.parcheggio_id}
							onChange={handleTicketChange}
							required
						>
							<option value="">Seleziona un parcheggio</option>
							{parcheggi.map((p) => (
								<option key={p.id} value={p.id}>
									{p.nome}
								</option>
							))}
						</select>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="veicolo_id">
							Veicolo *
						</label>
						<select
							className="pp-forum__input pp-forum__select"
							id="veicolo_id"
							name="veicolo_id"
							value={ticketData.veicolo_id}
							onChange={handleTicketChange}
							required
						>
							<option value="">Seleziona un veicolo</option>
							{veicoli.map((v) => (
								<option key={v.id} value={v.id}>
									{v.marca} {v.modello} - {v.targa}
								</option>
							))}
						</select>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="inizio">
							Data e Ora Inizio *
						</label>
						<input
							className="pp-forum__input"
							type="datetime-local"
							id="inizio"
							name="inizio"
							value={ticketData.inizio}
							onChange={handleTicketChange}
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="fine">
							Data e Ora Fine *
						</label>
						<input
							className="pp-forum__input"
							type="datetime-local"
							id="fine"
							name="fine"
							value={ticketData.fine}
							onChange={handleTicketChange}
							required
						/>
					</div>

					<div className="pp-forum__group">
						<label className="pp-forum__label" htmlFor="note">
							Note
						</label>
						<textarea
							className="pp-forum__input pp-forum__textarea"
							id="note"
							name="note"
							value={ticketData.note}
							onChange={handleTicketChange}
							placeholder="Note aggiuntive..."
							rows="3"
						/>
					</div>

					<button className="pp-forum__submit" type="submit">
						Prenota Parcheggio
					</button>
				</form>
			)}
		</div>
	);
}

export default Forum;
