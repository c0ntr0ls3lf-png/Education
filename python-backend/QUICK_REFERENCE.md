# ⚡ Quick Reference - Commands & URLs

## 🎯 Start Backend (Pick One)

### Windows
```bash
cd python-backend
setup.bat
python main.py
```

### Linux/Mac
```bash
cd python-backend
bash setup.sh
python main.py
```

### Docker
```bash
cd python-backend
docker-compose up
```

## 🌐 Backend URLs

| Purpose | URL | Auth |
|---------|-----|------|
| Documentation | http://localhost:8000/docs | None |
| OpenAPI JSON | http://localhost:8000/openapi.json | None |
| Health Check | http://localhost:8000/health | None |

## 📡 API Endpoints

### 1. Solve Problem
```bash
curl -X POST http://localhost:8000/api/solve-problem \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: user-123" \
  -d '{
    "prompt": "Solve 2x + 5 = 15",
    "image_base64": null,
    "subject": "Mathematics",
    "chapter": "Algebra",
    "question_type": "math"
  }'
```

### 2. Upload Image
```bash
curl -X POST http://localhost:8000/api/upload-image \
  -H "X-Client-ID: user-123" \
  -F "file=@image.jpg"
```

### 3. Extract OCR
```bash
curl -X POST http://localhost:8000/api/extract-ocr \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: user-123" \
  -d '{"image_base64": "..."}'
```

### 4. Crop Image
```bash
curl -X POST http://localhost:8000/api/crop-image \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: user-123" \
  -d '{
    "image_base64": "...",
    "x": 10,
    "y": 20,
    "width": 300,
    "height": 200
  }'
```

### 5. Enhance Image
```bash
curl -X POST http://localhost:8000/api/enhance-image \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: user-123" \
  -d '{"image_base64": "..."}'
```

### 6. Get Stats
```bash
curl http://localhost:8000/api/stats \
  -H "X-Client-ID: user-123"
```

## 🔐 API Keys Setup

### Step 1: Get Keys
```bash
# Open these links and get API keys:
# Groq: https://console.groq.com
# Gemini: https://makersuite.google.com
# OpenAI: https://platform.openai.com/api-keys
# HuggingFace: https://huggingface.co/settings/tokens
# Cohere: https://dashboard.cohere.ai
# Together: https://www.together.ai
# Anthropic: https://console.anthropic.com
# Replicate: https://replicate.com/account
```

### Step 2: Edit .env
```bash
cd python-backend
nano .env  # or notepad .env on Windows
```

### Step 3: Paste Keys
```bash
GOOGLE_GEMINI_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
HUGGINGFACE_API_KEY=your-key-here
COHERE_API_KEY=your-key-here
TOGETHER_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

## 🧪 Test Endpoints

### Online Tools
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Postman: Import from Swagger

### Quick Test
```bash
# Health check
curl http://localhost:8000/health

# Should respond:
# {"status": "ok", "timestamp": 1703...}
```

## 📱 Frontend Integration

### Copy Component Path
```
src/components/admin/AIImageSolver.tsx
```

### Use in Page
```tsx
import { AIImageSolver } from '@/components/admin/AIImageSolver';

export default function ChapterPage() {
  return <AIImageSolver onSolve={(result) => {
    console.log('Solution:', result);
  }} />;
}
```

## 🔄 Environment Variables

### Development
```bash
DEBUG=True
REDIS_URL=redis://localhost:6379
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

### Production
```bash
DEBUG=False
REDIS_URL=redis://production-redis:6379
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_PERIOD=3600
```

## 🐳 Docker Commands

```bash
# Build
docker build -t edulms-ai .

# Run
docker run -p 8000:8000 edulms-ai

# With Redis
docker-compose up

# Stop
docker-compose down

# View logs
docker logs -f <container-id>
```

