"""Inventory Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class InventoryItemBase(BaseModel):
    department_id: int
    name: str
    quantity: int = 0
    unit: str = "units"


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None


class InventoryItemOut(InventoryItemBase):
    id: int

    model_config = {"from_attributes": True}
