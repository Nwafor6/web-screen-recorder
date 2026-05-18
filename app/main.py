"""FastAPI application initialization."""

import asyncio
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.services import create_db_and_tables
from app.routes import videos_router, pages_router
from app.utils.background import keep_alive
from app.config import UPLOAD_DIR

# Create FastAPI app
app = FastAPI(
    title="Screen Recorder",
    description="Privacy-focused local screen recording application",
    version="1.0.0"
)

# Ensure required directories exist
os.makedirs("static", exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files and uploads
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(videos_router, tags=["Videos"])
app.include_router(pages_router, tags=["Pages"])


@app.on_event("startup")
async def on_startup():
    """Run on application startup."""
    create_db_and_tables()
    asyncio.create_task(keep_alive())
