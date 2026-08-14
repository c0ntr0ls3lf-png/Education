"""
Image processing: upload, crop, OCR
"""
import io
import base64
from PIL import Image
import logging
from typing import Tuple, Optional
import pytesseract
import cv2
import numpy as np
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Handle image upload, crop, and OCR"""
    
    @staticmethod
    async def process_upload(file: UploadFile, max_size_mb: int = 10) -> Tuple[bool, str, Optional[str]]:
        """Process uploaded image"""
        try:
            # Check file size
            contents = await file.read()
            if len(contents) > max_size_mb * 1024 * 1024:
                return False, "Image too large", None
            
            # Open image
            image = Image.open(io.BytesIO(contents))
            
            # Resize if too large
            max_dimension = 1920
            if max(image.size) > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return True, "Success", img_base64
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return False, str(e), None
    
    @staticmethod
    def extract_text_ocr(image_base64: str) -> Optional[str]:
        """Extract text using OCR (Tesseract)"""
        try:
            # Decode image
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to numpy array
            img_np = np.array(image)
            
            # Preprocess for OCR
            if len(img_np.shape) == 3:
                gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_np
            
            # Threshold
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
            
            # Extract text
            text = pytesseract.image_to_string(thresh)
            return text if text.strip() else None
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return None
    
    @staticmethod
    def crop_image(image_base64: str, x: int, y: int, width: int, height: int) -> Optional[str]:
        """Crop image and return base64"""
        try:
            # Decode
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            # Crop
            cropped = image.crop((x, y, x + width, y + height))
            
            # Encode
            buffered = io.BytesIO()
            cropped.save(buffered, format="JPEG")
            return base64.b64encode(buffered.getvalue()).decode()
        except Exception as e:
            logger.error(f"Crop error: {e}")
            return None
    
    @staticmethod
    def enhance_image(image_base64: str) -> Optional[str]:
        """Enhance image for better OCR"""
        try:
            image_data = base64.b64decode(image_base64)
            img = np.frombuffer(image_data, dtype=np.uint8)
            image = cv2.imdecode(img, cv2.IMREAD_COLOR)
            
            # Denoise
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 15, 15)
            
            # Upscale
            upscaled = cv2.resize(denoised, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            
            # Encode
            _, buffer = cv2.imencode('.jpg', upscaled)
            return base64.b64encode(buffer).decode()
        except Exception as e:
            logger.error(f"Enhancement error: {e}")
            return None

image_processor = ImageProcessor()
