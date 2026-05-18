"""Video management routes."""

import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select

from app.config import UPLOAD_DIR, TEMP_DIR
from app.models import Video
from app.services import get_session

router = APIRouter()

# Ensure upload directories exist
os.makedirs(TEMP_DIR, exist_ok=True)


@router.post("/upload/start")
async def upload_start(filename: str):
    """Start a new video upload session."""
    share_id = str(uuid.uuid4())[:8]
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    with open(temp_path, "wb") as f:
        pass
    return {"share_id": share_id}


@router.post("/upload/chunk/{share_id}")
async def upload_chunk(share_id: str, request: Request):
    """Upload a video chunk."""
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    if not os.path.exists(temp_path):
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    chunk_data = await request.body()
    with open(temp_path, "ab") as f:
        f.write(chunk_data)
    return {"status": "ok"}


@router.post("/upload/finalize/{share_id}")
async def upload_finalize(
    share_id: str,
    original_name: str,
    session: Session = Depends(get_session)
):
    """Finalize video upload and save metadata."""
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    if not os.path.exists(temp_path):
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    final_filename = f"{share_id}.webm"
    final_path = os.path.join(UPLOAD_DIR, final_filename)
    os.rename(temp_path, final_path)
    
    video = Video(
        share_id=share_id,
        filename=final_filename,
        original_name=original_name
    )
    
    session.add(video)
    session.commit()
    session.refresh(video)
    
    return {"share_id": share_id, "url": f"/v/{share_id}"}


@router.get("/videos", response_model=List[Video])
async def list_videos(session: Session = Depends(get_session)):
    """List all videos."""
    videos = session.exec(
        select(Video).order_by(Video.created_at.desc())
    ).all()
    return videos


@router.patch("/videos/{share_id}")
async def update_video(
    share_id: str,
    original_name: str,
    session: Session = Depends(get_session)
):
    """Update video metadata."""
    statement = select(Video).where(Video.share_id == share_id)
    video = session.exec(statement).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video.original_name = original_name
    session.add(video)
    session.commit()
    session.refresh(video)
    return video


@router.delete("/videos/{share_id}")
async def delete_video(
    share_id: str,
    session: Session = Depends(get_session)
):
    """Delete a video and its file."""
    statement = select(Video).where(Video.share_id == share_id)
    video = session.exec(statement).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    file_path = os.path.join(UPLOAD_DIR, video.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    session.delete(video)
    session.commit()
    return {"status": "deleted"}
