"""AI Orchestrator — sequential agent pipeline executed on new complaint creation."""

from typing import Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.department import Department
from app.models.service import Service
from app.models.complaint import Complaint
from app.agents.priority_agent import analyze_priority
from app.agents.routing_agent import route_to_department
from app.agents.duplicate_agent import detect_duplicate


async def process_new_complaint_pipeline(
    db: AsyncSession,
    org_id: int,
    service_id: int,
    location_id: int,
    description: str,
    provided_priority: str | None = None,
) -> Dict[str, Any]:
    """Sequentially executes Priority Agent -> Routing Agent -> Duplicate Detection Agent.

    Returns dict containing resolved { priority, assigned_department_id, is_duplicate, parent_complaint_id, reasoning }.
    """
    # Fetch service details
    svc_result = await db.execute(select(Service).where(Service.id == service_id))
    svc = svc_result.scalar_one_or_none()
    svc_name = svc.name if svc else ""
    default_dept_id = svc.department_id if svc else 1

    # 1. Run Priority Agent
    priority, priority_reason = analyze_priority(description, svc_name)
    resolved_priority = provided_priority if provided_priority and provided_priority != "medium" else priority

    # 2. Run Routing Agent against live DB departments list
    dept_result = await db.execute(select(Department).where(Department.org_id == org_id))
    db_departments = dept_result.scalars().all()
    departments_dict = [
        {"id": d.id, "name": d.name, "description": d.description} for d in db_departments
    ]

    routed_department_id = route_to_department(description, svc_name, departments_dict)
    # Default to service department if routing confidence is baseline
    final_department_id = routed_department_id or default_dept_id

    # 3. Run Duplicate Agent against candidate open complaints in DB
    open_comp_result = await db.execute(
        select(Complaint).where(
            Complaint.org_id == org_id,
            Complaint.status.not_in(["completed", "closed"]),
        )
    )
    open_complaints_db = open_comp_result.scalars().all()
    open_complaints_list = [
        {
            "id": c.id,
            "location_id": c.location_id,
            "service_id": c.service_id,
            "description": c.description,
        }
        for c in open_complaints_db
    ]

    is_duplicate, parent_id = detect_duplicate(
        location_id, service_id, description, open_complaints_list
    )

    print(
        f"[AI ORCHESTRATOR COMPLETED]: Priority={resolved_priority} | Department={final_department_id} | Duplicate={is_duplicate} (Parent #{parent_id})"
    )

    return {
        "priority": resolved_priority,
        "assigned_department_id": final_department_id,
        "is_duplicate": is_duplicate,
        "parent_complaint_id": parent_id,
        "reasoning": priority_reason,
    }
