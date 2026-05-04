from flask import Blueprint, jsonify

from db import get_session
from models import Parcheggio, ParcheggioStato
from routes.serializers import parcheggio_to_dict
from routes.utils import commit_or_error, get_json, parse_enum


parcheggi_bp = Blueprint("parcheggi", __name__, url_prefix="/api")


@parcheggi_bp.get("/parcheggi")
def list_parcheggi():
    session = get_session()
    try:
        parcheggi = session.query(Parcheggio).order_by(Parcheggio.created_at.desc()).all()
        return jsonify(parcheggi=[parcheggio_to_dict(item) for item in parcheggi]), 200
    finally:
        session.close()


@parcheggi_bp.post("/parcheggi")
def create_parcheggio():
    session = get_session()
    try:
        data = get_json()
        required = ["nome", "posti_totali", "stato"]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        parcheggio = Parcheggio(
            nome=data["nome"],
            via=data.get("via"),
            citta=data.get("citta"),
            cap=data.get("cap"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            posti_totali=data["posti_totali"],
            stato=parse_enum(data["stato"], ParcheggioStato, "stato"),
            descrizione=data.get("descrizione"),
        )
        session.add(parcheggio)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(parcheggio=parcheggio_to_dict(parcheggio)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@parcheggi_bp.get("/parcheggi/<uuid:parcheggio_id>")
def get_parcheggio(parcheggio_id):
    session = get_session()
    try:
        parcheggio = session.get(Parcheggio, parcheggio_id)
        if not parcheggio:
            return jsonify(error="not_found"), 404
        return jsonify(parcheggio=parcheggio_to_dict(parcheggio)), 200
    finally:
        session.close()


@parcheggi_bp.put("/parcheggi/<uuid:parcheggio_id>")
def update_parcheggio(parcheggio_id):
    session = get_session()
    try:
        parcheggio = session.get(Parcheggio, parcheggio_id)
        if not parcheggio:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "nome" in data:
            parcheggio.nome = data["nome"]
        if "via" in data:
            parcheggio.via = data["via"]
        if "citta" in data:
            parcheggio.citta = data["citta"]
        if "cap" in data:
            parcheggio.cap = data["cap"]
        if "lat" in data:
            parcheggio.lat = data["lat"]
        if "lng" in data:
            parcheggio.lng = data["lng"]
        if "posti_totali" in data:
            parcheggio.posti_totali = data["posti_totali"]
        if "stato" in data:
            parcheggio.stato = parse_enum(data["stato"], ParcheggioStato, "stato")
        if "descrizione" in data:
            parcheggio.descrizione = data["descrizione"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(parcheggio=parcheggio_to_dict(parcheggio)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@parcheggi_bp.delete("/parcheggi/<uuid:parcheggio_id>")
def delete_parcheggio(parcheggio_id):
    session = get_session()
    try:
        parcheggio = session.get(Parcheggio, parcheggio_id)
        if not parcheggio:
            return jsonify(error="not_found"), 404
        session.delete(parcheggio)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
