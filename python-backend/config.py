from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(
        extra="ignore",
        env_file=".env",
        case_sensitive=False
    )
    
    # API Keys
    google_gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    huggingface_api_key: Optional[str] = None
    together_api_key: Optional[str] = None
    cohere_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    replicate_api_key: Optional[str] = None
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Server
    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = True
    
    # Image Processing
    max_image_size_mb: int = 10
    allowed_formats: str = "jpg,jpeg,png,webp"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period: int = 60

settings = Settings()
