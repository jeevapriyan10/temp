"""Complaint and ComplaintHistory ORM models."""

from datetime import datetime
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    citizen_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    assigned_department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    assigned_officer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="reported")  # reported, verified, assigned, in_progress, completed, citizen_verified, closed
    is_duplicate: Mapped[bool] = mapped_column(Integer, nullable=False, default=0)
    parent_complaint_id: Mapped[int | None] = mapped_column(ForeignKey("complaints.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    organization = relationship("Organization", lazy="selectin")
    service = relationship("Service", lazy="selectin")
    citizen = relationship("User", foreign_keys=[citizen_user_id], lazy="selectin")
    location = relationship("Location", lazy="selectin")
    department = relationship("Department", foreign_keys=[assigned_department_id], lazy="selectin")
    officer = relationship("User", foreign_keys=[assigned_officer_id], lazy="selectin")
    history = relationship("ComplaintHistory", back_populates="complaint", order_by="ComplaintHistory.created_at", lazy="selectin", cascade="all, delete-orphan")


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    complaint = relationship("Complaint", back_populates="history")
    changed_by = relationship("User", lazy="selectin")
