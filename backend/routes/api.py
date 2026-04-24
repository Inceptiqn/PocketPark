from flask import Blueprint, jsonify

api = Blueprint("api", __name__, url_prefix="/api")


@api.get("/health")
def health_check():
    return jsonify(status="ok"), 200


@api.get("/parcheggi")
def list_parcheggi():
    # TODO: replace with real data source
    return jsonify(parcheggi=[]), 200
