from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import base64
import io
import os
from datetime import datetime
import uuid
from lib.bhashini_dhruva import BhashiniDhruvaService  # NEW IMPORT


app = Flask(__name__)
CORS(app)


# Bhashini API Configuration - NEW
BHASHINI_API_KEY = 'DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w'
BHASHINI_API_URL = os.getenv('BHASHINI_API_URL', 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline')

# OLD Bhashini config (keep for backward compatibility if needed)
BHASHINI_BASE_URL = os.getenv('BHASHINI_BASE_URL', 'https://canvas.iiit.ac.in')
OLD_BHASHINI_API_KEY = os.getenv('OLD_BHASHINI_API_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTYwNjZiOTNlM2JlYzkwMWZkOGM4Iiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.L9J7i1UDuWvLNzzZZ5AIqydpMdyH2V0kYYitlJUgIFs')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyCeM3V6pHXwBcP97eKt4XYMQ_MlD4r9J5c')


# Initialize NEW Bhashini Dhruva service
bhashini_dhruva = BhashiniDhruvaService()


# OLD BhashiniService class (keeping for backward compatibility, but not using)
class BhashiniService:
    def __init__(self):
        self.base_url = BHASHINI_BASE_URL
        self.api_key = OLD_BHASHINI_API_KEY
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def speech_to_text(self, audio_data, source_language='hi'):
        """Convert speech to text using Bhashini ASR - OLD METHOD"""
        try:
            temp_audio_path = f"temp/audio_{uuid.uuid4()}.wav"
            os.makedirs("temp", exist_ok=True)
            
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_data)
            
            headers = {"access-token": self.api_key}
            
            with open(temp_audio_path, 'rb') as audio_file:
                files = {
                    'audio_file': (temp_audio_path, audio_file, 'audio/wav')
                }
                
                response = requests.post(
                    f"{self.base_url}/sandboxbeprod/asr",
                    headers=headers,
                    files=files,
                    timeout=30
                )
            
            os.remove(temp_audio_path)
            
            if response.status_code == 200:
                result = response.json()
                return result.get('data', {}).get('recognized_text', '')
            else:
                print(f"ASR Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"ASR Exception: {str(e)}")
            return None
    
    def text_to_speech(self, text, target_language='hi'):
        """Convert text to speech using Bhashini TTS - OLD METHOD"""
        try:
            headers = {"access-token": self.api_key}
            payload = {
                "text": text,
                "gender": "female"
            }
            
            response = requests.post(
                f"{self.base_url}/sandboxbeprod/generate_tts/67bca8b3e0b95a6a1ea34a93",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                audio_url = result.get('data', {}).get('s3_url')
                if audio_url:
                    audio_response = requests.get(audio_url)
                    if audio_response.status_code == 200:
                        return audio_response.content
                return None
            else:
                print(f"TTS Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"TTS Exception: {str(e)}")
            return None
    
    def translate_text(self, text, source_language='hi', target_language='en'):
        """Translate text using Bhashini MT - OLD METHOD"""
        try:
            headers = {"access-token": self.api_key}
            payload = {
                "input_text": text
            }
            
            response = requests.post(
                f"{self.base_url}/sandboxbeprod/mt",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('data', {}).get('output_text', text)
            else:
                print(f"MT Error: {response.status_code} - {response.text}")
                return text
                
        except Exception as e:
            print(f"MT Exception: {str(e)}")
            return text
    
    def extract_text_from_image(self, image_data):
        """Extract text from image using Bhashini OCR - OLD METHOD"""
        try:
            temp_image_path = f"temp/image_{uuid.uuid4()}.png"
            os.makedirs("temp", exist_ok=True)
            
            with open(temp_image_path, 'wb') as f:
                f.write(image_data)
            
            headers = {"access-token": self.api_key}
            
            with open(temp_image_path, 'rb') as image_file:
                files = {
                    'file': (temp_image_path, image_file, 'image/png')
                }
                
                response = requests.post(
                    f"{self.base_url}/sandboxbeprod/ocr",
                    headers=headers,
                    files=files,
                    timeout=30
                )
            
            os.remove(temp_image_path)
            
            if response.status_code == 200:
                result = response.json()
                return result.get('data', {}).get('decoded_text', '')
            else:
                print(f"OCR Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"OCR Exception: {str(e)}")
            return None


# Initialize old service for OCR (still using old API)
bhashini = BhashiniService()


# ============= NEW BHASHINI DHRUVA ENDPOINTS =============

@app.route('/api/bhashini/asr', methods=['POST'])
def bhashini_asr():
    """Speech to text endpoint using NEW Dhruva API"""
    try:
        data = request.get_json()
        audio_base64 = data.get('audioContent')
        source_language = data.get('sourceLanguage', 'en')
        
        if not audio_base64:
            return jsonify({'error': 'No audio content provided'}), 400
        
        # Remove data URL prefix if present
        if 'base64,' in audio_base64:
            audio_base64 = audio_base64.split('base64,')[1]
        
        text = bhashini_dhruva.asr_speech_to_text(audio_base64, source_language)
        
        if text:
            return jsonify({
                'success': True,
                'recognizedText': text,
                'language': source_language
            })
        else:
            return jsonify({'error': 'Speech recognition failed'}), 500
            
    except Exception as e:
        print(f"ASR Endpoint Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/bhashini/translate', methods=['POST'])
def bhashini_translate():
    """Text translation endpoint using NEW Dhruva API"""
    try:
        data = request.get_json()
        text = data.get('text')
        source_language = data.get('sourceLanguage', 'en')
        target_language = data.get('targetLanguage', 'hi')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        translated_text = bhashini_dhruva.translate_text(text, source_language, target_language)
        
        return jsonify({
            'success': True,
            'originalText': text,
            'translatedText': translated_text,
            'sourceLanguage': source_language,
            'targetLanguage': target_language
        })
            
    except Exception as e:
        print(f"Translation Endpoint Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/bhashini/tts', methods=['POST'])
def bhashini_tts():
    """Text to speech endpoint using NEW Dhruva API"""
    try:
        data = request.get_json()
        text = data.get('text')
        target_language = data.get('targetLanguage', 'hi')
        gender = data.get('gender', 'female')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        audio_base64 = bhashini_dhruva.text_to_speech(text, target_language, gender)
        
        if audio_base64:
            return jsonify({
                'success': True,
                'audioContent': audio_base64,
                'language': target_language
            })
        else:
            return jsonify({'error': 'Text-to-speech failed'}), 500
            
    except Exception as e:
        print(f"TTS Endpoint Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/bhashini/complete-flow', methods=['POST'])
def bhashini_complete_flow():
    """
    Complete flow: Voice input -> ASR -> Translate -> Gemini Answer -> Translate -> TTS
    """
    try:
        data = request.get_json()
        audio_base64 = data.get('audioContent')
        source_language = data.get('sourceLanguage', 'en')
        target_language = data.get('targetLanguage', 'hi')
        
        if not audio_base64:
            return jsonify({'error': 'No audio content provided'}), 400
        
        # Remove data URL prefix if present
        if 'base64,' in audio_base64:
            audio_base64 = audio_base64.split('base64,')[1]
        
        print(f"Starting complete flow: {source_language} -> {target_language}")
        
        # Step 1: ASR (Speech to Text)
        recognized_text = bhashini_dhruva.asr_speech_to_text(audio_base64, source_language)
        if not recognized_text:
            return jsonify({'error': 'Speech recognition failed'}), 500
        
        print(f"Recognized text: {recognized_text}")
        
        # Step 2: Translate question to English (if not already English)
        question_in_english = recognized_text
        if source_language != 'en':
            question_in_english = bhashini_dhruva.translate_text(recognized_text, source_language, 'en')
            print(f"Translated to English: {question_in_english}")
        
        # Step 3: Get answer from Gemini
        answer_in_english = generate_ai_response(question_in_english, target_language)
        print(f"Gemini answer: {answer_in_english}")
        
        # Step 4: Translate answer to target language
        answer_translated = answer_in_english
        if target_language != 'en':
            answer_translated = bhashini_dhruva.translate_text(answer_in_english, 'en', target_language)
            print(f"Translated answer: {answer_translated}")
        
        # Step 5: Convert answer to speech
        answer_audio_base64 = bhashini_dhruva.text_to_speech(answer_translated, target_language)
        
        return jsonify({
            'success': True,
            'recognizedText': recognized_text,
            'recognizedLanguage': source_language,
            'questionInEnglish': question_in_english,
            'answerInEnglish': answer_in_english,
            'answerTranslated': answer_translated,
            'answerLanguage': target_language,
            'answerAudioContent': answer_audio_base64
        })
            
    except Exception as e:
        print(f"Complete Flow Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============= EXISTING ENDPOINTS (keep these) =============

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint that processes different types of messages"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        language = data.get('language', 'en')
        
        print(f"Chat request - Message: {message}, Language: {language}")
        
        # Generate AI response directly
        response_text = generate_ai_response(message, language)
        
        return jsonify({
            'response': response_text,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Chat Endpoint Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """Convert text to speech - Using NEW API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'hi')
        gender = data.get('gender', 'female')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        print(f"TTS Request - Text: {text[:50]}..., Language: {language}, Gender: {gender}")
        
        audio_base64 = bhashini_dhruva.text_to_speech(text, language, gender)
        
        if audio_base64:
            return jsonify({
                'success': True,
                'audioContent': audio_base64,
                'language': language
            })
        else:
            return jsonify({'error': 'TTS failed'}), 500
            
    except Exception as e:
        print(f"TTS POST Endpoint Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/audio/<filename>')
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        audio_path = f"temp/{filename}"
        if os.path.exists(audio_path):
            return send_file(audio_path, mimetype='audio/mpeg')
        else:
            return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_ai_response(user_text, language):
    """Generate AI response using Gemini API with quota handling"""
    try:
        import google.generativeai as genai
        import time
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Models to try in order of preference (flash uses less quota)
        models_to_try = [
            'gemini-1.5-flash',  # Fastest, least quota usage
            'gemini-1.5-pro',    # More capable
            'gemini-pro'         # Legacy model
        ]
        
        for model_name in models_to_try:
            try:
                print(f"Trying Gemini model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                # English prompt (since we're translating anyway)
                prompt = f"""You are AgriSaarthi, an expert agricultural assistant helping Indian farmers. 
Respond to this farming question in English: "{user_text}"

Provide specific, actionable advice in 2-3 sentences. If it's about:
- Crop problems: Give diagnosis and treatment
- Government schemes: Explain benefits and application process  
- Market prices: Provide current rates and trends
- Weather/irrigation: Give practical farming advice
- Growing crops: Provide step-by-step guidance

Keep responses concise but informative. Use simple language."""
                
                print(f"Sending to Gemini: {user_text}")
                response = model.generate_content(prompt)
                answer = response.text
                print(f"✅ Gemini {model_name} success: {answer[:100]}...")
                return answer
                
            except Exception as model_error:
                error_str = str(model_error)
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
        
        # If all models failed, use fallback
        print("❌ All Gemini models failed, using fallback response")
        return get_farming_advice_fallback(user_text)
        
    except Exception as e:
        print(f"❌ Gemini API configuration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return get_farming_advice_fallback(user_text)


def get_farming_advice_fallback(user_text):
    """Enhanced fallback responses when Gemini fails"""
    user_text_lower = user_text.lower()
    
    # Rice
    if 'rice' in user_text_lower:
        return """To grow rice successfully:
1. Prepare flooded paddy fields with pH 5.5-6.5
2. Use quality seeds (20-25 kg/acre), transplant 20-25 day old seedlings
3. Maintain 2-3 inches water depth during growing season
4. Apply fertilizers: Urea 50kg + DAP 25kg + Potash 15kg per acre
5. Harvest when 80% grains turn golden brown (120-150 days)
Common varieties: Samba Mahsuri, BPT-5204, MTU-1010"""
    
    # Wheat
    elif 'wheat' in user_text_lower:
        return """To grow wheat successfully:
1. Use well-drained loamy soil with pH 6.0-7.5
2. Sow in October-November, seed rate 40-50 kg/hectare
3. Row spacing 20-25 cm, irrigate 4-5 times during growth
4. Apply NPK in ratio 120:60:40 kg/ha
5. Harvest in March-April when grains are hard (moisture 12-14%)
Common varieties: HD-2967, HD-3086, PBW-343"""
    
    # Pest control
    elif any(word in user_text_lower for word in ['pest', 'insect', 'bug']):
        return """For pest control:
1. Identify the pest first (take photos, consult local experts)
2. Remove and destroy infected plants
3. Use neem oil spray (5ml per liter water) for minor infestations
4. Install yellow sticky traps or pheromone traps
5. Maintain field cleanliness and crop rotation
6. For severe cases, consult agricultural extension officers for appropriate pesticides"""
    
    # Government schemes
    elif any(word in user_text_lower for word in ['scheme', 'government', 'subsidy']):
        return """Major agricultural schemes:
1. PM-KISAN: ₹6000/year direct benefit transfer to farmers
2. Kisan Credit Card: Low-interest farm loans up to ₹3 lakh
3. PM Fasal Bima Yojana: Crop insurance against natural calamities
4. Soil Health Card Scheme: Free soil testing
Visit nearest Krishi Vigyan Kendra or CSC with Aadhaar, land records, and bank passbook to apply"""
    
    # Market/pricing
    elif any(word in user_text_lower for word in ['price', 'market', 'sell', 'msp']):
        return """To check market prices:
1. Download eNAM app for national agricultural market prices
2. Use mKisan portal or SMS 3003 for daily prices
3. Check government MSP (Minimum Support Price) announcements
4. Sell through: Local mandis, Farmer Producer Organizations (FPOs), or directly to buyers
5. Consider grading and packaging for better prices"""
    
    # Fertilizer/soil
    elif any(word in user_text_lower for word in ['fertilizer', 'soil', 'nutrient']):
        return """For soil health and fertilization:
1. Get soil tested every 2-3 years (free at govt centers)
2. Use organic manure: FYM 5-10 tons/acre before planting
3. Apply chemical fertilizers based on soil test report
4. Use green manure crops (dhaincha, sunhemp) in rotation
5. Add lime if soil is acidic (pH below 5.5)
6. Practice crop rotation to maintain soil fertility"""
    
    # Default
    else:
        return """I'm AgriSaarthi, your agricultural assistant. I can help with:
- Crop cultivation techniques (rice, wheat, vegetables, etc.)
- Pest and disease management
- Government schemes and subsidies
- Market prices and selling strategies
- Soil health and fertilization
- Irrigation and water management

Please ask your specific farming question, and I'll provide detailed advice."""


def generate_document_response(extracted_text, language):
    """Generate response for document analysis"""
    # Analyze the extracted text and provide relevant information
    if 'pm-kisan' in extracted_text.lower() or 'kisan' in extracted_text.lower():
        return "This appears to be a PM-KISAN related document. This scheme provides ₹6000 per year to eligible farmers. You need Aadhaar card and bank account for registration."
    
    elif 'fertilizer' in extracted_text.lower() or 'उर्वरक' in extracted_text.lower():
        return "This is a fertilizer label. I can help you understand the NPK ratio and application instructions for your crops."
    
    elif 'soil' in extracted_text.lower() or 'मिट्टी' in extracted_text.lower():
        return "This appears to be a soil test report. I can help you interpret the soil nutrient levels and recommend appropriate fertilizers."
    
    else:
        return "I've analyzed your document. This appears to be an agricultural document. I can help you understand the key information and next steps."


if __name__ == '__main__':
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=8000)