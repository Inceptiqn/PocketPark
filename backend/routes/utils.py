from datetime import date, datetime
import uuid

from flask import jsonify, request
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


def parse_uuid(value, field_name):
    try:
        return uuid.UUID(str(value))
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a valid UUID")


def parse_datetime(value, field_name):
    try:
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an ISO datetime string")


def parse_date(value, field_name):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an ISO date string")


def parse_enum(value, enum_type, field_name):
    try:
        return enum_type(value)
    except (TypeError, ValueError):
        allowed = ", ".join([item.value for item in enum_type])
        raise ValueError(f"{field_name} must be one of: {allowed}")


def get_json():
    data = request.get_json(silent=True)
    if data is None:
        raise ValueError("body must be a valid JSON object")
    return data


def commit_or_error(session):
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        return jsonify(error="integrity_error", detail=str(exc.orig)), 400
    except SQLAlchemyError as exc:
        session.rollback()
        return jsonify(error="db_error", detail=str(exc)), 500
    return None
