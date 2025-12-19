#!/usr/bin/env python3
"""
Check available Gemini models
"""
import google.generativeai as genai

def check_available_models():
    """Check which Gemini models are available"""
    try:
        GEMINI_API_KEY = 'AIzaSyCeM3V6pHXwBcP97eKt4XYMQ_MlD4r9J5c'
        genai.configure(api_key=GEMINI_API_KEY)
        
        print("🔍 Checking available Gemini models...")
        
        # List all available models
        models = genai.list_models()
        
        print(f"\n📋 Found {len(list(models))} available models:")
        for model in models:
            print(f"  - {model.name}")
            if hasattr(model, 'display_name'):
                print(f"    Display Name: {model.display_name}")
            if hasattr(model, 'supported_generation_methods'):
                print(f"    Supported Methods: {model.supported_generation_methods}")
            print()
            
    except Exception as e:
        print(f"❌ Error checking models: {str(e)}")

if __name__ == "__main__":
    check_available_models()
