"""Complaint Pydantic schemas."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.user import UserOut
from app.schemas.service import ServiceOut
from app.schemas.location import LocationOut
from app.schemas.department import DepartmentOut


class ComplaintHistoryOut(BaseModel):
    id: int
    complaint_id: int
    status: str
    changed_by_user_id: int
    note: Optional[str] = None
    created_at: datetime
    changed_by: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class ComplaintCreate(BaseModel):
    service_id: int
    description: str
    location_id: Optional[int] = None
    photo_url: Optional[str] = None
    priority: Optional[str] = "medium"


class ComplaintAssign(BaseModel):
    officer_id: int


class ComplaintStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class ComplaintOut(BaseModel):
    id: int
    org_id: int
    service_id: int
    citizen_user_id: int
    location_id: int
    assigned_department_id: int
    assigned_officer_id: Optional[int] = None
    description: str
    photo_url: Optional[str] = None
    priority: str
    status: str
    is_duplicate: bool = False
    parent_complaint_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    service: Optional[ServiceOut] = None
    citizen: Optional[UserOut] = None
    location: Optional[LocationOut] = None
    department: Optional[DepartmentOut] = None
    officer: Optional[UserOut] = None
    history: List[ComplaintHistoryOut] = []

    model_config = {"from_attributes": True}
