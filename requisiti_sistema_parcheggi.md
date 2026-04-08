# Requisiti del Sistema di Gestione Parcheggi Comunale

## 1. Stack Tecnologico

### 1.1 Frontend (Web e Mobile)

**Framework principale**
- React (web)
- React Native (mobile, iOS e Android)

**Librerie consigliate**
- `react-router-dom` — routing lato web
- `fetch` nativo — comunicazione con le API
- `zustand` o `redux-toolkit` — gestione dello stato globale (sessione utente, ruolo)
- `react-query` (TanStack Query) — caching e gestione delle chiamate HTTP
- Un component library a scelta (`shadcn/ui`, `MUI`, `Ant Design`) per la UI
- `jwt-decode` — decodifica del token JWT lato client

### 1.2 Backend (API)

**Linguaggio:** Python 3.11+

**Framework REST**
- `FastAPI` — framework principale per la costruzione delle API REST (async nativo, generazione automatica della documentazione OpenAPI/Swagger)

**Librerie principali**
- `uvicorn` — ASGI server per FastAPI
- `pydantic` — validazione dei dati e serializzazione
- `python-jose` o `PyJWT` — generazione e verifica dei token JWT
- `passlib[bcrypt]` — hashing delle password
- `httpx` — comunicazione HTTP verso PocketBase
- `python-dotenv` — gestione delle variabili d'ambiente

### 1.3 Database / Backend-as-a-Service

- **PocketBase** — database e servizio di autenticazione;

### 1.4 Autenticazione

- Autenticazione basata su **JWT** (JSON Web Token)
- I token vengono emessi dal backend Python dopo la verifica delle credenziali tramite PocketBase
- Ogni token contiene il ruolo dell'utente (`admin` | `user`)

---

## 2. Requisiti Funzionali

### 2.1 Autenticazione e Autorizzazione

- **RF-01** — Il sistema deve permettere la registrazione di nuovi utenti tramite email e password.
- **RF-02** — Il sistema deve permettere il login di utenti e amministratori tramite email e password.
- **RF-03** — Al momento del login, il sistema deve restituire un token JWT contenente le informazioni sul ruolo dell'utente.
- **RF-04** — Il sistema deve distinguere due ruoli: `amministratore` e `utente`.
- **RF-05** — Il sistema deve proteggere le route e gli endpoint in base al ruolo: le operazioni di gestione dei parcheggi sono accessibili solo agli amministratori.
- **RF-06** — Il sistema deve permettere il logout con invalidazione della sessione lato client.

### 2.2 Gestione dei Parcheggi (solo Amministratori)

- **RF-07** — Un amministratore deve poter creare un nuovo parcheggio, specificando: nome, indirizzo, numero totale di posti, e stato (disponibili/occupati).
- **RF-08** — Un amministratore deve poter visualizzare la lista di tutti i parcheggi presenti nel sistema.
- **RF-09** — Un amministratore deve poter visualizzare il dettaglio di un singolo parcheggio.
- **RF-10** — Un amministratore deve poter modificare le informazioni di un parcheggio esistente.
- **RF-11** — Un amministratore deve poter eliminare un parcheggio dal sistema.

### 2.3 Visualizzazione dei Parcheggi (Utenti)

- **RF-12** — Un utente autenticato deve poter visualizzare la lista dei parcheggi disponibili.
- **RF-13** — Un utente autenticato deve poter visualizzare il dettaglio di un singolo parcheggio, inclusa la disponibilità dei posti.

### 2.4 Prenotazione dei Parcheggi (Utenti)

- **RF-14** — Un utente autenticato deve poter prenotare un posto in un parcheggio disponibile, specificando data e ora di inizio e fine della sosta.
- **RF-15** — Il sistema deve verificare la disponibilità dei posti prima di confermare una prenotazione.
- **RF-16** — Il sistema deve aggiornare il conteggio dei posti disponibili al momento della prenotazione e alla sua conclusione/cancellazione.
- **RF-17** — Un utente deve poter visualizzare la lista delle proprie prenotazioni (storiche e future).
- **RF-18** — Un utente deve poter cancellare una propria prenotazione futura.

### 2.5 Gestione delle Prenotazioni (Amministratori)

- **RF-19** — Un amministratore deve poter visualizzare tutte le prenotazioni relative a uno specifico parcheggio.
- **RF-20** — Un amministratore deve poter cancellare qualsiasi prenotazione.
- **RF-21** — Un amministratore deve poter vedere dati relativi ai parcheggi più utilizzati.

### 2.6 Altre funzioni (Amministratori)

- **RF-22** — Un amministratore deve poter visualizzare il risparmio stimato di emissioni.

---

## 3. Requisiti Non Funzionali

### 3.1 Sicurezza

- **RNF-01** — Le password degli utenti devono essere memorizzate in forma hash (bcrypt) e non in chiaro.
- **RNF-02** — Tutti gli endpoint API devono comunicare esclusivamente su HTTPS in produzione.
- **RNF-03** — I token JWT devono avere una scadenza definita (es. 1 ora) e non devono contenere dati sensibili.
- **RNF-04** — Gli endpoint protetti devono restituire HTTP 401 se il token è assente o non valido, e HTTP 403 se il ruolo non è autorizzato.
- **RNF-05** — Il backend deve validare tutti i dati in ingresso per prevenire injection e input malformati.

### 3.2 Prestazioni

