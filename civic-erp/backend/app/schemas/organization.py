"""Organization Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class OrganizationBase(BaseModel):
    name: str
    type: str  # government, university, hospital, campus, airport, industry
    country: str = "India"
    state: str = ""
    city: str = ""
    address: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    language: str = "en"


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(OrganizationBase):
    pass


class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
