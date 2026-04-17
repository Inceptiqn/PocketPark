-- Enable UUID generation (choose one depending on your setup)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================
-- ENUMS (stati)
-- ======================
DO $$ BEGIN
    CREATE TYPE parcheggio_stato AS ENUM ('disponibile', 'occupato', 'chiuso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prenotazione_stato AS ENUM ('creata', 'confermata', 'cancellata', 'conclusa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
    stato parcheggio_stato NOT NULL,
    descrizione TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_parcheggi_posti_totali_gt_zero CHECK (posti_totali > 0)
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
        ON DELETE CASCADE,

    CONSTRAINT chk_tariffe_prezzo_ora_nonneg CHECK (prezzo_ora >= 0)
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
    stato prenotazione_stato NOT NULL,
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
        ON DELETE RESTRICT,

    CONSTRAINT chk_prenotazioni_fine_gt_inizio CHECK (fine > inizio)
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
        ON DELETE CASCADE,

    CONSTRAINT chk_emissioni_veicoli_transitati_nonneg CHECK (veicoli_transitati >= 0),
    CONSTRAINT chk_emissioni_km_medi_risparmiati_nonneg CHECK (km_medi_risparmiati IS NULL OR km_medi_risparmiati >= 0),
    CONSTRAINT chk_emissioni_co2_risparmiata_kg_nonneg CHECK (co2_risparmiata_kg IS NULL OR co2_risparmiata_kg >= 0)
);

-- ======================
-- TRIGGERS updated_at
-- ======================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_parcheggi_set_updated_at ON parcheggi;
CREATE TRIGGER trg_parcheggi_set_updated_at
BEFORE UPDATE ON parcheggi
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();