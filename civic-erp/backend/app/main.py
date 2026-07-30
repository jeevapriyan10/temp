"""CivicOS FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, organization, department, service, location, users, role


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup — create tables if they don't exist (dev convenience)
    from app.core.db import engine, Base
    # import all models so Base.metadata knows about them
    import app.models.organization  # noqa
    import app.models.location  # noqa
    import app.models.department  # noqa
    import app.models.service  # noqa
    import app.models.role  # noqa
    import app.models.user  # noqa

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # shutdown
    await engine.dispose()


app = FastAPI(
    title="CivicOS API",
    version="0.1.0",
    description="Configurable Civic Operations ERP — Foundation Layer",
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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "CivicOS"}
