import { useEffect, useState } from 'react';
import './biglietti.css';
import { getCurrentUserId, getParcheggi, getPrenotazioniByUtenteId } from '../../API';

const TicketCard = ({ ticket }) => {
  const { status, park, date, time } = ticket;
  return (
    <div className={`ticket-card ${status}`}>
      <div className="ticket-header">
        <h3>{park}</h3>
        <span className={`ticket-status-badge ${status}`}>{status.replace('_', ' ')}</span>
      </div>
      <div className="ticket-body">
        <p>
          <strong>Data:</strong> {date}
        </p>
        <p>
          <strong>Ora:</strong> {time}
        </p>
      </div>
    </div>
  );
};

const Biglietti = () => {
  const [activeTab, setActiveTab] = useState('in_corso');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      try {
        if (!userId) {
          if (isMounted) {
            setTickets([]);
            setIsLoading(false);
          }
          return;
        }

        const [parcheggi, prenotazioni] = await Promise.all([
          getParcheggi(),
          getPrenotazioniByUtenteId(userId),
        ]);
        const parcheggiMap = parcheggi.reduce((acc, item) => {
          acc[item.id] = item.nome;
          return acc;
        }, {});

        const now = new Date();
        const normalized = prenotazioni.map((prenotazione) => {
          const start = new Date(prenotazione.inizio);
          const end = new Date(prenotazione.fine);
          const isActive = now >= start && now <= end && prenotazione.stato !== 'cancellata';
          const status = isActive ? 'in_corso' : 'utilizzato';

          return {
            id: prenotazione.id,
            park: parcheggiMap[prenotazione.parcheggio_id] || 'Parcheggio',
            date: start.toLocaleDateString('it-IT'),
            time: `${start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
            status,
          };
        });

        if (isMounted) {
          setTickets(normalized);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Errore nel caricamento biglietti:', error);
        if (isMounted) {
          setTickets([]);
          setIsLoading(false);
        }
      }
    };

    loadTickets();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const filteredTickets = tickets.filter((ticket) => ticket.status === activeTab);

  return (
    <div className="biglietti-container">
      <header className="biglietti-header">
        <h1>I Miei Biglietti</h1>
      </header>
      <nav className="biglietti-tabs">
        <button
          className={`tab-btn ${activeTab === 'in_corso' ? 'active' : ''}`}
          onClick={() => setActiveTab('in_corso')}
        >
          In Corso
        </button>
        <button
          className={`tab-btn ${activeTab === 'utilizzato' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilizzato')}
        >
          Utilizzati
        </button>
      </nav>
      <main className="ticket-list">
        {isLoading ? (
          <div className="no-tickets-message">
            <p>Caricamento biglietti...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        ) : (
          <div className="no-tickets-message">
            <p>Nessun biglietto in questa categoria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Biglietti;