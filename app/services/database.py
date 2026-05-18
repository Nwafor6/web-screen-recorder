"""Database service for connection and session management."""

from sqlmodel import Session, SQLModel, create_engine
from app.config import DATABASE_URL

# Database setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Yield a database session."""
    with Session(engine) as session:
        yield session
