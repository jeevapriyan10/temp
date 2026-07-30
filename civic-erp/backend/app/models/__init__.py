"""Models package initialization - imports all models to populate registry."""

from app.models.organization import Organization
from app.models.location import Location
from app.models.department import Department
from app.models.service import Service
from app.models.role import Role
from app.models.user import User
from app.models.complaint import Complaint, ComplaintHistory
from app.models.notification import Notification, NotificationRule
from app.models.inventory import InventoryItem

__all__ = [
    "Organization",
    "Location",
    "Department",
    "Service",
    "Role",
    "User",
    "Complaint",
    "ComplaintHistory",
    "Notification",
    "NotificationRule",
    "InventoryItem",
]
