"""Workflow Engine for Complaint Transitions & Notifications."""

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.complaint import Complaint, ComplaintHistory
from app.models.notification import Notification, NotificationRule
from app.models.user import User


ALLOWED_TRANSITIONS = {
    "reported": ["verified", "assigned", "closed"],
    "verified": ["assigned", "closed"],
    "assigned": ["in_progress", "completed", "closed"],
    "in_progress": ["completed", "closed"],
    "completed": ["citizen_verified", "closed"],
    "citizen_verified": ["closed"],
    "closed": [],
}


async def trigger_notifications_for_complaint(
    db: AsyncSession,
    complaint: Complaint,
    event_type: str,
    custom_msg: str | None = None,
):
    """Generate notification records based on notification rules and target users."""
    # Find matching rules
    result = await db.execute(
        select(NotificationRule).where(
            NotificationRule.org_id == complaint.org_id,
            NotificationRule.trigger_event == event_type,
        )
    )
    rules = result.scalars().all()

    # Target users set
    target_users = set()

    # Always notify the citizen who raised it
    if complaint.citizen_user_id:
        target_users.add(complaint.citizen_user_id)

    # Notify assigned officer if assigned
    if complaint.assigned_officer_id:
        target_users.add(complaint.assigned_officer_id)

    # Check notification rules for matching roles
    for rule in rules:
        role_result = await db.execute(
            select(User).where(
                User.org_id == complaint.org_id,
                User.role.has(name=rule.notify_role),
            )
        )
        role_users = role_result.scalars().all()
        for u in role_users:
            # If department specific, filter by department
            if u.department_id and complaint.assigned_department_id and u.department_id != complaint.assigned_department_id:
                continue
            target_users.add(u.id)

    # Create notification records
    title_map = {
        "complaint_created": "New Complaint Submitted",
        "complaint_assigned": "Complaint Assigned",
        "status_changed": f"Complaint Status Updated to {complaint.status.replace('_', ' ').title()}",
        "escalated": "Complaint Escalated",
    }
    title = title_map.get(event_type, "Complaint Update")
    message = custom_msg or f"Complaint #{complaint.id} ({complaint.service.name if complaint.service else 'Service'}) is now {complaint.status.replace('_', ' ')}."

    for uid in target_users:
        notif = Notification(
            org_id=complaint.org_id,
            user_id=uid,
            title=title,
            message=message,
            related_complaint_id=complaint.id,
            is_read=False,
        )
        db.add(notif)


async def transition_complaint(
    db: AsyncSession,
    complaint_id: int,
    new_status: str,
    user: User,
    note: str | None = None,
) -> Complaint:
    """Core workflow engine function: validates transition, records history, and fires notifications."""
    result = await db.execute(
        select(Complaint)
        .options(
            selectinload(Complaint.history),
            selectinload(Complaint.service),
            selectinload(Complaint.citizen),
            selectinload(Complaint.officer),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
        )
        .where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    current_status = complaint.status

    # If same status, allow note addition without state error
    if new_status != current_status:
        allowed = ALLOWED_TRANSITIONS.get(current_status, [])
        # Super admin / org admin can override if needed, otherwise strict check
        if user.role.name not in ["super_admin", "org_admin"] and new_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from '{current_status}' to '{new_status}'",
            )

        complaint.status = new_status

    # Add audit history record
    history_entry = ComplaintHistory(
        complaint_id=complaint.id,
        status=new_status,
        changed_by_user_id=user.id,
        note=note or f"Status changed from {current_status} to {new_status} by {user.name}",
    )
    db.add(history_entry)

    # Fire notifications
    event_type = "status_changed"
    if new_status == "assigned":
        event_type = "complaint_assigned"

    await trigger_notifications_for_complaint(
        db,
        complaint,
        event_type,
        custom_msg=f"Complaint #{complaint.id} status changed to {new_status.replace('_', ' ')} by {user.name}. Note: {note or 'N/A'}"
    )

    await db.flush()
    await db.refresh(complaint)

    # Broadcast real-time WebSocket event
    from app.core.websocket_manager import ws_manager
    await ws_manager.broadcast_event(
        org_id=complaint.org_id,
        event_type=event_type,
        data={
            "complaint_id": complaint.id,
            "status": complaint.status,
            "department_id": complaint.assigned_department_id,
            "officer_id": complaint.assigned_officer_id,
            "updated_by": user.name,
        },
    )

    return complaint
