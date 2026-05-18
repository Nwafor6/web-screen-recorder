"""Video database model."""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Video(SQLModel, table=True):
    """Video model for storing recording metadata."""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    share_id: str = Field(index=True, unique=True)
    filename: str
    original_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
