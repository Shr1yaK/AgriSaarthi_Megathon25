# weather_service.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import google.generativeai as genai
from typing import Dict, Any

app = FastAPI(title="AgriSaarthi Dynamic Data Service - Weather API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3004", "http://127.0.0.1:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WeatherAPI Configuration
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "3df4d44e440343649bf173624251110")
WEATHER_URL = "https://api.weatherapi.com/v1/current.json"

# Gemini AI Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCeM3V6pHXwBcP97eKt4XYMQ_MlD4r9J5c")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@app.get("/data/weather_advisory")
def weather_advisory(location: str = Query(..., description="City or village name")):
    """
    Fetch current weather data and return a localized advisory message in English.
    """
    try:
        # Call WeatherAPI
        params = {"key": WEATHER_API_KEY, "q": location}
        response = requests.get(WEATHER_URL, params=params, timeout=10)

        if response.status_code != 200:
            return {"message": "Unable to fetch weather data for this location at the moment."}

        data = response.json()
        current = data["current"]
        loc = data["location"]["name"]

        temp = current["temp_c"]
        condition = current["condition"]["text"].lower()
        wind = current["wind_kph"]
        humidity = current["humidity"]

        # Generate AI-powered agricultural advisory using Gemini
        advisory = generate_ai_advisory(temp, condition, wind, humidity, loc)
        
        # Create comprehensive weather message
        message = (
            f"Current temperature in {loc} is {temp}°C with {current['condition']['text']}. "
            f"Wind speed is {wind} km/h and humidity is {humidity}%. {advisory}"
        )

        return {"message": message}

    except requests.exceptions.Timeout:
        return {"message": "Weather service is currently unavailable. Please try again later."}
    except requests.exceptions.RequestException:
        return {"message": "Unable to fetch weather data for this location at the moment."}
    except KeyError as e:
        return {"message": f"Invalid weather data received: {str(e)}"}
    except Exception as e:
        return {"message": f"Error: {str(e)}"}

def generate_ai_advisory(temp: float, condition: str, wind: float, humidity: int, location: str) -> str:
    """
    Generate AI-powered agricultural advisory using Gemini AI.
    """
    try:
        # Create detailed prompt for Gemini
        prompt = f"""
        You are AgriSaarthi, an expert agricultural advisor for Indian farmers. 
        
        Current weather conditions in {location}:
        - Temperature: {temp}°C
        - Weather: {condition}
        - Wind Speed: {wind} km/h
        - Humidity: {humidity}%
        
        Provide a comprehensive agricultural advisory that includes:
        1. Specific farming activities suitable for today's weather
        2. Precautions to take based on current conditions
        3. Irrigation recommendations
        4. Pest and disease management advice
        5. Crop-specific recommendations for common Indian crops (rice, wheat, cotton, sugarcane, vegetables)
        
        Keep the advice practical, actionable, and specific to Indian farming conditions.
        Use simple language that farmers can easily understand.
        Focus on immediate actions they can take today.
        
        Format: Provide 3-4 specific, actionable recommendations in 2-3 sentences each.
        """
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Fallback to basic advisory if Gemini fails
        return generate_basic_advisory(temp, condition, wind, humidity)

def generate_basic_advisory(temp: float, condition: str, wind: float, humidity: int) -> str:
    """
    Fallback basic advisory if Gemini API fails.
    """
    advisories = []
    
    # Temperature-based advisories
    if temp > 40:
        advisories.append("Extreme heat warning! Avoid field work during peak hours (11 AM - 3 PM).")
    elif temp > 35:
        advisories.append("High temperature - consider evening irrigation and provide shade for sensitive crops.")
    elif temp < 5:
        advisories.append("Frost risk! Protect sensitive crops with covers or move potted plants indoors.")
    elif temp < 15:
        advisories.append("Cool weather - good for root development and transplanting.")
    
    # Rain and precipitation advisories
    if any(word in condition for word in ["rain", "shower", "drizzle", "storm", "thunderstorm"]):
        advisories.append("Avoid pesticide spraying due to rainfall. Postpone fertilizer application.")
    elif "cloudy" in condition or "overcast" in condition:
        advisories.append("Cloudy conditions are good for transplanting and root development.")
    
    # Wind-based advisories
    if wind > 20:
        advisories.append("High wind speed - avoid spraying pesticides and protect young plants.")
    elif wind > 10:
        advisories.append("Moderate wind - avoid aerial spraying but ground application is safe.")
    
    # Humidity-based advisories
    if humidity > 80:
        advisories.append("High humidity - watch for fungal diseases. Ensure good air circulation.")
    elif humidity < 30:
        advisories.append("Low humidity - increase irrigation frequency and consider mulching.")
    
    # Default advisory if no specific conditions
    if not advisories:
        if 20 <= temp <= 30 and 5 <= wind <= 15 and 40 <= humidity <= 70:
            advisories.append("Excellent weather conditions for all agricultural activities.")
        else:
            advisories.append("Weather is generally suitable for field work today.")
    
    return " ".join(advisories)

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "weather-advisory"}

@app.get("/")
def root():
    """Root endpoint with service information"""
    return {
        "service": "AgriSaarthi Weather Advisory Service",
        "version": "1.0.0",
        "endpoints": {
            "weather_advisory": "/data/weather_advisory?location=<city_name>",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
