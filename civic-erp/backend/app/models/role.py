"""Role model."""

from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )  # super_admin, org_admin, department_head, department_manager, officer, supervisor, citizen, guest, auditor
    permissions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
