from flask import Blueprint, jsonify
from passlib.hash import bcrypt

from db import get_session
from models import User
from routes.serializers import user_to_dict
from routes.utils import commit_or_error, get_json


users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("")
def list_users():
    session = get_session()
    try:
        users = session.query(User).order_by(User.created_at.desc()).all()
        return jsonify(users=[user_to_dict(user) for user in users]), 200
    finally:
        session.close()


@users_bp.post("")
def create_user():
    session = get_session()
    try:
        data = get_json()
        required = ["role_id", "email", "password", "nome", "cognome"]
        missing = [field for field in required if field not in data]
        if missing:
            return jsonify(error="missing_fields", fields=missing), 400
        user = User(
            role_id=data["role_id"],
            email=data["email"],
            password_hash=bcrypt.hash(data["password"]),
            nome=data["nome"],
            cognome=data["cognome"],
            is_active=data.get("is_active", True),
        )
        session.add(user)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(user=user_to_dict(user)), 201
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@users_bp.get("/<uuid:user_id>")
def get_user(user_id):
    session = get_session()
    try:
        user = session.get(User, user_id)
        if not user:
            return jsonify(error="not_found"), 404
        return jsonify(user=user_to_dict(user)), 200
    finally:
        session.close()


@users_bp.put("/<uuid:user_id>")
def update_user(user_id):
    session = get_session()
    try:
        user = session.get(User, user_id)
        if not user:
            return jsonify(error="not_found"), 404
        data = get_json()
        if "role_id" in data:
            user.role_id = data["role_id"]
        if "email" in data:
            user.email = data["email"]
        if "password_hash" in data:
            return jsonify(error="invalid_field", field="password_hash"), 400
        if "password" in data:
            user.password_hash = bcrypt.hash(data["password"])
        if "nome" in data:
            user.nome = data["nome"]
        if "cognome" in data:
            user.cognome = data["cognome"]
        if "is_active" in data:
            user.is_active = data["is_active"]
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(user=user_to_dict(user)), 200
    except ValueError as exc:
        return jsonify(error="validation_error", detail=str(exc)), 400
    finally:
        session.close()


@users_bp.delete("/<uuid:user_id>")
def delete_user(user_id):
    session = get_session()
    try:
        user = session.get(User, user_id)
        if not user:
            return jsonify(error="not_found"), 404
        session.delete(user)
        error = commit_or_error(session)
        if error:
            return error
        return jsonify(deleted=True), 200
    finally:
        session.close()
