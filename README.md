# 🎥 Local Web Screen Recorder

A simple weekend project for local screen recording with webcam overlay. Everything runs locally on your machine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)

## ✨ Features

- 🖥️ **Screen Recording** - Capture your screen or specific windows
- 🎙️ **Audio Support** - Record system audio and microphone
- 📹 **Webcam Overlay** - Optional picture-in-picture webcam
- 🔒 **100% Local** - All recordings stored locally, no cloud, no tracking
- 📊 **Recording History** - See and manage all your recordings
- 🎬 **WebM Format** - VP9 video with Opus audio
- 🔗 **Easy Sharing** - Shareable links for your local recordings
- ⏯️ **Pause/Resume** - Control recording playback

## 📋 Requirements

- Python 3.8+
- Modern web browser (Chrome, Edge, Firefox recommended)

## 🚀 Quick Start

```bash
# Clone and enter directory
git clone https://github.com/Nwafor6/web-screen-recorder.git
cd screen-recorder

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python run.py
```

Open **http://localhost:8000** and start recording!

## 📖 Usage

1. **Toggle Webcam** (optional) - Check "📹 Include Webcam" for overlay
2. **Start Recording** - Click button and select what to share
3. **Pause/Resume** - Control recording as needed
4. **Stop & Save** - Click "Stop" to save your recording
5. **Share** - Copy the link or download the video

## 🏗️ Project Structure

```
screen-recorder/
├── app/                    # Main application
│   ├── models/            # Database models (Video)
│   ├── routes/            # API endpoints
│   │   ├── videos.py      # Video upload/management
│   │   └── pages.py       # HTML pages
│   ├── services/          # Business logic
│   │   └── database.py    # Database connection
│   ├── utils/             # Utilities
│   ├── config.py          # Configuration
│   └── main.py            # FastAPI app
├── static/                # Frontend assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript
│   └── html/             # HTML templates
├── uploads/              # Recorded videos
├── run.py                # Entry point
└── requirements.txt      # Dependencies
```

## 🔧 Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLModel + SQLite (database)

**Frontend:**
- Vanilla JavaScript
- MediaRecorder API (screen capture)
- Canvas API (webcam compositing)
- WebM/VP9/Opus codecs

## 🤝 Contributing

This is a simple weekend project, but contributions are welcome! Feel free to open issues or submit pull requests.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ☕ as a weekend project
