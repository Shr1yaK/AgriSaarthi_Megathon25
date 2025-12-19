from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import requests
import json
from typing import Dict, Any
import asyncio
import aiohttp
from dotenv import load_dotenv
import google.generativeai as genai


# Load environment variables
load_dotenv()


app = FastAPI(title="AgriSaarthi Chat Service")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fpekoatpefuzwczyarzr.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWtvYXRwZWZ1endjenlhcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTEyNjcsImV4cCI6MjA3NTY2NzI2N30.Y4oh4qMeGTJCgaAC7X3nEgD6fqn6yMXGxXnE2egQ-9o")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# Bhashini API configuration
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTYwNjZiOTNlM2JlYzkwMWZkOGM4Iiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.L9J7i1UDuWvLNzzZZ5AIqydpMdyH2V0kYYitlJUgIFs")
BHASHINI_BASE_URL = os.getenv("BHASHINI_BASE_URL", "https://canvas.iiit.ac.in")

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCeM3V6pHXwBcP97eKt4XYMQ_MlD4r9J5c")


class BhashiniService:
    def __init__(self):
        self.api_key = BHASHINI_API_KEY
        self.base_url = BHASHINI_BASE_URL
    
    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using Bhashini MT API"""
        try:
            url = f"{self.base_url}/bhashini/mt"
            payload = {
                "text": text,
                "source_lang": source_lang,
                "target_lang": target_lang
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("translated_text", text)
                    else:
                        print(f"Translation failed: {response.status}")
                        return text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    async def speech_to_text(self, audio_url: str, language: str) -> str:
        """Convert speech to text using Bhashini ASR API"""
        try:
            url = f"{self.base_url}/bhashini/asr"
            payload = {
                "audio_url": audio_url,
                "language": language
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("transcribed_text", "")
                    else:
                        print(f"ASR failed: {response.status}")
                        return ""
        except Exception as e:
            print(f"ASR error: {e}")
            return ""
    
    async def text_to_speech(self, text: str, language: str) -> str:
        """Convert text to speech using Bhashini TTS API"""
        try:
            url = f"{self.base_url}/bhashini/tts"
            payload = {
                "text": text,
                "language": language
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("audio_url", "")
                    else:
                        print(f"TTS failed: {response.status}")
                        return ""
        except Exception as e:
            print(f"TTS error: {e}")
            return ""


class AgriSaarthiBot:
    def __init__(self):
        self.bhashini = BhashiniService()
        
        # Configure Gemini AI
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Initialize Gemini model with configuration
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
        )
        
        # System prompt for agriculture-focused responses
        self.system_prompt = """You are AgriSaarthi, an AI farming assistant specifically designed for Indian farmers. 

Your expertise includes:
- Crop cultivation techniques (rice, wheat, corn, sugarcane, vegetables, fruits, etc.)
- Pest management and disease control
- Weather-based farming advice
- Soil health and fertilizer recommendations
- Government schemes and subsidies for farmers
- Market prices and selling strategies
- Sustainable and organic farming practices
- Irrigation and water management
- Farm equipment and machinery

