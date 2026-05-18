"""Application configuration settings."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-keep-it-safe")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

# Storage Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
TEMP_DIR = os.path.join(UPLOAD_DIR, "temp")

# Application Configuration
APP_URL = os.getenv("APP_URL")
