from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from typing import Dict, Any
import asyncio
import aiohttp

app = FastAPI(title="AgriSaarthi Chat Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = "https://fpekoatpefuzwczyarzr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWtvYXRwZWZ1endjenlhcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTEyNjcsImV4cCI6MjA3NTY2NzI2N30.Y4oh4qMeGTJCgaAC7X3nEgD6fqn6yMXGxXnE2egQ-9o"

# Bhashini API configuration
BHASHINI_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTYwNjZiOTNlM2JlYzkwMWZkOGM4Iiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.L9J7i1UDuWvLNzzZZ5AIqydpMdyH2V0kYYitlJUgIFs"
BHASHINI_BASE_URL = "https://canvas.iiit.ac.in"

class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
    
    def insert(self, table: str, data: dict):
        """Insert data into Supabase table"""
        url = f"{self.url}/rest/v1/{table}"
        response = requests.post(url, headers=self.headers, json=data)
        return response.json() if response.status_code == 201 else None
    
    def select(self, table: str, filters: str = None):
        """Select data from Supabase table"""
        url = f"{self.url}/rest/v1/{table}"
        if filters:
            url += f"?{filters}"
        response = requests.get(url, headers=self.headers)
        return response.json() if response.status_code == 200 else []

# Initialize Supabase client
supabase = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

class AgriSaarthiBot:
    def __init__(self):
        self.bhashini = BhashiniService()
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
        """Process user message and generate appropriate response"""
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
        
        # General agricultural advice
        general_responses = [
            "I'm here to help with your farming questions! Ask me about crops, pests, diseases, weather, or any agricultural concerns.",
            "Feel free to ask about crop management, pest control, disease prevention, or weather-related farming advice.",
            "I can help you with information about various crops, common pests and diseases, and weather-related farming tips."
        ]
        
        response = general_responses[0]  # Default response
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
        try:
            user_profile = supabase.select("profiles", f"id=eq.{user_id}")
            user_language = user_profile[0]["language"] if user_profile else "en"
        except:
            user_language = "en"
        
        # Process message with bot
        bot_response = await bot.process_message(message_content, user_language)
        
        # Save bot response to database
        response_data = {
            "chat_id": chat_id,
            "sender_id": "bot-agrisaarthi",
            "content": bot_response,
            "type": "text"
        }
        
        result = supabase.insert("messages", response_data)
        
        if result:
            return {"status": "success", "message": "Bot response sent"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save bot response")
            
    except Exception as e:
        print(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AgriSaarthi Chat Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
