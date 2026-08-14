# EduLMS AI Backend - Complete Setup Guide

## 🚀 Features

✅ **10+ Free AI APIs** with automatic fallback
✅ **Image Upload + Camera Capture + Crop**
✅ **High Traffic Handling** (Redis caching + Rate limiting)
✅ **Python Scraping Fallback** (Wikipedia if all APIs fail)
✅ **OCR Text Extraction** (Tesseract)
✅ **Image Enhancement** for better OCR
✅ **Bengali Language Support**

## 📦 Free AI Providers

1. **Groq** - Super fast, free tier: 14 RPM
2. **Google Gemini** - Free tier: 60 RPM
3. **HuggingFace Inference** - Free
4. **Together AI** - Free trial $5
5. **Cohere** - Free: 100k tokens/month
6. **OpenAI GPT-4o mini** - Very cheap (~$0.0001/request)
7. **Anthropic Claude** - Free tier available
8. **Ollama Local** - Completely free (runs on machine)
9. **Perplexity AI** - Free tier
10. **Replicate** - Pay per use, very cheap

**BONUS:** Python Wikipedia Scraping (automatic fallback)

## 🛠️ Installation

### 1. Python Backend Setup

```bash
cd python-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup API Keys

```bash
# Copy example
cp .env.example .env

# Edit .env with your API keys
# Get free keys from:
# - Groq: https://console.groq.com
# - Google Gemini: https://makersuite.google.com
# - HuggingFace: https://huggingface.co/settings/tokens
# - OpenAI: https://platform.openai.com/api-keys
# - Cohere: https://dashboard.cohere.ai
# - Together AI: https://www.together.ai
# - Anthropic: https://console.anthropic.com
# - Replicate: https://replicate.com/account
```

### 3. Setup Redis (Optional but recommended for production)

```bash
# Windows
# Download: https://github.com/microsoftarchive/redis/releases
# Or use: choco install redis-64

redis-server

# Linux
sudo apt-get install redis-server
redis-server

# Mac
brew install redis
redis-server
```

### 4. Setup Ollama (Optional - for local AI)

```bash
# Download: https://ollama.ai
# Pull model: ollama pull mistral
# Run: ollama serve
```

### 5. Setup Tesseract OCR

**Windows:**
```bash
# Download installer: https://github.com/UB-Mannheim/tesseract/wiki
# Install to: C:\Program Files\Tesseract-OCR
# Set in code or environment
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

**Mac:**
```bash
brew install tesseract
```

### 6. Run Backend

```bash
# From python-backend folder
python main.py

# Server runs on: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 7. Frontend Integration

In your Chapter page component:

```tsx
import { AIImageSolver } from '@/components/admin/AIImageSolver';

export default function ChapterPage() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add AI Solver */}
      <AIImageSolver 
        onSolve={(result) => {
          console.log('Solution:', result);
        }}
      />
    </div>
  );
}
```

## 🔌 API Endpoints

### POST `/api/solve-problem`
Solve problem with multi-API fallback

**Request:**
```json
{
  "prompt": "Solve this equation: 2x + 5 = 15",
  "image_base64": "optional image data",
  "subject": "Mathematics",
  "chapter": "Algebra",
  "question_type": "math"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "x = 5",
  "provider": "groq",
  "processing_time": 1.23,
  "cached": false,
  "errors": []
}
```

### POST `/api/upload-image`
Upload image

**Response:**
```json
{
  "success": true,
  "image_base64": "...",
  "message": "Success"
}
```

### POST `/api/crop-image`
Crop image

**Request:**
```json
{
  "image_base64": "...",
  "x": 10,
  "y": 20,
  "width": 300,
  "height": 200
}
```

### POST `/api/extract-ocr`
Extract text using OCR

### POST `/api/enhance-image`
Enhance image for better OCR

### GET `/api/stats`
Get usage statistics

## 🚄 High Traffic Handling

### Features:
1. **Redis Caching** - Cache results for 24 hours
2. **Rate Limiting** - 100 requests per 60 seconds per client
3. **Image Compression** - Automatic resizing of large images
4. **Async Processing** - All operations are async
5. **GZIP Compression** - Response compression
6. **Multi-threading** - Parallel provider attempts

### Traffic Scaling:
- **100-1000 users:** Works fine with Redis + rate limiting
- **1000-10000 users:** Add load balancer (Nginx/HAProxy)
- **10000+ users:** Distribute across multiple backend instances

## 📊 Caching Strategy

```
User Request
    ↓
