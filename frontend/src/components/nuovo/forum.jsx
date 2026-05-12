import { useEffect, useState } from 'react';
import './forum.css';
import {
	createPrenotazione,
	createVeicolo,
	getParcheggi,
	getTariffe,
	getCurrentUserId,
	getVeicoliByUtenteId,
} from '../../API';

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
		tariffa_id: '',
		inizio: '',
		fine: '',
		note: '',
	});

	const [parcheggi, setParcheggi] = useState([]);
	const [veicoli, setVeicoli] = useState([]);
	const [tariffe, setTariffe] = useState([]);
	const [currentUserId, setCurrentUserId] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const hasUser = Boolean(currentUserId);
	const isTicketDisabled = !hasUser || !ticketData.tariffa_id;

	useEffect(() => {
		setCurrentUserId(getCurrentUserId());
	}, []);

	useEffect(() => {
		let isMounted = true;
		const loadData = async () => {
			try {
				const [parcheggiData, tariffeData] = await Promise.all([
					getParcheggi(),
					getTariffe(),
				]);
				if (isMounted) {
					setParcheggi(parcheggiData);
					setTariffe(tariffeData);
				}
			} catch (error) {
				console.error('Errore nel caricamento dati:', error);
			}
		};

		loadData();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		const loadVeicoli = async () => {
			try {
				const veicoliData = await getVeicoliByUtenteId(currentUserId);
				if (isMounted) {
					setVeicoli(veicoliData);
				}
			} catch (error) {
				console.error('Errore nel caricamento veicoli:', error);
			}
		};

		loadVeicoli();
		return () => {
			isMounted = false;
		};
	}, [currentUserId]);

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

	const handleAutoSubmit = async (e) => {
		e.preventDefault();
		if (!hasUser) {
			return;
		}
		setIsSubmitting(true);
		try {
			await createVeicolo({
				...formData,
				utente_id: currentUserId,
			});
			setFormData({ targa: '', marca: '', modello: '', tipo: 'auto' });
			const veicoliData = await getVeicoliByUtenteId(currentUserId);
			setVeicoli(veicoliData);
		} catch (error) {
			console.error('Errore nella creazione veicolo:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleTicketSubmit = async (e) => {
		e.preventDefault();
		if (!hasUser) {
			return;
		}
		setIsSubmitting(true);
		try {
			await createPrenotazione({
				...ticketData,
				utente_id: currentUserId,
				stato: 'creata',
			});
			setTicketData({
				parcheggio_id: '',
				veicolo_id: '',
				tariffa_id: '',
				inizio: '',
				fine: '',
				note: '',
			});
		} catch (error) {
			console.error('Errore nella creazione prenotazione:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="pp-forum">
			{type === 'auto' && (
				<form className="pp-forum__form pp-forum__form--auto" onSubmit={handleAutoSubmit}>
					<h2 className="pp-forum__title">Aggiungi un Veicolo</h2>
					{!hasUser ? (
						<p className="pp-forum__notice">Nessun utente disponibile. Crea almeno un utente nel backend.</p>
					) : null}

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

					<button className="pp-forum__submit" type="submit" disabled={!hasUser || isSubmitting}>
						Aggiungi Veicolo
					</button>
				</form>
			)}

			{type === 'biglietto' && (
				<form className="pp-forum__form pp-forum__form--ticket" onSubmit={handleTicketSubmit}>
					<h2 className="pp-forum__title">Prenota un Parcheggio</h2>
					{!hasUser ? (
						<p className="pp-forum__notice">Nessun utente disponibile. Crea almeno un utente nel backend.</p>
					) : null}

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
						<label className="pp-forum__label" htmlFor="tariffa_id">
							Tariffa *
						</label>
						<select
							className="pp-forum__input pp-forum__select"
							id="tariffa_id"
							name="tariffa_id"
							value={ticketData.tariffa_id}
							onChange={handleTicketChange}
							required
						>
							<option value="">Seleziona una tariffa</option>
							{tariffe.map((t) => (
								<option key={t.id} value={t.id}>
									{t.nome} - {t.prezzo_ora}€/h
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

					<button className="pp-forum__submit" type="submit" disabled={isTicketDisabled || isSubmitting}>
						Prenota Parcheggio
					</button>
				</form>
			)}
		</div>
	);
}

export default Forum;
