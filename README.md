# 🎥 Local Web Screen Recorder

A privacy-focused, local-first screen recording web application with webcam overlay support. No cloud uploads, no tracking, all recordings stay on your machine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

## ✨ Features

- 🖥️ **Screen Recording** - Capture your entire screen or specific windows
- 🎙️ **Audio Support** - Record system audio and microphone
- 📹 **Webcam Overlay** - Optional picture-in-picture webcam in recordings
- 🔒 **100% Local** - All recordings stored locally, no cloud uploads
- 👤 **User Authentication** - Secure JWT-based user accounts
- 📊 **Recording History** - Track and manage your recordings
- 🎬 **WebM Format** - High-quality VP9 video codec with Opus audio
- 🔗 **Easy Sharing** - Generate shareable links for your recordings
- ⏯️ **Pause/Resume** - Full control during recording
- 🚀 **Tab-Safe Recording** - Continues recording even when you switch tabs

## 🔒 Privacy & Security

- **Local Storage**: All videos saved to your machine in `uploads/` directory
- **No Telemetry**: Zero tracking, analytics, or external requests
- **Secure Authentication**: Argon2 password hashing + JWT tokens
- **HTTPS Ready**: Works on localhost or with HTTPS for secure context

## 📋 Requirements

- Python 3.8 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)
- Must access via `http://localhost` or HTTPS (browser security requirement)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Nwafor6/web-screen-recorder.git
cd screen-recorder
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
```

**⚠️ IMPORTANT**: Edit `.env` and change `SECRET_KEY` to a secure random string:
```bash
# Generate a secure key:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Run the application
```bash
python main.py
```

### 6. Open in browser
Navigate to: **http://localhost:8000**

⚠️ **Must use `localhost`**

## 📖 Usage

1. **Register/Login** - Create an account on first visit
2. **Toggle Webcam** (optional) - Check "📹 Include Webcam" for picture-in-picture overlay
3. **Start Recording** - Click "Start Recording" and select what to share
4. **Pause/Resume** - Control recording with pause/resume buttons
5. **Stop & Save** - Click "Stop" to finalize and save your recording
6. **Share** - Copy the generated share link or download the video

## 🛠️ Configuration

Edit `.env` file for customization:

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key (⚠️ MUST CHANGE!) | `your-secret-key-keep-it-safe` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `1440` (24 hours) |
| `DATABASE_URL` | Database location | `sqlite:///database.db` |

## 🏗️ Project Structure

```
screen-recorder/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
├── static/
│   ├── index.html       # Main UI
│   ├── auth.html        # Login/Register page
│   ├── app.js           # Recording logic
│   └── style.css        # Styling
├── uploads/             # Recorded videos (gitignored)
│   └── temp/            # Temporary chunks
└── database.db          # SQLite database (gitignored)
```

## 🔧 Technical Details

**Backend:**
- FastAPI (Python web framework)
- SQLModel + SQLite (database)
- JWT authentication (python-jose)
- Argon2 password hashing (passlib)

**Frontend:**
- Vanilla JavaScript (no framework dependencies)
- MediaRecorder API (screen capture)
- Canvas API (webcam compositing)
- WebM container (VP9 + Opus codecs)

**Recording Process:**
1. Captures screen via `getDisplayMedia()`
2. Optional: Captures webcam via `getUserMedia()`
3. If webcam enabled: Composites streams on canvas (30 FPS)
4. Streams chunks to server during recording
5. Finalizes and saves on stop

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](#) file for details.
---

**⭐ If you find this useful, please consider giving it a star!**