- **RNF-06** — Le risposte degli endpoint principali (lista parcheggi, dettaglio parcheggio) devono essere restituite entro 500 ms in condizioni normali.
- **RNF-07** — Il backend deve supportare richieste concorrenti senza degrado delle prestazioni, grazie all'utilizzo di FastAPI in modalità asincrona.

### 3.3 Usabilità

- **RNF-08** — L'interfaccia web deve essere responsive e fruibile su desktop, tablet e smartphone.
- **RNF-09** — L'applicazione mobile deve essere compatibile con iOS 14+ e Android 10+.
- **RNF-10** — L'interfaccia web e l'applicazione mobile devono poter essere impostati in modalità scura.
- **RNF-11** — I messaggi di errore mostrati all'utente devono essere comprensibili e non esporre dettagli tecnici interni.

### 3.4 Manutenibilità

- **RNF-12** — Il backend deve esporre documentazione automatica delle API tramite Swagger UI (`/docs`) e ReDoc (`/redoc`), fornita nativamente da FastAPI.
- **RNF-13** — Il codice deve essere organizzato in moduli separati per funzionalità (autenticazione, parcheggi, prenotazioni).
- **RNF-14** — Le variabili di configurazione sensibili (URL di PocketBase, chiave segreta JWT, ecc.) devono essere gestite tramite variabili d'ambiente e mai incluse nel codice sorgente.

---


## 4. Struttura degli Endpoint API

### Autenticazione
| Metodo | Path | Accesso | Descrizione |
|---|---|---|---|
| POST | `/auth/register` | Pubblico | Registrazione nuovo utente |
| POST | `/auth/login` | Pubblico | Login e ottenimento JWT |

### Parcheggi
| Metodo | Path | Accesso | Descrizione |
|---|---|---|---|
| GET | `/parcheggi` | Utente, Admin | Lista parcheggi attivi |
| GET | `/parcheggi/{id}` | Utente, Admin | Dettaglio parcheggio |
| POST | `/parcheggi` | Solo Admin | Crea parcheggio |
| PUT | `/parcheggi/{id}` | Solo Admin | Modifica parcheggio |
| DELETE | `/parcheggi/{id}` | Solo Admin | Elimina parcheggio |

### Prenotazioni
| Metodo | Path | Accesso | Descrizione |
|---|---|---|---|
| POST | `/prenotazioni` | Utente | Crea prenotazione |
| GET | `/prenotazioni/me` | Utente | Prenotazioni dell'utente corrente |
| DELETE | `/prenotazioni/{id}` | Utente | Cancella propria prenotazione |
| GET | `/prenotazioni/parcheggio/{id}` | Solo Admin | Prenotazioni per parcheggio |
| DELETE | `/prenotazioni/{id}/admin` | Solo Admin | Cancella qualsiasi prenotazione |

---

## 5. Struttura del Database

La persistenza dei dati può essere organizzata in PocketBase con tre collezioni principali, più eventuali campi di supporto per statistiche e controllo storico.

### 5.1 Collezione `users`

Contiene gli utenti del sistema, sia amministratori sia utenti standard.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID / Record ID | Chiave primaria |
| `email` | string | Unica, obbligatoria |
| `passwordHash` | string | Hash bcrypt, mai in chiaro |
| `role` | enum | `admin` oppure `user` |
| `createdAt` | datetime | Data di creazione |
| `updatedAt` | datetime | Data ultimo aggiornamento |
| `isActive` | boolean | Utente attivo/disattivato |

### 5.2 Collezione `parcheggi`

Memorizza i parcheggi gestiti dal Comune.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID / Record ID | Chiave primaria |
| `nome` | string | Obbligatorio |
| `indirizzo` | string | Obbligatorio |
| `postiTotali` | integer | Maggiore di 0 |
| `postiDisponibili` | integer | Maggiore o uguale a 0 |
| `stato` | enum | `attivo`, `chiuso`, `manutenzione` |
| `descrizione` | string | Facoltativo |
| `createdAt` | datetime | Data di creazione |
| `updatedAt` | datetime | Data ultimo aggiornamento |

### 5.3 Collezione `prenotazioni`

Registra tutte le prenotazioni effettuate dagli utenti.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID / Record ID | Chiave primaria |
| `utenteId` | relation -> `users` | Utente proprietario della prenotazione |
| `parcheggioId` | relation -> `parcheggi` | Parcheggio prenotato |
| `dataOraInizio` | datetime | Obbligatorio |
| `dataOraFine` | datetime | Obbligatorio, successivo all'inizio |
| `stato` | enum | `attiva`, `cancellata`, `conclusa` |
| `createdAt` | datetime | Data creazione prenotazione |
| `note` | string | Facoltativo |

### 5.4 Indici Consigliati

- Indice su `users.email` per velocizzare login e registrazione.
- Indice su `prenotazioni.utenteId` per recuperare rapidamente le prenotazioni di un utente.
- Indice su `prenotazioni.parcheggioId` e `prenotazioni.dataOraInizio` per le ricerche amministrative.
- Indice su `parcheggi.stato` per filtrare i parcheggi attivi.

### 5.5 Dati per le Statistiche

Per soddisfare i requisiti di analisi e reporting, il sistema può calcolare o derivare i seguenti dati:

- numero di prenotazioni per parcheggio in un intervallo temporale;
- parcheggi più utilizzati;
