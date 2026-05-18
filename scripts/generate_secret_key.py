#!/usr/bin/env python3
"""Generate a secure SECRET_KEY for the application."""

import secrets

def generate_secret_key():
    """Generate a secure random secret key."""
    return secrets.token_urlsafe(32)

if __name__ == "__main__":
    key = generate_secret_key()
    print("Generated SECRET_KEY:")
    print(key)
    print("\nAdd this to your .env file:")
    print(f"SECRET_KEY={key}")
