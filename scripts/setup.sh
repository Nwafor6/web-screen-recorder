#!/bin/bash
# Setup script for Screen Recorder application

echo "🚀 Setting up Screen Recorder..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or later."
    exit 1
fi

echo "✓ Python 3 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Generate secret key
echo "🔑 Generating secret key..."
python scripts/generate_secret_key.py

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set your SECRET_KEY (generated above)"
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p uploads/temp

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run the application: python run.py"
echo "  3. Open your browser to: http://localhost:8000"
