-- Seed data for PocketPark (PostgreSQL)
-- Assumes ddl.sql already applied and pgcrypto extension enabled.

BEGIN;

-- ======================
-- ROLES
-- ======================
INSERT INTO roles (id, nome, descrizione) VALUES
    (1, 'admin', 'Amministratore di sistema'),
    (2, 'manager', 'Gestore parcheggi'),
    (3, 'user', 'Utente standard')
ON CONFLICT (id) DO NOTHING;

-- ======================
-- USERS
-- ======================
-- Passwords: admin123!, manager123!, user123!, user2_123!
INSERT INTO users (id, role_id, email, password_hash, nome, cognome, is_active, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 'admin@pocketpark.local', '$2b$12$M49IfkXWZ6AwAdhDCIJ/QeDU0NyX81lP0RdgGv2KmrvlrFyq4Tt1O', 'Mario', 'Rossi', TRUE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222222', 2, 'manager@pocketpark.local', '$2b$12$J4ruXbu0TCwfYaTpTBaw8.Vi7VHpqXjeD8oCuVvURQW6sX2lH5Ki2', 'Giulia', 'Bianchi', TRUE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333333', 3, 'user1@pocketpark.local', '$2b$12$5OkK8awtdPngNP9vJiBQveP6Nr9uPBkfltqpNG5QUvEX0BWn2h7ia', 'Luca', 'Verdi', TRUE, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 hour'),
    ('44444444-4444-4444-4444-444444444444', 3, 'user2@pocketpark.local', '$2b$12$wkz150VJxFUutTI215Q4PeoXytiki4zt9W.FC5opzHn/s6qSxvn..', 'Sara', 'Neri', TRUE, NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ======================
-- VEICOLI
-- ======================
INSERT INTO veicoli (id, utente_id, targa, marca, modello, tipo) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'AB123CD', 'Fiat', 'Panda', 'auto'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'EF456GH', 'Yamaha', 'X-Max', 'moto'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'IJ789KL', 'Tesla', 'Model 3', 'auto')
ON CONFLICT (id) DO NOTHING;

-- ======================
-- PARCHEGGI
-- ======================
INSERT INTO parcheggi (id, nome, via, citta, cap, lat, lng, posti_totali, stato, descrizione, created_at, updated_at) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Park Centro', 'Via Roma 1', 'Milano', '20100', 45.4642, 9.1900, 120, 'disponibile', 'Parcheggio coperto in centro', NOW() - INTERVAL '90 days', NOW() - INTERVAL '5 days'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Park Stazione', 'Piazza Duca 10', 'Torino', '10100', 45.0703, 7.6869, 80, 'occupato', 'Parcheggio vicino alla stazione', NOW() - INTERVAL '60 days', NOW() - INTERVAL '3 days'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Park Aeroporto', 'Viale Aeroporto 5', 'Roma', '00100', 41.9028, 12.4964, 200, 'disponibile', 'Parcheggio lunga sosta', NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ======================
-- TARIFFE
-- ======================
INSERT INTO tariffe (id, parcheggio_id, nome, tipo_veicolo, prezzo_ora, valido_dal, valido_al) VALUES
    ('10101010-1010-1010-1010-101010101010', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Standard Auto', 'auto', 2.50, NOW() - INTERVAL '120 days', NULL),
    ('20202020-2020-2020-2020-202020202020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Moto', 'moto', 1.50, NOW() - INTERVAL '120 days', NULL),
    ('30303030-3030-3030-3030-303030303030', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Standard', NULL, 2.00, NOW() - INTERVAL '90 days', NULL),
    ('40404040-4040-4040-4040-404040404040', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Lunga Sosta', 'auto', 1.20, NOW() - INTERVAL '60 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- ======================
-- PRENOTAZIONI
-- ======================
INSERT INTO prenotazioni (id, utente_id, parcheggio_id, veicolo_id, tariffa_id, inizio, fine, stato, importo_totale, note, created_at) VALUES
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10101010-1010-1010-1010-101010101010', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 hours', 'confermata', 7.50, 'Prenotazione breve', NOW() - INTERVAL '2 days'),
    ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '20202020-2020-2020-2020-202020202020', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', 'conclusa', 3.00, NULL, NOW() - INTERVAL '5 days'),
    ('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '30303030-3030-3030-3030-303030303030', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 'creata', 8.00, 'In attesa conferma', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ======================
-- EMISSIONI RISPARMIO
-- ======================
INSERT INTO emissioni_risparmio (id, parcheggio_id, data, veicoli_transitati, km_medi_risparmiati, co2_risparmiata_kg) VALUES
    ('88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE - 7, 120, 2.50, 35.40),
    ('99999999-9999-9999-9999-999999999999', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE - 6, 95, 1.80, 22.10),
    ('abababab-abab-abab-abab-abababababab', 'ffffffff-ffff-ffff-ffff-ffffffffffff', CURRENT_DATE - 5, 200, 3.20, 60.00)
ON CONFLICT (id) DO NOTHING;

COMMIT;
