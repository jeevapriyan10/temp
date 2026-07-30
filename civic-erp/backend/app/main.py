"""CivicOS FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    auth,
    organization,
    department,
    service,
    location,
    users,
    role,
    complaints,
    notifications,
    inventory,
    analytics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — create tables if they don't exist (dev convenience)
    from app.core.db import engine, Base
    import app.models  # noqa - imports all models into registry

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # shutdown
    await engine.dispose()


app = FastAPI(
    title="CivicOS API",
    version="0.2.0",
    description="Configurable Civic Operations ERP — Operations & Complaints Layer",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(organization.router)
app.include_router(department.router)
app.include_router(service.router)
app.include_router(location.router)
app.include_router(users.router)
app.include_router(role.router)
app.include_router(complaints.router)
app.include_router(notifications.router)
app.include_router(inventory.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "CivicOS"}