Provide practical, actionable advice in simple, easy-to-understand language. Keep responses concise (2-4 sentences) unless detailed information is specifically requested. Focus on Indian agricultural context and regional farming practices."""
        
        # Keep the knowledge base as fallback
        self.knowledge_base = {
            "crops": {
                "rice": "Rice is a staple crop. Plant in well-drained soil with good water retention. Requires 150-200mm water per week during growing season.",
                "wheat": "Wheat grows best in cool, dry climates. Plant in fall for spring harvest. Requires 25-30 inches of water per season.",
                "corn": "Corn needs warm weather and plenty of water. Plant after last frost. Requires 1-1.5 inches of water per week.",
                "sugarcane": "Sugarcane needs tropical climate with high rainfall. Plant in well-drained soil. Requires 1500-2000mm annual rainfall."
            },
            "pests": {
                "aphids": "Aphids can be controlled with neem oil spray or insecticidal soap. Check undersides of leaves regularly.",
                "caterpillars": "Use Bacillus thuringiensis (Bt) spray for caterpillar control. Apply in early morning or evening.",
                "whiteflies": "Yellow sticky traps and neem oil can help control whiteflies. Ensure good air circulation."
            },
            "diseases": {
                "blight": "Blight appears as dark spots on leaves. Remove affected plants and avoid overhead watering.",
                "rust": "Rust shows as orange/brown spots. Use fungicide spray and ensure good air circulation.",
                "mosaic": "Mosaic virus causes mottled leaves. Remove infected plants immediately to prevent spread."
            },
            "weather": {
                "drought": "During drought, use drip irrigation and mulch to conserve water. Consider drought-resistant crop varieties.",
                "flood": "In case of flooding, ensure proper drainage. Avoid planting in low-lying areas during monsoon.",
                "frost": "Protect crops from frost using row covers or greenhouses. Plant frost-sensitive crops after last frost date."
            }
        }
    
    async def process_message(self, message: str, user_language: str = "en") -> str:
        """Process user message using Gemini AI with translation support"""
        try:
            # Translate to English if needed for Gemini processing
            message_for_ai = message
            if user_language != "en":
                message_for_ai = await self.bhashini.translate_text(message, user_language, "en")
            
            # Generate AI response using Gemini
            chat = self.model.start_chat(history=[])
            full_prompt = f"{self.system_prompt}\n\nUser question: {message_for_ai}"
            
            response = chat.send_message(full_prompt)
            bot_response = response.text
            
            # Translate response back to user's language if needed
            if user_language != "en":
                bot_response = await self.bhashini.translate_text(bot_response, "en", user_language)
            
            return bot_response
            
        except Exception as e:
            print(f"Gemini AI error: {e}")
            # Fallback to keyword-based responses if Gemini fails
            return await self._fallback_response(message, user_language)
    
    async def _fallback_response(self, message: str, user_language: str = "en") -> str:
        """Fallback keyword-based response if Gemini fails"""
        message_lower = message.lower()
        
        # Check for crop-related queries
        for crop, info in self.knowledge_base["crops"].items():
            if crop in message_lower:
                response = f"About {crop.title()}: {info}"
                if user_language != "en":
                    response = await self.bhashini.translate_text(response, "en", user_language)
                return response
        
        # Check for pest-related queries
        for pest, info in self.knowledge_base["pests"].items():
            if pest in message_lower:
                response = f"Regarding {pest.title()}: {info}"
                if user_language != "en":
                    response = await self.bhashini.translate_text(response, "en", user_language)
                return response
        
        # Check for disease-related queries
        for disease, info in self.knowledge_base["diseases"].items():
            if disease in message_lower:
                response = f"About {disease.title()}: {info}"
                if user_language != "en":
                    response = await self.bhashini.translate_text(response, "en", user_language)
                return response
        
        # Check for weather-related queries
        for weather, info in self.knowledge_base["weather"].items():
            if weather in message_lower:
                response = f"Weather advice for {weather.title()}: {info}"
                if user_language != "en":
                    response = await self.bhashini.translate_text(response, "en", user_language)
                return response
        
        # General fallback response
        response = "I'm here to help with your farming questions! Ask me about crops, pests, diseases, weather, or any agricultural concerns."
        if user_language != "en":
            response = await self.bhashini.translate_text(response, "en", user_language)
        
        return response


# Initialize bot
bot = AgriSaarthiBot()


@app.post("/bot/process-message")
async def process_message(request: Request):
    """Process incoming message and send bot response"""
    try:
        data = await request.json()
        chat_id = data.get("chat_id")
        message_content = data.get("content")
        user_id = data.get("user_id")
        
        if not all([chat_id, message_content, user_id]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Get user profile to determine language preference
        user_profile = supabase.table("profiles").select("language").eq("id", user_id).execute()
        user_language = user_profile.data[0]["language"] if user_profile.data else "en"
        
        # Process message with bot (now using Gemini AI)
        bot_response = await bot.process_message(message_content, user_language)
        
        # Save bot response to database
        response_data = {
            "chat_id": chat_id,
            "sender_id": "bot-agrisaarthi",
            "content": bot_response,
            "type": "text"
        }
        
        result = supabase.table("messages").insert(response_data).execute()
        
        if result.data:
            return {"status": "success", "message": "Bot response sent"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save bot response")
            
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/bot/process-audio")
async def process_audio(request: Request):
    """Process audio message and send text response"""
    try:
        data = await request.json()
        chat_id = data.get("chat_id")
        audio_url = data.get("audio_url")
        user_id = data.get("user_id")
        
        if not all([chat_id, audio_url, user_id]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Get user profile to determine language preference
        user_profile = supabase.table("profiles").select("language").eq("id", user_id).execute()
        user_language = user_profile.data[0]["language"] if user_profile.data else "en"
        
        # Convert speech to text
        transcribed_text = await bot.bhashini.speech_to_text(audio_url, user_language)
        
        if not transcribed_text:
            bot_response = "I couldn't understand your audio message. Please try speaking more clearly."
        else:
            # Process the transcribed text using Gemini AI
            bot_response = await bot.process_message(transcribed_text, user_language)
        
        # Save bot response to database
        response_data = {
            "chat_id": chat_id,
            "sender_id": "bot-agrisaarthi",
            "content": bot_response,
            "type": "text"
        }
        
        result = supabase.table("messages").insert(response_data).execute()
        
        if result.data:
            return {"status": "success", "message": "Bot response sent"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save bot response")
            
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AgriSaarthi Chat Service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)