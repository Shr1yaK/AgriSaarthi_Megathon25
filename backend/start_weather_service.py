#!/usr/bin/env python3
"""
Startup script for AgriSaarthi Weather Advisory Service
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    """Start the weather advisory service"""
    # Get the directory of this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Set environment variables
    os.environ.setdefault("WEATHER_API_KEY", "3df4d44e440343649bf173624251110")
    
    print("🌦️  Starting AgriSaarthi Weather Advisory Service...")
    print("📍 Service will run on: http://localhost:8004")
    print("🔗 Weather Advisory Endpoint: http://localhost:8004/data/weather_advisory?location=<city_name>")
    print("❤️  Health Check: http://localhost:8004/health")
    print("📚 API Docs: http://localhost:8004/docs")
    print("\n" + "="*60)
    
    try:
        # Start the FastAPI service
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "weather_service:app", 
            "--host", "0.0.0.0", 
            "--port", "8004", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Weather service stopped.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting weather service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
