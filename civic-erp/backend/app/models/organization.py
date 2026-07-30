"""Organization model."""

from datetime import datetime, timezone
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # government, university, hospital, campus, airport, industry
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="Asia/Kolkata")
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="en")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationships
    departments = relationship("Department", back_populates="organization", lazy="selectin")
    locations = relationship("Location", back_populates="organization", lazy="selectin")
    users = relationship("User", back_populates="organization", lazy="selectin")
