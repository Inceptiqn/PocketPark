from flask import Blueprint, jsonify

from db import get_session
from models import Tariffa
from routes.serializers import tariffa_to_dict
from routes.utils import commit_or_error, get_json, parse_datetime, parse_uuid


tariffe_bp = Blueprint("tariffe", __name__, url_prefix="/api")


@tariffe_bp.get("/tariffe")
def list_tariffe():
    session = get_session()
    try:
        tariffe = session.query(Tariffa).order_by(Tariffa.valido_dal.desc()).all()
        return jsonify(tariffe=[tariffa_to_dict(item) for item in tariffe]), 200
    finally:
        session.close()


@tariffe_bp.post("/tariffe")
def create_tariffa():
    session = get_session()
    try:
        data = get_json()
        required = ["parcheggio_id", "nome", "prezzo_ora", "valido_dal"]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        tariffa = Tariffa(
            parcheggio_id=parse_uuid(data["parcheggio_id"], "parcheggio_id"),
            nome=data["nome"],
            tipo_veicolo=data.get("tipo_veicolo"),
            prezzo_ora=data["prezzo_ora"],
            valido_dal=parse_datetime(data["valido_dal"], "valido_dal"),
            valido_al=parse_datetime(data["valido_al"], "valido_al") if data.get("valido_al") else None,
        )
        session.add(tariffa)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(tariffa=tariffa_to_dict(tariffa)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@tariffe_bp.get("/tariffe/<uuid:tariffa_id>")
def get_tariffa(tariffa_id):
    session = get_session()
    try:
        tariffa = session.get(Tariffa, tariffa_id)
        if not tariffa:
            return jsonify(error="not_found"), 404
        return jsonify(tariffa=tariffa_to_dict(tariffa)), 200
    finally:
        session.close()


@tariffe_bp.put("/tariffe/<uuid:tariffa_id>")
def update_tariffa(tariffa_id):
    session = get_session()
    try:
        tariffa = session.get(Tariffa, tariffa_id)
        if not tariffa:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "parcheggio_id" in data:
            tariffa.parcheggio_id = parse_uuid(data["parcheggio_id"], "parcheggio_id")
        if "nome" in data:
            tariffa.nome = data["nome"]
        if "tipo_veicolo" in data:
            tariffa.tipo_veicolo = data["tipo_veicolo"]
        if "prezzo_ora" in data:
            tariffa.prezzo_ora = data["prezzo_ora"]
        if "valido_dal" in data:
            tariffa.valido_dal = parse_datetime(data["valido_dal"], "valido_dal")
        if "valido_al" in data:
            tariffa.valido_al = parse_datetime(data["valido_al"], "valido_al") if data["valido_al"] else None
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(tariffa=tariffa_to_dict(tariffa)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@tariffe_bp.delete("/tariffe/<uuid:tariffa_id>")
def delete_tariffa(tariffa_id):
    session = get_session()
    try:
        tariffa = session.get(Tariffa, tariffa_id)
        if not tariffa:
            return jsonify(error="not_found"), 404
        session.delete(tariffa)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
