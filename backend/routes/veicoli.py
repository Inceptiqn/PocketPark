from flask import Blueprint, jsonify

from db import get_session
from models import Veicolo
from routes.serializers import veicolo_to_dict
from routes.utils import commit_or_error, get_json, parse_uuid


veicoli_bp = Blueprint("veicoli", __name__, url_prefix="/api/veicoli")


@veicoli_bp.get("")
def list_veicoli():
    session = get_session()
    try:
        veicoli = session.query(Veicolo).order_by(Veicolo.targa).all()
        return jsonify(veicoli=[veicolo_to_dict(item) for item in veicoli]), 200
    finally:
        session.close()


@veicoli_bp.post("")
def create_veicolo():
    session = get_session()
    try:
        data = get_json()
        required = ["utente_id", "targa"]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        veicolo = Veicolo(
            utente_id=parse_uuid(data["utente_id"], "utente_id"),
            targa=data["targa"],
            marca=data.get("marca"),
            modello=data.get("modello"),
            tipo=data.get("tipo"),
        )
        session.add(veicolo)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(veicolo=veicolo_to_dict(veicolo)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@veicoli_bp.get("/<uuid:veicolo_id>")
def get_veicolo(veicolo_id):
    session = get_session()
    try:
        veicolo = session.get(Veicolo, veicolo_id)
        if not veicolo:
            return jsonify(error="not_found"), 404
        return jsonify(veicolo=veicolo_to_dict(veicolo)), 200
    finally:
        session.close()


@veicoli_bp.put("/<uuid:veicolo_id>")
def update_veicolo(veicolo_id):
    session = get_session()
    try:
        veicolo = session.get(Veicolo, veicolo_id)
        if not veicolo:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "utente_id" in data:
            veicolo.utente_id = parse_uuid(data["utente_id"], "utente_id")
        if "targa" in data:
            veicolo.targa = data["targa"]
        if "marca" in data:
            veicolo.marca = data["marca"]
        if "modello" in data:
            veicolo.modello = data["modello"]
        if "tipo" in data:
            veicolo.tipo = data["tipo"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(veicolo=veicolo_to_dict(veicolo)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@veicoli_bp.delete("/<uuid:veicolo_id>")
def delete_veicolo(veicolo_id):
    session = get_session()
    try:
        veicolo = session.get(Veicolo, veicolo_id)
        if not veicolo:
            return jsonify(error="not_found"), 404
        session.delete(veicolo)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
