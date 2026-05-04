from flask import Blueprint, jsonify

from db import get_session
from models import EmissioneRisparmio
from routes.serializers import emissione_to_dict
from routes.utils import commit_or_error, get_json, parse_date, parse_uuid


emissioni_bp = Blueprint("emissioni", __name__, url_prefix="/api")


@emissioni_bp.get("/emissioni")
def list_emissioni():
    session = get_session()
    try:
        emissioni = session.query(EmissioneRisparmio).order_by(EmissioneRisparmio.data.desc()).all()
        return jsonify(emissioni=[emissione_to_dict(item) for item in emissioni]), 200
    finally:
        session.close()


@emissioni_bp.post("/emissioni")
def create_emissione():
    session = get_session()
    try:
        data = get_json()
        required = ["parcheggio_id", "data", "veicoli_transitati"]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        record = EmissioneRisparmio(
            parcheggio_id=parse_uuid(data["parcheggio_id"], "parcheggio_id"),
            data=parse_date(data["data"], "data"),
            veicoli_transitati=data["veicoli_transitati"],
            km_medi_risparmiati=data.get("km_medi_risparmiati"),
            co2_risparmiata_kg=data.get("co2_risparmiata_kg"),
        )
        session.add(record)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(emissione=emissione_to_dict(record)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@emissioni_bp.get("/emissioni/<uuid:record_id>")
def get_emissione(record_id):
    session = get_session()
    try:
        record = session.get(EmissioneRisparmio, record_id)
        if not record:
            return jsonify(error="not_found"), 404
        return jsonify(emissione=emissione_to_dict(record)), 200
    finally:
        session.close()


@emissioni_bp.put("/emissioni/<uuid:record_id>")
def update_emissione(record_id):
    session = get_session()
    try:
        record = session.get(EmissioneRisparmio, record_id)
        if not record:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "parcheggio_id" in data:
            record.parcheggio_id = parse_uuid(data["parcheggio_id"], "parcheggio_id")
        if "data" in data:
            record.data = parse_date(data["data"], "data")
        if "veicoli_transitati" in data:
            record.veicoli_transitati = data["veicoli_transitati"]
        if "km_medi_risparmiati" in data:
            record.km_medi_risparmiati = data["km_medi_risparmiati"]
        if "co2_risparmiata_kg" in data:
            record.co2_risparmiata_kg = data["co2_risparmiata_kg"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(emissione=emissione_to_dict(record)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@emissioni_bp.delete("/emissioni/<uuid:record_id>")
def delete_emissione(record_id):
    session = get_session()
    try:
        record = session.get(EmissioneRisparmio, record_id)
        if not record:
            return jsonify(error="not_found"), 404
        session.delete(record)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
