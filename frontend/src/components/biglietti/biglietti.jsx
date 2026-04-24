import React, { useState, useMemo } from 'react';
import './biglietti.css';

// Dati di esempio aggiornati per contenere solo biglietti 'in_corso' e 'utilizzato'.
const mockTickets = [
  { id: 1, park: 'Parcheggio Centro', date: '24/04/2026', time: '14:30 - 15:30', status: 'in_corso' },
  { id: 2, park: 'Parcheggio Stadio', date: '22/04/2026', time: '20:00 - 23:00', status: 'utilizzato' },
  { id: 3, park: 'Parcheggio Fiera', date: '20/04/2026', time: '10:00 - 18:00', status: 'utilizzato' },
];

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
  const [activeTab, setActiveTab] = useState('in_corso'); // 'in_corso', 'utilizzato'

  const filteredTickets = useMemo(() => {
    // Ora il filtro funziona solo per gli stati che vogliamo mostrare
    return mockTickets.filter(ticket => ticket.status === activeTab);
  }, [activeTab]);

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
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
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