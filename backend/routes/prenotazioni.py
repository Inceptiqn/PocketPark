from flask import Blueprint, jsonify

from db import get_session
from models import Prenotazione, PrenotazioneStato
from routes.serializers import prenotazione_to_dict
from routes.utils import commit_or_error, get_json, parse_datetime, parse_enum, parse_uuid


prenotazioni_bp = Blueprint("prenotazioni", __name__, url_prefix="/api")


@prenotazioni_bp.get("/prenotazioni")
def list_prenotazioni():
    session = get_session()
    try:
        prenotazioni = session.query(Prenotazione).order_by(Prenotazione.created_at.desc()).all()
        return jsonify(prenotazioni=[prenotazione_to_dict(item) for item in prenotazioni]), 200
    finally:
        session.close()


@prenotazioni_bp.post("/prenotazioni")
def create_prenotazione():
    session = get_session()
    try:
        data = get_json()
        required = [
            "utente_id",
            "parcheggio_id",
            "veicolo_id",
            "tariffa_id",
            "inizio",
            "fine",
            "stato",
        ]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        prenotazione = Prenotazione(
            utente_id=parse_uuid(data["utente_id"], "utente_id"),
            parcheggio_id=parse_uuid(data["parcheggio_id"], "parcheggio_id"),
            veicolo_id=parse_uuid(data["veicolo_id"], "veicolo_id"),
            tariffa_id=parse_uuid(data["tariffa_id"], "tariffa_id"),
            inizio=parse_datetime(data["inizio"], "inizio"),
            fine=parse_datetime(data["fine"], "fine"),
            stato=parse_enum(data["stato"], PrenotazioneStato, "stato"),
            importo_totale=data.get("importo_totale"),
            note=data.get("note"),
        )
        session.add(prenotazione)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(prenotazione=prenotazione_to_dict(prenotazione)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@prenotazioni_bp.get("/prenotazioni/<uuid:prenotazione_id>")
def get_prenotazione(prenotazione_id):
    session = get_session()
    try:
        prenotazione = session.get(Prenotazione, prenotazione_id)
        if not prenotazione:
            return jsonify(error="not_found"), 404
        return jsonify(prenotazione=prenotazione_to_dict(prenotazione)), 200
    finally:
        session.close()


@prenotazioni_bp.put("/prenotazioni/<uuid:prenotazione_id>")
def update_prenotazione(prenotazione_id):
    session = get_session()
    try:
        prenotazione = session.get(Prenotazione, prenotazione_id)
        if not prenotazione:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "utente_id" in data:
            prenotazione.utente_id = parse_uuid(data["utente_id"], "utente_id")
        if "parcheggio_id" in data:
            prenotazione.parcheggio_id = parse_uuid(data["parcheggio_id"], "parcheggio_id")
        if "veicolo_id" in data:
            prenotazione.veicolo_id = parse_uuid(data["veicolo_id"], "veicolo_id")
        if "tariffa_id" in data:
            prenotazione.tariffa_id = parse_uuid(data["tariffa_id"], "tariffa_id")
        if "inizio" in data:
            prenotazione.inizio = parse_datetime(data["inizio"], "inizio")
        if "fine" in data:
            prenotazione.fine = parse_datetime(data["fine"], "fine")
        if "stato" in data:
            prenotazione.stato = parse_enum(data["stato"], PrenotazioneStato, "stato")
        if "importo_totale" in data:
            prenotazione.importo_totale = data["importo_totale"]
        if "note" in data:
            prenotazione.note = data["note"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(prenotazione=prenotazione_to_dict(prenotazione)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@prenotazioni_bp.delete("/prenotazioni/<uuid:prenotazione_id>")
def delete_prenotazione(prenotazione_id):
    session = get_session()
    try:
        prenotazione = session.get(Prenotazione, prenotazione_id)
        if not prenotazione:
            return jsonify(error="not_found"), 404
        session.delete(prenotazione)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
