"""Background tasks utility."""

import os
import asyncio
import httpx

from app.config import APP_URL


async def keep_alive():
    """Background task that pings the health endpoint every 10 minutes to prevent sleep."""
    if not APP_URL:
        print("ℹ Keep-alive disabled (APP_URL not set - running locally)")
        return
    
    print(f"Keep-alive enabled - will ping {APP_URL}/health every 10 minutes")
    await asyncio.sleep(60)  # Wait 1 minute before starting pings
    
    while True:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{APP_URL}/health", timeout=10.0)
                print(f"✓ Keep-alive ping successful (status: {response.status_code})")
        except Exception as e:
            print(f"⚠ Keep-alive ping failed: {e}")
        
        # Wait 10 minutes before next ping
        await asyncio.sleep(600)
