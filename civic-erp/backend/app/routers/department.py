"""Department CRUD router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("/", response_model=list[DepartmentOut])
async def list_departments(
    org_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Department)
    if org_id:
        q = q.where(Department.org_id == org_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{dept_id}", response_model=DepartmentOut)
async def get_department(dept_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(404, "Department not found")
    return dept


@router.post("/", response_model=DepartmentOut, status_code=201)
async def create_department(
    body: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    dept = Department(**body.model_dump())
    db.add(dept)
    await db.flush()
    await db.refresh(dept)
    return dept


@router.put("/{dept_id}", response_model=DepartmentOut)
async def update_department(
    dept_id: int,
    body: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(404, "Department not found")
    for key, val in body.model_dump().items():
        setattr(dept, key, val)
    await db.flush()
    await db.refresh(dept)
    return dept


@router.delete("/{dept_id}", status_code=204)
async def delete_department(
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(404, "Department not found")
    await db.delete(dept)
