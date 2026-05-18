import os
import uuid
import asyncio
import httpx
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends, status
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Field, SQLModel, Session, create_engine, select
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-keep-it-safe")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Database setup
sqlite_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

# Auth setup
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str

class Video(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    share_id: str = Field(index=True, unique=True)
    filename: str
    original_name: str
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

app = FastAPI()

# Ensure upload directories exist
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
TEMP_DIR = os.path.join(UPLOAD_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# Static files and templates
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def on_startup():
    create_db_and_tables()
    asyncio.create_task(keep_alive())

# Auth Endpoints
@app.post("/register")
async def register(username: str, password: str, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.username == username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user = User(username=username, hashed_password=get_password_hash(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"status": "user created"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username}

# Video Endpoints
@app.post("/upload/start")
async def upload_start(filename: str, current_user: User = Depends(get_current_user)):
    share_id = str(uuid.uuid4())[:8]
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    with open(temp_path, "wb") as f:
        pass
    return {"share_id": share_id}

@app.post("/upload/chunk/{share_id}")
async def upload_chunk(share_id: str, request: Request, current_user: User = Depends(get_current_user)):
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    if not os.path.exists(temp_path):
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    chunk_data = await request.body()
    with open(temp_path, "ab") as f:
        f.write(chunk_data)
    return {"status": "ok"}

@app.post("/upload/finalize/{share_id}")
async def upload_finalize(share_id: str, original_name: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    temp_path = os.path.join(TEMP_DIR, f"{share_id}.webm")
    if not os.path.exists(temp_path):
        raise HTTPException(status_code=404, detail="Upload session not found")
    
    final_filename = f"{share_id}.webm"
    final_path = os.path.join(UPLOAD_DIR, final_filename)
    os.rename(temp_path, final_path)
    
    video = Video(
        share_id=share_id,
        filename=final_filename,
        original_name=original_name,
        user_id=current_user.id
    )
    
    session.add(video)
    session.commit()
    session.refresh(video)
    
    return {"share_id": share_id, "url": f"/v/{share_id}"}

@app.get("/videos", response_model=List[Video])
async def list_videos(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    videos = session.exec(select(Video).where(Video.user_id == current_user.id).order_by(Video.created_at.desc())).all()
    return videos

@app.patch("/videos/{share_id}")
async def update_video(share_id: str, original_name: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Video).where(Video.share_id == share_id, Video.user_id == current_user.id)
    video = session.exec(statement).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or unauthorized")
    
    video.original_name = original_name
    session.add(video)
    session.commit()
    session.refresh(video)
    return video

@app.delete("/videos/{share_id}")
async def delete_video(share_id: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Video).where(Video.share_id == share_id, Video.user_id == current_user.id)
    video = session.exec(statement).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found or unauthorized")
    
    file_path = os.path.join(UPLOAD_DIR, video.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    session.delete(video)
    session.commit()
    return {"status": "deleted"}

@app.get("/v/{share_id}", response_class=HTMLResponse)
async def watch_video(request: Request, share_id: str, session: Session = Depends(get_session)):
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
        <link rel="stylesheet" href="/static/style.css">
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/", response_class=HTMLResponse)
async def index():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.get("/auth", response_class=HTMLResponse)
async def auth_page():
    with open("static/auth.html", "r") as f:
        return HTMLResponse(content=f.read())

async def keep_alive():
    """Background task that pings the health endpoint every 10 minutes to prevent sleep"""
    app_url = os.getenv("APP_URL")
    
    if not app_url:
        print("ℹ Keep-alive disabled (APP_URL not set - running locally)")
        return
    
    print(f"Keep-alive enabled - will ping {app_url}/health every 10 minutes")
    await asyncio.sleep(60)  # Wait 1 minute before starting pings
    
    while True:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{app_url}/health", timeout=10.0)
                print(f"✓ Keep-alive ping successful (status: {response.status_code})")
        except Exception as e:
            print(f"⚠ Keep-alive ping failed: {e}")
        
        # Wait 10 minutes before next ping
        await asyncio.sleep(600)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
