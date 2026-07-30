"""Organization CRUD router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationOut, OrganizationUpdate

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/", response_model=list[OrganizationOut])
async def list_organizations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization))
    return result.scalars().all()


@router.get("/{org_id}", response_model=OrganizationOut)
async def get_organization(org_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(404, "Organization not found")
    return org


@router.post("/", response_model=OrganizationOut, status_code=201)
async def create_organization(
    body: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    org = Organization(**body.model_dump())
    db.add(org)
    await db.flush()
    await db.refresh(org)
    return org


@router.put("/{org_id}", response_model=OrganizationOut)
async def update_organization(
    org_id: int,
    body: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(404, "Organization not found")
    for key, val in body.model_dump().items():
        setattr(org, key, val)
    await db.flush()
    await db.refresh(org)
    return org


@router.delete("/{org_id}", status_code=204)
async def delete_organization(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(404, "Organization not found")
    await db.delete(org)
