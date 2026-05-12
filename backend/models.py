from datetime import date, datetime
import enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class ParcheggioStato(str, enum.Enum):
    DISPONIBILE = "disponibile"
    OCCUPATO = "occupato"
    CHIUSO = "chiuso"


class PrenotazioneStato(str, enum.Enum):
    CREATA = "creata"
    CONFERMATA = "confermata"
    CANCELLATA = "cancellata"
    CONCLUSA = "conclusa"


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(Text, nullable=False)
    descrizione: Mapped[str | None] = mapped_column(Text)


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    nome: Mapped[str] = mapped_column(Text, nullable=False)
    cognome: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class Veicolo(Base):
    __tablename__ = "veicoli"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    utente_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    targa: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    marca: Mapped[str | None] = mapped_column(Text)
    modello: Mapped[str | None] = mapped_column(Text)
    tipo: Mapped[str | None] = mapped_column(Text)


class Parcheggio(Base):
    __tablename__ = "parcheggi"
    __table_args__ = (
        CheckConstraint("posti_totali > 0", name="chk_parcheggi_posti_totali_gt_zero"),
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    nome: Mapped[str] = mapped_column(Text, nullable=False)
    via: Mapped[str | None] = mapped_column(Text)
    citta: Mapped[str | None] = mapped_column(Text)
    cap: Mapped[str | None] = mapped_column(Text)
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    posti_totali: Mapped[int] = mapped_column(Integer, nullable=False)
    stato: Mapped[ParcheggioStato] = mapped_column(
        SAEnum(ParcheggioStato, name="parcheggio_stato", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    descrizione: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class Tariffa(Base):
    __tablename__ = "tariffe"
    __table_args__ = (
        CheckConstraint("prezzo_ora >= 0", name="chk_tariffe_prezzo_ora_nonneg"),
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    parcheggio_id: Mapped[UUID] = mapped_column(ForeignKey("parcheggi.id"), nullable=False)
    nome: Mapped[str] = mapped_column(Text, nullable=False)
    tipo_veicolo: Mapped[str | None] = mapped_column(Text)
    prezzo_ora: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    valido_dal: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valido_al: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Prenotazione(Base):
    __tablename__ = "prenotazioni"
    __table_args__ = (
        CheckConstraint("fine > inizio", name="chk_prenotazioni_fine_gt_inizio"),
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    utente_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    parcheggio_id: Mapped[UUID] = mapped_column(ForeignKey("parcheggi.id"), nullable=False)
    veicolo_id: Mapped[UUID] = mapped_column(ForeignKey("veicoli.id"), nullable=False)
    tariffa_id: Mapped[UUID] = mapped_column(ForeignKey("tariffe.id"), nullable=False)
    inizio: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fine: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    stato: Mapped[PrenotazioneStato] = mapped_column(
        SAEnum(PrenotazioneStato, name="prenotazione_stato", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    importo_totale: Mapped[float | None] = mapped_column(Numeric(10, 2))
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class EmissioneRisparmio(Base):
    __tablename__ = "emissioni_risparmio"
    __table_args__ = (
        CheckConstraint("veicoli_transitati >= 0", name="chk_emissioni_veicoli_transitati_nonneg"),
        CheckConstraint(
            "km_medi_risparmiati IS NULL OR km_medi_risparmiati >= 0",
            name="chk_emissioni_km_medi_risparmiati_nonneg",
        ),
        CheckConstraint(
            "co2_risparmiata_kg IS NULL OR co2_risparmiata_kg >= 0",
            name="chk_emissioni_co2_risparmiata_kg_nonneg",
        ),
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    parcheggio_id: Mapped[UUID] = mapped_column(ForeignKey("parcheggi.id"), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    veicoli_transitati: Mapped[int] = mapped_column(Integer, nullable=False)
    km_medi_risparmiati: Mapped[float | None] = mapped_column(Numeric(10, 2))
    co2_risparmiata_kg: Mapped[float | None] = mapped_column(Numeric(10, 2))
