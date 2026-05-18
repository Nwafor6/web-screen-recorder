"""Page rendering routes."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select
from fastapi import Depends

from app.models import Video
from app.services import get_session

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def index():
    """Serve the main application page."""
    with open("static/html/index.html", "r") as f:
        return HTMLResponse(content=f.read())


@router.get("/v/{share_id}", response_class=HTMLResponse)
async def watch_video(share_id: str, session: Session = Depends(get_session)):
    """Serve the video watch page."""
    statement = select(Video).where(Video.share_id == share_id)
    video = session.exec(statement).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
        
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Watch {video.original_name} - Lumina</title>
        <link rel="stylesheet" href="/static/css/style.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
    </head>
    <body>
        <header>
            <div class="header-left">
                <a href="/" class="brand">Lumina</a>
            </div>
            <div class="header-right">
                <a href="/" class="btn secondary">Back to Dashboard</a>
            </div>
        </header>
        <main class="container">
            <div class="watch-container">
                <div class="video-card">
                    <div class="video-wrapper">
                        <video id="video-player" controls autoplay playsinline>
                            <source src="/uploads/{video.filename}" type="video/webm">
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-overlay-controls">
                            <div class="speed-control">
                                <label for="speed-select">Speed:</label>
                                <select id="speed-select" class="speed-select">
                                    <option value="1">1x</option>
                                    <option value="1.5">1.5x</option>
                                    <option value="2">2x</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <h2>{video.original_name}</h2>
                        <p>Recorded on {video.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                </div>
            </div>
        </main>
        <script>
            const video = document.getElementById('video-player');
            const speedSelect = document.getElementById('speed-select');
            
            speedSelect.addEventListener('change', (e) => {{
                video.playbackRate = parseFloat(e.target.value);
            }});
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