## 🚀 Deployment Commands

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway link
railway up
```

### Render
```bash
# Via GitHub:
# 1. Push to GitHub
# 2. Connect repo to Render
# 3. Deploy button
```

### Self-Hosted
```bash
# SSH into server
ssh user@server

# Clone repo
git clone <repo>
cd python-backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
python main.py
```

## 📊 Monitoring

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### View Logs (Docker)
```bash
docker logs -f <container>
```

### View Logs (Systemd)
```bash
sudo journalctl -u edulms-ai -f
```

### Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

## 🔧 Common Issues & Fixes

### Port Already In Use
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill it
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in main.py:
# uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server  # Mac/Linux
redis-server.exe  # Windows
```

### API Key Errors
```bash
# Verify .env is read
python -c "from config import settings; print(settings.groq_api_key)"

# Should show your key (not None)
```

### CORS Errors
```bash
# Update main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "https://yourdomain.com"],
)

# Restart backend
```

## 📈 Performance Tuning

### Increase Cache TTL
```python
# cache_manager.py
cache_manager.set(prompt, result, ttl=604800)  # 7 days
```

### Increase Rate Limit
```python
# rate_limiter.py
rate_limiter = RateLimiter(requests=1000, period=3600)
```

### Increase Image Size
```bash
# .env
MAX_IMAGE_SIZE_MB=50
```

### Parallel Provider Timeout
```python
# ai_providers.py
asyncio.sleep(0.5)  # Reduce from 0.5 to 0.1
```

## 🧬 Development Commands

### Format Code
```bash
# Install black
pip install black

# Format
black .
```

### Type Checking
```bash
# Install mypy
pip install mypy

# Check
mypy main.py
```

### Run Tests
```bash
# Install pytest
pip install pytest

# Run
pytest
```

## 📦 Update Dependencies

```bash
# Check outdated
pip list --outdated

# Update specific
pip install --upgrade fastapi

# Update all
pip install -r requirements.txt --upgrade
```

## 🎯 Response Codes

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 400 | ❌ Bad request |
| 429 | ⏱️ Rate limited |
| 500 | 🔥 Server error |
| 503 | 😴 Service unavailable |

## 💡 Pro Tips

### Tip 1: Use multiple clients
```bash
# Each gets own rate limit
curl ... -H "X-Client-ID: user-1"
curl ... -H "X-Client-ID: user-2"
```

### Tip 2: Cache aggressively
```bash
# Save in local browser storage
localStorage.setItem('solution-123', JSON.stringify(result))
```

### Tip 3: Batch requests
```bash
# Send 5 problems at once
Promise.all([
  fetch('/api/solve', { body: problem1 }),
  fetch('/api/solve', { body: problem2 }),
])
```

### Tip 4: Monitor costs
```bash
# Track OpenAI usage
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 🚨 Emergency Fix

### Backend won't start?
```bash
# 1. Check Python version
python --version

# 2. Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# 3. Check for port conflicts
lsof -i :8000

# 4. Run with verbose
python -u main.py

# 5. Check logs for errors
```

### Still broken?
1. Delete `venv` folder
2. Run `setup.sh` or `setup.bat`
3. Check .env file
4. Try Python 3.11+
5. Check internet connection

## 📞 Getting Help

### Resources
- Backend Docs: http://localhost:8000/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Groq Docs: https://console.groq.com/docs
- Discord (FastAPI): https://discord.gg/VQjSZaeJmf

### Debug Mode
```bash
# Edit .env
DEBUG=True

# Run with logs
python -u main.py 2>&1 | tee debug.log
```

## 🎓 Learning Path

1. Start with Groq (simplest)
2. Add Gemini (free tier)
3. Add HuggingFace (great models)
4. Optional: Add OpenAI (powerful but $)
5. Deploy to Railway (simple)
6. Monitor with logs
7. Scale as needed

---

**Save this page! Bookmark http://localhost:8000/docs**

Everything you need in one place! 🚀
