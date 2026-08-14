#!/bin/bash
# Quick setup script for Python backend

echo "🚀 Starting EduLMS AI Backend Setup..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Copy .env
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env with your API keys!"
    echo "   - Groq: https://console.groq.com"
    echo "   - Google Gemini: https://makersuite.google.com"
    echo "   - OpenAI: https://platform.openai.com"
fi

# Check for Tesseract
echo "🔍 Checking Tesseract OCR..."
if ! command -v tesseract &> /dev/null; then
    echo "⚠️  Tesseract not found. Install from:"
    echo "   Windows: https://github.com/UB-Mannheim/tesseract/wiki"
    echo "   Linux: sudo apt-get install tesseract-ocr"
    echo "   Mac: brew install tesseract"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env with your API keys"
echo "2. (Optional) Start Redis: redis-server"
echo "3. (Optional) Start Ollama: ollama serve"
echo "4. Run: python main.py"
echo "5. Visit: http://localhost:8000/docs"
echo ""
