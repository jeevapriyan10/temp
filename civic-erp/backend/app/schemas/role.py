"""Role Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class RoleBase(BaseModel):
    name: str
    permissions: list[str] = []


class RoleCreate(RoleBase):
    pass


class RoleUpdate(RoleBase):
    pass


class RoleOut(RoleBase):
    id: int

    model_config = {"from_attributes": True}
