"""User Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.schemas.role import RoleOut


class UserBase(BaseModel):
    org_id: int
    name: str
    email: str
    phone: Optional[str] = None
    role_id: int
    department_id: Optional[int] = None
    working_area_location_id: Optional[int] = None
    shift: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    org_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[int] = None
    department_id: Optional[int] = None
    working_area_location_id: Optional[int] = None
    shift: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime
    role: Optional[RoleOut] = None

    model_config = {"from_attributes": True}


# ---------- Auth schemas ----------
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    org_id: int
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    permissions: list[str] = []
