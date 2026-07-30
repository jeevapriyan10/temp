"""Location Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class LocationBase(BaseModel):
    org_id: int
    parent_location_id: Optional[int] = None
    name: str
    type: str  # zone, region, area, building, block, floor, room


class LocationCreate(LocationBase):
    pass


class LocationUpdate(LocationBase):
    pass


class LocationOut(LocationBase):
    id: int

    model_config = {"from_attributes": True}
