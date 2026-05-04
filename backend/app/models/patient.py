from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    situation: Mapped[str] = mapped_column(Text, nullable=False)
    vertical: Mapped[str] = mapped_column(String(64), nullable=False)
    lifecycle_state: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="fresh",
        server_default=text("'fresh'"),
    )
    pipeline_substate: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="PENDING_CM_ASSIGNMENT",
        server_default=text("'PENDING_CM_ASSIGNMENT'"),
    )
    ab_variant: Mapped[str | None] = mapped_column(String(32), nullable=True)
    intake_source: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="chatbot",
        server_default=text("'chatbot'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    intake_sessions = relationship(
        "IntakeSession",
        back_populates="patient",
        cascade="all, delete-orphan",
    )
