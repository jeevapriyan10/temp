"""Notification and NotificationRule ORM models."""

from datetime import datetime
from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    related_complaint_id: Mapped[int | None] = mapped_column(ForeignKey("complaints.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", lazy="selectin")
    related_complaint = relationship("Complaint", lazy="selectin")


class NotificationRule(Base):
    __tablename__ = "notification_rules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    trigger_event: Mapped[str] = mapped_column(String(50), nullable=False)  # complaint_created, complaint_assigned, status_changed, escalated
    notify_role: Mapped[str] = mapped_column(String(50), nullable=False)  # super_admin, org_admin, department_head, department_manager, officer, supervisor, citizen
    template_text: Mapped[str] = mapped_column(Text, nullable=False)
