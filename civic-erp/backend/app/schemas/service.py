"""Service Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class ServiceBase(BaseModel):
    department_id: int
    name: str
    description: Optional[str] = None
    default_priority: str = "medium"


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(ServiceBase):
    pass


class ServiceOut(ServiceBase):
    id: int

    model_config = {"from_attributes": True}
