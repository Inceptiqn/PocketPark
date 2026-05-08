import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


_ENGINE = None


def get_engine():
    global _ENGINE
    if _ENGINE is None:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise RuntimeError("DATABASE_URL is not set")
        _ENGINE = create_engine(db_url, pool_pre_ping=True)
    return _ENGINE


def get_session():
    engine = get_engine()
    SessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        expire_on_commit=False,
    )
    return SessionLocal()
