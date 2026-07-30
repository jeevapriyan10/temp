"""Department model."""

from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    working_hours: Mapped[str | None] = mapped_column(String(100), nullable=True)
    escalation_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    manager_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    location_id: Mapped[int | None] = mapped_column(
        ForeignKey("locations.id"), nullable=True
    )

    # relationships
    organization = relationship("Organization", back_populates="departments")
    services = relationship("Service", back_populates="department", lazy="selectin")
    manager = relationship("User", foreign_keys=[manager_user_id], lazy="selectin")
    location = relationship("Location", lazy="selectin")
