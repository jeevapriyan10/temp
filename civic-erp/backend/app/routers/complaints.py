"""Complaints router — create, list, retrieve, assign, and transition status."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.db import get_db
from app.core.security import get_current_user, require_role
from app.models.complaint import Complaint, ComplaintHistory
from app.models.service import Service
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintOut,
    ComplaintAssign,
    ComplaintStatusUpdate,
)
from app.services.complaint_service import transition_complaint, trigger_notifications_for_complaint

router = APIRouter(prefix="/complaints", tags=["complaints"])


from app.agents.orchestrator import process_new_complaint_pipeline


@router.post("/", response_model=ComplaintOut, status_code=201)
async def create_complaint(
    body: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch service to verify service exists
    svc_result = await db.execute(select(Service).where(Service.id == body.service_id))
    svc = svc_result.scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")

    # Determine location
    location_id = body.location_id or current_user.working_area_location_id or 1

    # Run AI Orchestrator Pipeline (Priority Agent -> Routing Agent -> Duplicate Agent)
    ai_results = await process_new_complaint_pipeline(
        db=db,
        org_id=current_user.org_id,
        service_id=body.service_id,
        location_id=location_id,
        description=body.description,
        provided_priority=body.priority,
    )

    complaint = Complaint(
        org_id=current_user.org_id,
        service_id=body.service_id,
        citizen_user_id=current_user.id,
        location_id=location_id,
        assigned_department_id=ai_results["assigned_department_id"],
        description=body.description,
        photo_url=body.photo_url,
        priority=ai_results["priority"],
        status="reported",
        is_duplicate=ai_results["is_duplicate"],
        parent_complaint_id=ai_results["parent_complaint_id"],
    )
    db.add(complaint)
    await db.flush()

    # Initial history record
    history = ComplaintHistory(
        complaint_id=complaint.id,
        status="reported",
        changed_by_user_id=current_user.id,
        note="Complaint submitted by citizen",
    )
    db.add(history)

    # Reload with relationships
    await db.flush()
    result = await db.execute(
        select(Complaint)
        .options(
            selectinload(Complaint.history).selectinload(ComplaintHistory.changed_by),
            selectinload(Complaint.service),
            selectinload(Complaint.citizen),
            selectinload(Complaint.officer),
            selectinload(Complaint.department),
            selectinload(Complaint.location),
        )
        .where(Complaint.id == complaint.id)
    )
    created_complaint = result.scalar_one()

    # Trigger creation notifications
    await trigger_notifications_for_complaint(
        db,
        created_complaint,
        "complaint_created",
        f"New complaint #{created_complaint.id} ({svc.name}) has been logged.",
    )

    # Broadcast real-time WebSocket event
    from app.core.websocket_manager import ws_manager
    await ws_manager.broadcast_event(
        org_id=created_complaint.org_id,
        event_type="complaint_created",
        data={
            "complaint_id": created_complaint.id,
            "status": created_complaint.status,
            "department_id": created_complaint.assigned_department_id,
            "priority": created_complaint.priority,
        },
    )

    return created_complaint


@router.get("/", response_model=list[ComplaintOut])
async def list_complaints(
    org_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    officer_id: Optional[int] = Query(None),
    citizen_user_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Complaint).options(
        selectinload(Complaint.history).selectinload(ComplaintHistory.changed_by),
        selectinload(Complaint.service),
        selectinload(Complaint.citizen),
        selectinload(Complaint.officer),
        selectinload(Complaint.department),
        selectinload(Complaint.location),
    ).order_by(Complaint.created_at.desc())

    if org_id:
        q = q.where(Complaint.org_id == org_id)
    if department_id:
        q = q.where(Complaint.assigned_department_id == department_id)
    if officer_id:
        q = q.where(Complaint.assigned_officer_id == officer_id)
    if citizen_user_id:
        q = q.where(Complaint.citizen_user_id == citizen_user_id)
    if status:
        # Support comma separated status list e.g. status=assigned,in_progress
        statuses = [s.strip() for s in status.split(",") if s.strip()]
        if len(statuses) == 1:
            q = q.where(Complaint.status == statuses[0])
        elif len(statuses) > 1:
            q = q.where(Complaint.status.in_(statuses))
    if priority:
        q = q.where(Complaint.priority == priority)

    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Complaint)
        .options(
            selectinload(Complaint.history).selectinload(ComplaintHistory.changed_by),
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
    return complaint


@router.patch("/{complaint_id}/assign", response_model=ComplaintOut)
async def assign_officer(
    complaint_id: int,
    body: ComplaintAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(["super_admin", "org_admin", "department_head", "department_manager"])
    ),
):
    # Verify officer exists
    off_result = await db.execute(select(User).where(User.id == body.officer_id))
    officer = off_result.scalar_one_or_none()
    if not officer:
        raise HTTPException(status_code=404, detail="Officer user not found")

    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.assigned_officer_id = officer.id

    # Auto transition to assigned if currently reported or verified
    target_status = "assigned" if complaint.status in ["reported", "verified"] else complaint.status

    updated = await transition_complaint(
        db,
        complaint_id=complaint_id,
        new_status=target_status,
        user=current_user,
        note=f"Assigned to officer {officer.name}",
    )
    return updated


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
async def update_status(
    complaint_id: int,
    body: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = await transition_complaint(
        db,
        complaint_id=complaint_id,
        new_status=body.status,
        user=current_user,
        note=body.note,
    )
    return updated
