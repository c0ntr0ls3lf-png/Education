@echo off
REM Quick setup script for Windows

echo 🚀 Starting EduLMS AI Backend Setup...
echo.

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Copy .env
if not exist ".env" (
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo ⚠️  IMPORTANT: Edit .env with your API keys!
    echo    - Groq: https://console.groq.com
    echo    - Google Gemini: https://makersuite.google.com
    echo    - OpenAI: https://platform.openai.com
)

REM Check for Tesseract
echo 🔍 Checking Tesseract OCR...
where tesseract >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Tesseract not found. Download from:
    echo    https://github.com/UB-Mannheim/tesseract/wiki
)

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit .env with your API keys
echo 2. (Optional) Start Redis: redis-server
echo 3. (Optional) Start Ollama: ollama serve
echo 4. Run: python main.py
echo 5. Visit: http://localhost:8000/docs
echo.
pause
