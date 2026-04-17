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

- **PostgreSQL** — database relazionale principale (schema in `database/ddl.sql`).

### 1.4 Autenticazione

- Autenticazione basata su **JWT** (JSON Web Token)
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
- **RNF-14** — Le variabili di configurazione sensibili (URL DB, credenziali DB, chiave segreta JWT, ecc.) devono essere gestite tramite variabili d'ambiente e mai incluse nel codice sorgente.

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

## 5. Struttura del Database (PostgreSQL)

Lo schema del database è definito in `database/ddl.sql`. Le chiavi primarie sono prevalentemente UUID (generate con `gen_random_uuid()` tramite estensione `pgcrypto`).

### 5.1 Estensioni

- `pgcrypto` (abilitata con `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`) per la generazione UUID.

### 5.2 Tabella `roles`

Ruoli applicativi (es. amministratore/utente).

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | SERIAL | PK |
| `nome` | TEXT | NOT NULL |
| `descrizione` | TEXT | opzionale |

### 5.3 Tabella `users`

Utenti del sistema.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `role_id` | INT | NOT NULL, FK → `roles(id)` (ON DELETE RESTRICT) |
| `email` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `nome` | TEXT | NOT NULL |
| `cognome` | TEXT | NOT NULL |
| `is_active` | BOOLEAN | NOT NULL, default TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default NOW() |

### 5.4 Tabella `veicoli`

Veicoli associati a un utente.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `utente_id` | UUID | NOT NULL, FK → `users(id)` (ON DELETE CASCADE) |
| `targa` | TEXT | NOT NULL, UNIQUE |
| `marca` | TEXT | opzionale |
| `modello` | TEXT | opzionale |
| `tipo` | TEXT | opzionale (es. auto/moto/...) |

### 5.5 Tabella `parcheggi`

Anagrafica parcheggi.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `nome` | TEXT | NOT NULL |
| `via` | TEXT | opzionale |
| `citta` | TEXT | opzionale |
| `cap` | TEXT | opzionale |
| `lat` | DOUBLE PRECISION | opzionale |
| `lng` | DOUBLE PRECISION | opzionale |
| `posti_totali` | INT | NOT NULL |
| `stato` | TEXT | NOT NULL |
| `descrizione` | TEXT | opzionale |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default NOW() |

> Nota: nello schema non è presente `posti_disponibili`. La disponibilità può essere calcolata come `posti_totali` meno prenotazioni attive nel range temporale.

### 5.6 Tabella `tariffe`

Tariffe per parcheggio (potenzialmente per tipo veicolo e con validità temporale).

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `parcheggio_id` | UUID | NOT NULL, FK → `parcheggi(id)` (ON DELETE CASCADE) |
| `nome` | TEXT | NOT NULL |
| `tipo_veicolo` | TEXT | opzionale |
| `prezzo_ora` | NUMERIC(10,2) | NOT NULL |
| `valido_dal` | TIMESTAMPTZ | NOT NULL |
| `valido_al` | TIMESTAMPTZ | opzionale |

### 5.7 Tabella `prenotazioni`

Prenotazioni effettuate dagli utenti.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `utente_id` | UUID | NOT NULL, FK → `users(id)` (ON DELETE CASCADE) |
| `parcheggio_id` | UUID | NOT NULL, FK → `parcheggi(id)` (ON DELETE CASCADE) |
| `veicolo_id` | UUID | NOT NULL, FK → `veicoli(id)` (ON DELETE CASCADE) |
| `tariffa_id` | UUID | NOT NULL, FK → `tariffe(id)` (ON DELETE RESTRICT) |
| `inizio` | TIMESTAMPTZ | NOT NULL |
| `fine` | TIMESTAMPTZ | NOT NULL |
| `stato` | TEXT | NOT NULL |
| `importo_totale` | NUMERIC(10,2) | opzionale |
| `note` | TEXT | opzionale |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() |

### 5.8 Tabella `emissioni_risparmio`

Serie storica dati di impatto/risparmio ambientale per parcheggio.

| Campo | Tipo | Vincoli / Note |
|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` |
| `parcheggio_id` | UUID | NOT NULL, FK → `parcheggi(id)` (ON DELETE CASCADE) |
| `data` | DATE | NOT NULL |
| `veicoli_transitati` | INT | NOT NULL |
| `km_medi_risparmiati` | NUMERIC(10,2) | opzionale |
| `co2_risparmiata_kg` | NUMERIC(10,2) | opzionale |

### 5.9 Indici

Indici presenti in `ddl.sql`:
- `idx_users_role_id` su `users(role_id)`
- `idx_veicoli_utente_id` su `veicoli(utente_id)`
- `idx_tariffe_parcheggio_id` su `tariffe(parcheggio_id)`
- `idx_prenotazioni_utente_id` su `prenotazioni(utente_id)`
- `idx_prenotazioni_parcheggio_id` su `prenotazioni(parcheggio_id)`
- `idx_prenotazioni_veicolo_id` su `prenotazioni(veicolo_id)`
- `idx_emissioni_parcheggio_id` su `emissioni_risparmio(parcheggio_id)`
