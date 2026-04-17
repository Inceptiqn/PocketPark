-- Enable UUID generation (choose one depending on your setup)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================
-- ROLES
-- ======================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descrizione TEXT
);

-- ======================
-- USERS
-- ======================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id INT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);

-- ======================
-- VEICOLI
-- ======================
CREATE TABLE veicoli (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utente_id UUID NOT NULL,
    targa TEXT NOT NULL UNIQUE,
    marca TEXT,
    modello TEXT,
    tipo TEXT,

    CONSTRAINT fk_veicoli_utente
        FOREIGN KEY (utente_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ======================
-- PARCHEGGI
-- ======================
CREATE TABLE parcheggi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    via TEXT,
    citta TEXT,
    cap TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    posti_totali INT NOT NULL,
    stato TEXT NOT NULL,
    descrizione TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ======================
-- TARIFFE
-- ======================
CREATE TABLE tariffe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcheggio_id UUID NOT NULL,
    nome TEXT NOT NULL,
    tipo_veicolo TEXT,
    prezzo_ora NUMERIC(10,2) NOT NULL,
    valido_dal TIMESTAMPTZ NOT NULL,
    valido_al TIMESTAMPTZ,

    CONSTRAINT fk_tariffe_parcheggio
        FOREIGN KEY (parcheggio_id)
        REFERENCES parcheggi(id)
        ON DELETE CASCADE
);

-- ======================
-- PRENOTAZIONI
-- ======================
CREATE TABLE prenotazioni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utente_id UUID NOT NULL,
    parcheggio_id UUID NOT NULL,
    veicolo_id UUID NOT NULL,
    tariffa_id UUID NOT NULL,
    inizio TIMESTAMPTZ NOT NULL,
    fine TIMESTAMPTZ NOT NULL,
    stato TEXT NOT NULL,
    importo_totale NUMERIC(10,2),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prenotazioni_utente
        FOREIGN KEY (utente_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prenotazioni_parcheggio
        FOREIGN KEY (parcheggio_id)
        REFERENCES parcheggi(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prenotazioni_veicolo
        FOREIGN KEY (veicolo_id)
        REFERENCES veicoli(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prenotazioni_tariffa
        FOREIGN KEY (tariffa_id)
        REFERENCES tariffe(id)
        ON DELETE RESTRICT
);

-- ======================
-- EMISSIONI RISPARMIO
-- ======================
CREATE TABLE emissioni_risparmio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcheggio_id UUID NOT NULL,
    data DATE NOT NULL,
    veicoli_transitati INT NOT NULL,
    km_medi_risparmiati NUMERIC(10,2),
    co2_risparmiata_kg NUMERIC(10,2),

    CONSTRAINT fk_emissioni_parcheggio
        FOREIGN KEY (parcheggio_id)
        REFERENCES parcheggi(id)
        ON DELETE CASCADE
);

-- ======================
-- INDEXES (important ones)
-- ======================
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_veicoli_utente_id ON veicoli(utente_id);
CREATE INDEX idx_tariffe_parcheggio_id ON tariffe(parcheggio_id);

CREATE INDEX idx_prenotazioni_utente_id ON prenotazioni(utente_id);
CREATE INDEX idx_prenotazioni_parcheggio_id ON prenotazioni(parcheggio_id);
CREATE INDEX idx_prenotazioni_veicolo_id ON prenotazioni(veicolo_id);

CREATE INDEX idx_emissioni_parcheggio_id ON emissioni_risparmio(parcheggio_id);