"""Location CRUD router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationOut, LocationUpdate

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/", response_model=list[LocationOut])
async def list_locations(
    org_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Location)
    if org_id:
        q = q.where(Location.org_id == org_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{loc_id}", response_model=LocationOut)
async def get_location(loc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Location).where(Location.id == loc_id))
    loc = result.scalar_one_or_none()
    if not loc:
        raise HTTPException(404, "Location not found")
    return loc


@router.post("/", response_model=LocationOut, status_code=201)
async def create_location(
    body: LocationCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    loc = Location(**body.model_dump())
    db.add(loc)
    await db.flush()
    await db.refresh(loc)
    return loc


@router.put("/{loc_id}", response_model=LocationOut)
async def update_location(
    loc_id: int,
    body: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Location).where(Location.id == loc_id))
    loc = result.scalar_one_or_none()
    if not loc:
        raise HTTPException(404, "Location not found")
    for key, val in body.model_dump().items():
        setattr(loc, key, val)
    await db.flush()
    await db.refresh(loc)
    return loc


@router.delete("/{loc_id}", status_code=204)
async def delete_location(
    loc_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Location).where(Location.id == loc_id))
    loc = result.scalar_one_or_none()
    if not loc:
        raise HTTPException(404, "Location not found")
    await db.delete(loc)
