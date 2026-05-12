from flask import Blueprint, jsonify, request
import bcrypt
from uuid import uuid4

from db import get_session
from models import User
from routes.serializers import user_to_dict


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# In-memory token store: token -> user_id
_TOKENS = {}


@auth_bp.post("/login")
def login():
    session = get_session()
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify(error="missing_fields", fields=[f for f in ("email","password") if not data.get(f)]), 400

        user = session.query(User).filter(User.email == email).first()
        if not user:
            return jsonify(error="invalid_credentials"), 401

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            user.password_hash.encode("utf-8"),
        ):
            return jsonify(error="invalid_credentials"), 401

        # generate token
        token = str(uuid4())
        _TOKENS[token] = str(user.id)

        return jsonify(token=token, user=user_to_dict(user)), 200
    finally:
        session.close()


@auth_bp.post("/logout")
def logout():
    data = request.get_json() or {}
    token = data.get("token")
    if token and token in _TOKENS:
        del _TOKENS[token]
    return jsonify(logout=True), 200


@auth_bp.get("/validate")
def validate():
    token = request.args.get("token")
    if not token:
        return jsonify(valid=False), 200
    user_id = _TOKENS.get(token)
    if not user_id:
        return jsonify(valid=False), 200
    return jsonify(valid=True, user_id=user_id), 200
