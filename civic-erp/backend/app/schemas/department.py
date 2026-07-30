"""Department Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class DepartmentBase(BaseModel):
    org_id: int
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    working_hours: Optional[str] = None
    escalation_time_minutes: Optional[int] = None
    manager_user_id: Optional[int] = None
    location_id: Optional[int] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(DepartmentBase):
    pass


class DepartmentOut(DepartmentBase):
    id: int

    model_config = {"from_attributes": True}
