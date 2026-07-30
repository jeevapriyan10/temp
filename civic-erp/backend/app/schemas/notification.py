"""Notification Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    org_id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    related_complaint_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationRuleCreate(BaseModel):
    org_id: int
    trigger_event: str
    notify_role: str
    template_text: str


class NotificationRuleOut(NotificationRuleCreate):
    id: int

    model_config = {"from_attributes": True}
