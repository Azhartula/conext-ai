from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.core.config import get_settings
from backend.routes.extract import router as extract_router
from backend.routes.improve import router as improve_router
from backend.routes.dedupe import router as dedupe_router
from backend.routes.contacts import router as contacts_router
from backend.database.connection import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="ConExt.AI - Contact Extraction API",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
allowed_origins = [origin.strip() for origin in settings.allow_origin.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract_router, prefix="/extract", tags=["extract"])
app.include_router(improve_router, prefix="/improve", tags=["improve"])
app.include_router(dedupe_router, prefix="/dedupe", tags=["dedupe"])
app.include_router(contacts_router, prefix="/contacts", tags=["contacts"])


@app.get("/health", tags=["health"])  # pragma: no cover
async def health_check() -> dict[str, str]:
    """Simple health endpoint for uptime checks."""
    return {"status": "ok"}
