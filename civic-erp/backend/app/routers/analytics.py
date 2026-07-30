"""Analytics router — real SQL aggregation summary."""

from typing import Optional
from collections import defaultdict
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, DeptCount, DailyCount

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    org_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    officer_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch all matching complaints
    base_q = select(Complaint)
    if org_id:
        base_q = base_q.where(Complaint.org_id == org_id)
    if department_id:
        base_q = base_q.where(Complaint.assigned_department_id == department_id)
    if officer_id:
        base_q = base_q.where(Complaint.assigned_officer_id == officer_id)

    res = await db.execute(base_q)
    complaints = res.scalars().all()

    total_complaints = len(complaints)

    # Status Counts
    status_counts = {
        "reported": 0,
        "verified": 0,
        "assigned": 0,
        "in_progress": 0,
        "completed": 0,
        "citizen_verified": 0,
        "closed": 0,
    }
    for c in complaints:
        if c.status in status_counts:
            status_counts[c.status] += 1
        else:
            status_counts[c.status] = 1

    # Priority Counts
    priority_counts = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "critical": 0,
    }
    for c in complaints:
        if c.priority in priority_counts:
            priority_counts[c.priority] += 1
        else:
            priority_counts[c.priority] = 1

    # Department Counts
    dept_map = defaultdict(int)
    for c in complaints:
        dept_map[c.assigned_department_id] += 1

    # Fetch departments info
    dept_q = select(Department)
    if org_id:
        dept_q = dept_q.where(Department.org_id == org_id)
    dept_res = await db.execute(dept_q)
    all_depts = dept_res.scalars().all()

    department_counts = [
        DeptCount(
            department_id=d.id,
            department_name=d.name,
            count=dept_map[d.id],
        )
        for d in all_depts
    ]

    # Daily Trend
    daily_map = defaultdict(int)
    for c in complaints:
        if c.created_at:
            dt_str = c.created_at.strftime("%Y-%m-%d")
            daily_map[dt_str] += 1

    daily_trend = [
        DailyCount(date=dt_str, count=cnt)
        for dt_str, cnt in sorted(daily_map.items())
    ]

    # Avg Resolution Time (in minutes for completed / citizen_verified / closed)
    completed_complaints = [
        c for c in complaints if c.status in ["completed", "citizen_verified", "closed"]
    ]

    if completed_complaints:
        total_diff_minutes = 0.0
        for c in completed_complaints:
            if c.updated_at and c.created_at:
                diff = (c.updated_at - c.created_at).total_seconds() / 60.0
                total_diff_minutes += max(diff, 1.0)
            else:
                total_diff_minutes += 1.0
        avg_res_time = round(total_diff_minutes / len(completed_complaints), 1)
    else:
        avg_res_time = 0.0

    return AnalyticsSummary(
        total_complaints=total_complaints,
        status_counts=status_counts,
        priority_counts=priority_counts,
        department_counts=department_counts,
        daily_trend=daily_trend,
        avg_resolution_time_minutes=avg_res_time,
    )