Check Redis Cache (24 hour TTL)
    ├─ Hit → Return cached result
    └─ Miss → Try AI Providers
         ├─ Groq (fastest)
         ├─ Google Gemini
         ├─ HuggingFace
         ├─ ...other providers...
         └─ Python Scraping (fallback)
    ↓
Cache result in Redis
    ↓
Return response
```

## 🔄 Fallback Mechanism

If an API fails:
1. Automatically tries next provider
2. Keeps track of errors
3. Last resort: Python Wikipedia scraping
4. Returns all errors if everything fails

## 🐳 Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

Build and run:
```bash
docker build -t edulms-ai .
docker run -p 8000:8000 -e REDIS_URL=redis://redis:6379 edulms-ai
```

## 🌐 Production Deployment

### Railway.app (Free):
```bash
# Install: https://docs.railway.app
# Deploy:
railway up
```

### Render (Free):
1. Connect GitHub repo
2. Create Web Service
3. Set environment variables
4. Auto-deploy on push

## ⚡ Performance Tips

1. **Use Redis** - Essential for production
2. **Enable Image Caching** - Reduces processing
3. **Set appropriate TTL** - Based on your data change rate
4. **Monitor Rate Limits** - Each API has different limits
5. **Use Ollama locally** - If you want zero API cost

## 🐛 Troubleshooting

### Redis not working?
```bash
# Check if running
redis-cli ping

# Should return: PONG
```

### API keys not working?
- Check `.env` file
- Verify keys are correct from respective platforms
- Check rate limits (may have exceeded)

### OCR not extracting text?
- Install Tesseract properly
- Check image quality
- Try "enhance-image" endpoint first

### Camera not working?
- Check browser permissions
- Must use HTTPS in production
- Works on localhost

## 📈 Monitoring

Check `/api/stats` for usage:
```bash
curl http://localhost:8000/api/stats \
  -H "X-Client-ID: user-123"
```

## 🔐 Security (Production)

1. Add authentication to `/api/*` endpoints
2. Use HTTPS only
3. Set CORS properly
4. Add request signing
5. Monitor API key usage
6. Rate limit by user, not just by IP

## 📝 Example: Add to Chapter Page

```tsx
'use client';

import { AIImageSolver } from '@/components/admin/AIImageSolver';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Chapter() {
  const [showSolver, setShowSolver] = useState(false);

  return (
    <div className="space-y-6">
      {/* Your existing chapter content */}
      
      {/* AI Solver Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-4">🤖 AI Problem Solver</h2>
        <p className="mb-4">Upload image or describe your problem to get instant solution!</p>
        
        {showSolver ? (
          <div>
            <AIImageSolver 
              onSolve={(result) => {
                console.log('Problem solved!', result);
              }}
            />
          </div>
        ) : (
          <Button 
            onClick={() => setShowSolver(true)}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Open AI Solver
          </Button>
        )}
      </div>
    </div>
  );
}
```

## 💡 Tips

- **Free APIs are limited** - Combine multiple providers for reliability
- **Cache aggressively** - Most educational questions repeat
- **Monitor costs** - Track OpenAI usage
- **Test fallbacks** - Ensure Python scraping works
- **Use OCR wisely** - Works best on clear images

## 📞 Support

For issues:
1. Check backend logs
2. Review API provider docs
3. Test individual endpoints with Swagger: http://localhost:8000/docs
4. Check environment variables
5. Verify network connectivity

## 🎓 Next Steps

1. ✅ Setup backend
2. ✅ Configure API keys
3. ✅ Test endpoints
4. ✅ Integrate into Chapter page
5. ✅ Deploy to production
6. ✅ Monitor usage and costs

Happy Learning! 🚀
