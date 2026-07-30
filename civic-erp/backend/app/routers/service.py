"""Service CRUD router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceOut, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/", response_model=list[ServiceOut])
async def list_services(
    department_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Service)
    if department_id:
        q = q.where(Service.department_id == department_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{svc_id}", response_model=ServiceOut)
async def get_service(svc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == svc_id))
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(404, "Service not found")
    return svc


@router.post("/", response_model=ServiceOut, status_code=201)
async def create_service(
    body: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    svc = Service(**body.model_dump())
    db.add(svc)
    await db.flush()
    await db.refresh(svc)
    return svc


@router.put("/{svc_id}", response_model=ServiceOut)
async def update_service(
    svc_id: int,
    body: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Service).where(Service.id == svc_id))
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(404, "Service not found")
    for key, val in body.model_dump().items():
        setattr(svc, key, val)
    await db.flush()
    await db.refresh(svc)
    return svc


@router.delete("/{svc_id}", status_code=204)
async def delete_service(
    svc_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Service).where(Service.id == svc_id))
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(404, "Service not found")
    await db.delete(svc)
