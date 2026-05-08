import { useEffect, useMemo, useState } from 'react';
import './biglietti.css';
import { getCurrentUserId, getParcheggi, getPrenotazioniByUtenteId } from '../../API';

// Componente per la singola card del biglietto
const TicketCard = ({ ticket }) => {
  return (
    <div className={`ticket-card ${ticket.status}`}>
      <div className="ticket-header">
        <h3>{ticket.park}</h3>
        <span className={`ticket-status-badge ${ticket.status}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      <div className="ticket-body">
        <p><strong>Data:</strong> {ticket.date}</p>
        <p><strong>Ora:</strong> {ticket.time}</p>
      </div>
      {/* La sezione per i biglietti disponibili è stata rimossa completamente */}
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === activeTab);
  }, [activeTab, tickets]);

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