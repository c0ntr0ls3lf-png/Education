"""
FastAPI Backend - AI Solution Provider with Multi-API Integration
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import time
from typing import Optional
import base64

from config import settings
from ai_providers import ai_providers
from image_processor import image_processor
from cache_manager import cache_manager
from rate_limiter import rate_limiter

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="EduLMS AI Backend", version="1.0.0")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
from pydantic import BaseModel

class SolutionRequest(BaseModel):
    prompt: str
    image_base64: Optional[str] = None
    subject: Optional[str] = None
    chapter: Optional[str] = None
    question_type: Optional[str] = None  # mcq, creative, math

class SolutionResponse(BaseModel):
    success: bool
    answer: Optional[str]
    provider: Optional[str]
    processing_time: float
    cached: bool
    errors: Optional[list]

# Routes
@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "timestamp": time.time()}

@app.post("/api/solve-problem", response_model=SolutionResponse)
async def solve_problem(
    request: SolutionRequest,
    x_client_id: str = Header(default="anonymous")
):
    """
    Main endpoint: Solve problem with image (optional)
    
    Multi-API integration with fallback:
    1. Groq (fastest)
    2. Google Gemini
    3. HuggingFace
    4. Together AI
    5. Cohere
    6. OpenAI
    7. Anthropic
    8. Local Ollama
    9. Perplexity
    10. Replicate
    Fallback: Python Wikipedia Scraping
    """
    
    start_time = time.time()
    
    # Rate limiting
    if not rate_limiter.is_allowed(x_client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    try:
        # Build enhanced prompt
        prompt = request.prompt
        if request.subject:
            prompt = f"Subject: {request.subject}\n{prompt}"
        if request.chapter:
            prompt = f"Chapter: {request.chapter}\n{prompt}"
        if request.question_type:
            prompt = f"Question Type: {request.question_type}\n{prompt}"
        
        # Extract OCR if image provided
        ocr_text = None
        if request.image_base64:
            ocr_text = image_processor.extract_text_ocr(request.image_base64)
            if ocr_text:
                prompt = f"{prompt}\n\nImage text: {ocr_text}"
        
        # Check cache
        cached_result = cache_manager.get(prompt, request.image_base64)
        if cached_result:
            return SolutionResponse(
                success=True,
                answer=cached_result.get("answer"),
                provider=cached_result.get("provider"),
                processing_time=time.time() - start_time,
                cached=True,
                errors=None
            )
        
        # Solve with AI providers
        result = await ai_providers.solve_with_fallback(prompt, request.image_base64)
        
        # Cache successful result
        if result["success"]:
            cache_manager.set(prompt, result, request.image_base64)
        
        return SolutionResponse(
            success=result["success"],
            answer=result["answer"],
            provider=result["provider"],
            processing_time=time.time() - start_time,
            cached=False,
            errors=result.get("errors")
        )
    
    except Exception as e:
        logger.error(f"Error in solve_problem: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), x_client_id: str = Header(default="anonymous")):
    """Upload and process image"""
    
    # Rate limiting
    if not rate_limiter.is_allowed(x_client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    success, message, img_base64 = await image_processor.process_upload(
        file, 
        max_size_mb=settings.max_image_size_mb
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {
        "success": True,
        "image_base64": img_base64,
        "message": message
    }

@app.post("/api/crop-image")
async def crop_image(
    image_base64: str,
    x: int,
    y: int,
    width: int,
    height: int,
    x_client_id: str = Header(default="anonymous")
):
    """Crop image"""
    
    if not rate_limiter.is_allowed(x_client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    cropped = image_processor.crop_image(image_base64, x, y, width, height)
    
    if not cropped:
        raise HTTPException(status_code=400, detail="Crop failed")
    
    return {"success": True, "image_base64": cropped}

@app.post("/api/extract-ocr")
async def extract_ocr(
    image_base64: str,
    x_client_id: str = Header(default="anonymous")
):
    """Extract text from image using OCR"""
    
    if not rate_limiter.is_allowed(x_client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    text = image_processor.extract_text_ocr(image_base64)
    
    return {
        "success": text is not None,
        "text": text,
        "message": "Text extracted" if text else "No text found"
    }

@app.post("/api/enhance-image")
async def enhance_image(
    image_base64: str,
    x_client_id: str = Header(default="anonymous")
):
    """Enhance image for better OCR"""
    
    if not rate_limiter.is_allowed(x_client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    enhanced = image_processor.enhance_image(image_base64)
    
    if not enhanced:
        raise HTTPException(status_code=400, detail="Enhancement failed")
    
    return {"success": True, "image_base64": enhanced}


@app.get("/api/stats")
async def stats(x_client_id: str = Header(default="anonymous")):
    """Get usage stats"""
    return {
        "remaining_requests": rate_limiter.get_remaining(x_client_id),
        "rate_limit": settings.rate_limit_requests,
        "period": settings.rate_limit_period
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting server on {settings.host}:{settings.port}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
