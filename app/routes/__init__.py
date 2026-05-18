"""Routes package."""

from app.routes.videos import router as videos_router
from app.routes.pages import router as pages_router

__all__ = ["videos_router", "pages_router"]
