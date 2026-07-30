"""AI Router — exposes AI Insights and Citizen Q&A Chatbot endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.complaint import Complaint
from app.models.service import Service
from app.models.user import User
from app.routers.analytics import get_analytics_summary
from app.agents.analytics_agent import generate_insights
from app.agents.chatbot_agent import process_chat_message

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class InsightsResponse(BaseModel):
    insights: list[str]


@router.get("/insights", response_model=InsightsResponse)
async def get_ai_insights(
    org_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_org_id = org_id or current_user.org_id
    summary = await get_analytics_summary(
        org_id=target_org_id, department_id=None, officer_id=None, db=db, current_user=current_user
    )
    insights = generate_insights(summary.model_dump())
    return InsightsResponse(insights=insights)


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch active user complaints
    c_res = await db.execute(
        select(Complaint).where(Complaint.citizen_user_id == current_user.id)
    )
    user_complaints = c_res.scalars().all()
    user_complaints_dict = [
        {
            "id": c.id,
            "description": c.description,
            "status": c.status,
            "service": {"name": c.service.name} if c.service else None,
            "department": {"name": c.department.name} if c.department else None,
            "officer": {"name": c.officer.name} if c.officer else None,
        }
        for c in user_complaints
    ]

    # Fetch services list
    s_res = await db.execute(select(Service))
    services = s_res.scalars().all()
    services_dict = [{"name": s.name, "description": s.description} for s in services]

    reply = process_chat_message(body.message, user_complaints_dict, services_dict)
    return ChatResponse(reply=reply)
