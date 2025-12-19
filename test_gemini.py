#!/usr/bin/env python3
"""
Test script to verify Gemini API integration
"""
import os
import sys
import google.generativeai as genai

def test_gemini_api():
    """Test Gemini API with the configured key"""
    try:
        # Use the same API key as in the main app
        GEMINI_API_KEY = 'AIzaSyCeM3V6pHXwBcP97eKt4XYMQ_MlD4r9J5c'
        
        print("🔧 Testing Gemini API integration...")
        print(f"Using API Key: {GEMINI_API_KEY[:20]}...")
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Try different models in order of preference
        models_to_try = [
            'gemini-1.5-flash',  # Fastest, least quota usage
            'gemini-1.5-pro',    # More capable
            'gemini-pro'         # Legacy model
        ]
        
        for model_name in models_to_try:
            try:
                print(f"\n🧪 Testing model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                # Test with a simple agricultural question
                test_prompt = """You are AgriSaarthi, an expert agricultural assistant helping Indian farmers. 
Respond to this farming question in English: "How to grow rice?"

Provide specific, actionable advice in 2-3 sentences."""
                
                print("📤 Sending test prompt...")
                response = model.generate_content(test_prompt)
                answer = response.text
                
                print(f"✅ SUCCESS! Model {model_name} is working!")
                print(f"📝 Response: {answer[:200]}...")
                return True
                
            except Exception as e:
                error_str = str(e)
                print(f"❌ Model {model_name} failed: {error_str}")
                
                # Check if it's a quota error
                if "quota" in error_str.lower() or "429" in error_str:
                    print(f"⚠️ Quota exceeded for {model_name}, trying next model...")
                    continue
                elif "404" in error_str or "not found" in error_str:
                    print(f"⚠️ Model {model_name} not available, trying next model...")
                    continue
                else:
                    print(f"⚠️ Unexpected error with {model_name}: {error_str}")
                    continue
        
        print("\n❌ All Gemini models failed!")
        return False
        
    except Exception as e:
        print(f"❌ Gemini API configuration failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🌾 AgriSaarthi Gemini API Test")
    print("=" * 50)
    
    success = test_gemini_api()
    
    if success:
        print("\n🎉 Gemini API is working correctly!")
        print("The fallback issue should be resolved.")
    else:
        print("\n💥 Gemini API is not working!")
        print("Check your API key and internet connection.")
    
    sys.exit(0 if success else 1)
