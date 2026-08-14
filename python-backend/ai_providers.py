"""
10+ Free AI API Integration with Proper Fallback
"""
import asyncio
import aiohttp
from typing import Optional
import logging
from config import settings
from google_scraper import google_scraper

logger = logging.getLogger(__name__)

class AIProviders:
    """Multi-AI Provider with fallback mechanism"""
    
    def __init__(self):
        # Order matters! Try fastest/most reliable first
        self.providers = [
            ("groq", self.groq_solution),
            ("openai", self.openai_gpt),
            ("gemini", self.google_gemini),
            ("huggingface", self.huggingface),
            ("cohere", self.cohere_solution),
            ("anthropic", self.anthropic_solution),
            ("together", self.together_ai),
            ("ollama", self.ollama_local),
            ("replicate", self.replicate_ai),
        ]
    
    async def groq_solution(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Groq API - Super fast inference (Free tier: 14 requests/minute)"""
        try:
            if not settings.groq_api_key:
                return None
            
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)
            
            message = client.messages.create(
                model="mixtral-8x7b-32768",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text
        except Exception as e:
            logger.warning(f"Groq failed: {e}")
            return None
    
    async def google_gemini(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Google Gemini API - Free tier: 60 RPM (Using gemini-1.5-flash)"""
        try:
            if not settings.google_gemini_api_key:
                return None
            
            import google.generativeai as genai
            genai.configure(api_key=settings.google_gemini_api_key)
            
            # Use latest model instead of deprecated ones
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            try:
                response = model.generate_content(prompt)
                if response.text:
                    return response.text
            except Exception as e:
                logger.warning(f"Gemini content generation failed: {e}")
                return None
                
        except Exception as e:
            logger.warning(f"Gemini initialization failed: {e}")
            return None
    
    async def huggingface(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Hugging Face Inference API - Free tier available"""
        try:
            if not settings.huggingface_api_key:
                return None
            
            from huggingface_hub import InferenceClient
            client = InferenceClient(api_key=settings.huggingface_api_key)
            
            response = client.text_generation(prompt, max_new_tokens=2048)
            return response
        except Exception as e:
            logger.warning(f"HuggingFace failed: {e}")
            return None
    
    async def together_ai(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Together AI - Free trial $5"""
        try:
            import together
            together.api_key = settings.together_api_key
            
            response = together.Complete.create(
                prompt=prompt,
                model="togethercomputer/llama-2-70b-chat",
                max_tokens=2048,
                temperature=0.7,
            )
            return response['output']['choices'][0]['text']
        except Exception as e:
            logger.warning(f"Together AI failed: {e}")
            return None
    async def cohere_solution(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Cohere API - Free tier: 100k tokens/month"""
        try:
            if not settings.cohere_api_key:
                return None
                
            import cohere
            co = cohere.Client(settings.cohere_api_key)
            
            response = co.generate(
                prompt=prompt,
                max_tokens=2048,
                temperature=0.8,
            )
            return response.generations[0].text
        except Exception as e:
            logger.warning(f"Cohere failed: {e}")
            return None
    
    async def openai_gpt(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """OpenAI GPT-4 mini - Cheap ($0.00015 per 1k tokens)"""
        try:
            if not settings.openai_api_key:
                return None
                
            from openai import OpenAI
            client = OpenAI(api_key=settings.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using cheaper model
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2048,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"OpenAI failed: {e}")
            return None
    
    async def anthropic_solution(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Anthropic Claude - Free tier available"""
        try:
            if not settings.anthropic_api_key:
                return None
                
            from anthropic import Anthropic
            client = Anthropic(api_key=settings.anthropic_api_key)
            
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        except Exception as e:
            logger.warning(f"Anthropic failed: {e}")
            return None
    
    async def together_ai(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Together AI - Free trial $5"""
        try:
            if not settings.together_api_key:
                return None
                
            import together
            together.api_key = settings.together_api_key
            
            response = together.Complete.create(
                prompt=prompt,
                model="togethercomputer/llama-2-70b-chat",
                max_tokens=2048,
                temperature=0.7,
            )
            return response['output']['choices'][0]['text']
        except Exception as e:
            logger.warning(f"Together AI failed: {e}")
            return None
    
    async def ollama_local(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Local Ollama - Completely free, runs on your machine"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "mistral", "prompt": prompt, "stream": False},
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response")
        except Exception as e:
            logger.warning(f"Ollama failed: {e}")
            return None
    
    async def replicate_ai(self, prompt: str, image_base64: Optional[str] = None) -> Optional[str]:
        """Replicate API - Pay per use, very cheap"""
        try:
            if not settings.replicate_api_key:
                return None
                
            import replicate
            
            output = replicate.run(
                "meta/llama-2-70b-chat:2d19859f6261f4d31d6e25948938641ceba06eef75881eac4cefc47ef7884dd8",
                input={"prompt": prompt}
            )
            return "".join(output)
        except Exception as e:
            logger.warning(f"Replicate failed: {e}")
            return None
    
    async def solve_with_fallback(self, prompt: str, image_base64: Optional[str] = None) -> dict:
        """Try all providers until one works with proper logging"""
        errors = []
        successful_provider = None
        result_answer = None
        
        logger.info(f"Starting provider loop for prompt: {prompt[:100]}...")
        
        for provider_name, provider_func in self.providers:
            try:
                logger.info(f"Trying provider: {provider_name}")
                result = await provider_func(prompt, image_base64)
                
                if result and result.strip():  # Make sure result is not empty
                    successful_provider = provider_name
                    result_answer = result
                    logger.info(f"✅ Success with {provider_name}")
                    return {
                        "success": True,
                        "answer": result_answer,
                        "provider": successful_provider,
                        "errors": errors
                    }
                else:
                    logger.warning(f"❌ {provider_name} returned empty result")
                    errors.append(f"{provider_name}: Empty response")
                    
            except Exception as e:
                error_msg = str(e)
                errors.append(f"{provider_name}: {error_msg}")
                logger.error(f"❌ {provider_name} failed: {error_msg}")
                await asyncio.sleep(0.3)  # Rate limit friendly delay
        
        # Last resort: Python scraping
        logger.info("All providers exhausted, trying Python scraping...")
        try:
            scraped = await self.python_scraping(prompt)
            if scraped:
                logger.info("✅ Success with python_scraping")
                return {
                    "success": True,
                    "answer": scraped,
                    "provider": "python_scraping",
                    "errors": errors
                }
        except Exception as e:
            error_msg = str(e)
            errors.append(f"python_scraping: {error_msg}")
            logger.error(f"❌ python_scraping failed: {error_msg}")
        
        logger.error("❌ All providers and fallback failed")
        return {
            "success": False,
            "answer": None,
            "errors": errors
        }
    
    async def python_scraping(self, query: str) -> Optional[str]:
        """Fallback: Google scraping for educational content"""
        try:
            # Use Google scraper to get answer
            answer = await google_scraper.get_answer_from_google(query)
            
            if answer:
                return answer
            
            # Fallback to Wikipedia if Google fails
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"https://en.wikipedia.org/w/api.php",
                    params={
                        "action": "query",
                        "format": "json",
                        "titles": query,
                        "prop": "extracts",
                        "explaintext": True,
                    },
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        pages = data.get("query", {}).get("pages", {})
                        for page in pages.values():
                            if "extract" in page and page["extract"]:
                                return page["extract"][:2000]
            
            return None
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return None

ai_providers = AIProviders()
