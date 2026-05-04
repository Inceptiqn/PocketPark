from flask import Blueprint, jsonify

from db import get_session
from models import Role
from routes.serializers import role_to_dict
from routes.utils import commit_or_error, get_json


roles_bp = Blueprint("roles", __name__, url_prefix="/api")


@roles_bp.get("/roles")
def list_roles():
    session = get_session()
    try:
        roles = session.query(Role).order_by(Role.id).all()
        return jsonify(roles=[role_to_dict(role) for role in roles]), 200
    finally:
        session.close()


@roles_bp.post("/roles")
def create_role():
    session = get_session()
    try:
        data = get_json()
        nome = data.get("nome")
        if not nome:
            return jsonify(error="missing_field", field="nome"), 400
        role = Role(nome=nome, descrizione=data.get("descrizione"))
        session.add(role)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(role=role_to_dict(role)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@roles_bp.get("/roles/<int:role_id>")
def get_role(role_id):
    session = get_session()
    try:
        role = session.get(Role, role_id)
        if not role:
            return jsonify(error="not_found"), 404
        return jsonify(role=role_to_dict(role)), 200
    finally:
        session.close()


@roles_bp.put("/roles/<int:role_id>")
def update_role(role_id):
    session = get_session()
    try:
        role = session.get(Role, role_id)
        if not role:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "nome" in data:
            role.nome = data["nome"]
        if "descrizione" in data:
            role.descrizione = data["descrizione"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(role=role_to_dict(role)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@roles_bp.delete("/roles/<int:role_id>")
def delete_role(role_id):
    session = get_session()
    try:
        role = session.get(Role, role_id)
        if not role:
            return jsonify(error="not_found"), 404
        session.delete(role)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
