def role_to_dict(role):
    return {"id": role.id, "nome": role.nome, "descrizione": role.descrizione}


def user_to_dict(user):
    return {
        "id": str(user.id),
        "role_id": user.role_id,
        "email": user.email,
        "password_hash": user.password_hash,
        "nome": user.nome,
        "cognome": user.cognome,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


def veicolo_to_dict(veicolo):
    return {
        "id": str(veicolo.id),
        "utente_id": str(veicolo.utente_id),
        "targa": veicolo.targa,
        "marca": veicolo.marca,
        "modello": veicolo.modello,
        "tipo": veicolo.tipo,
    }


def parcheggio_to_dict(parcheggio):
    return {
        "id": str(parcheggio.id),
        "nome": parcheggio.nome,
        "via": parcheggio.via,
        "citta": parcheggio.citta,
        "cap": parcheggio.cap,
        "lat": float(parcheggio.lat) if parcheggio.lat is not None else None,
        "lng": float(parcheggio.lng) if parcheggio.lng is not None else None,
        "posti_totali": parcheggio.posti_totali,
        "stato": parcheggio.stato.value,
        "descrizione": parcheggio.descrizione,
        "created_at": parcheggio.created_at.isoformat() if parcheggio.created_at else None,
        "updated_at": parcheggio.updated_at.isoformat() if parcheggio.updated_at else None,
    }


def tariffa_to_dict(tariffa):
    return {
        "id": str(tariffa.id),
        "parcheggio_id": str(tariffa.parcheggio_id),
        "nome": tariffa.nome,
        "tipo_veicolo": tariffa.tipo_veicolo,
        "prezzo_ora": float(tariffa.prezzo_ora),
        "valido_dal": tariffa.valido_dal.isoformat() if tariffa.valido_dal else None,
        "valido_al": tariffa.valido_al.isoformat() if tariffa.valido_al else None,
    }


def prenotazione_to_dict(prenotazione):
    return {
        "id": str(prenotazione.id),
        "utente_id": str(prenotazione.utente_id),
        "parcheggio_id": str(prenotazione.parcheggio_id),
        "veicolo_id": str(prenotazione.veicolo_id),
        "tariffa_id": str(prenotazione.tariffa_id),
        "inizio": prenotazione.inizio.isoformat() if prenotazione.inizio else None,
        "fine": prenotazione.fine.isoformat() if prenotazione.fine else None,
        "stato": prenotazione.stato.value,
        "importo_totale": float(prenotazione.importo_totale) if prenotazione.importo_totale is not None else None,
        "note": prenotazione.note,
        "created_at": prenotazione.created_at.isoformat() if prenotazione.created_at else None,
    }


def emissione_to_dict(record):
    return {
        "id": str(record.id),
        "parcheggio_id": str(record.parcheggio_id),
        "data": record.data.isoformat() if record.data else None,
        "veicoli_transitati": record.veicoli_transitati,
        "km_medi_risparmiati": float(record.km_medi_risparmiati) if record.km_medi_risparmiati is not None else None,
        "co2_risparmiata_kg": float(record.co2_risparmiata_kg) if record.co2_risparmiata_kg is not None else None,
    }
