import requests
import base64
import os
from typing import Optional, Dict, Any


class BhashiniDhruvaService:
    """
    New Bhashini Dhruva API Service
    Uses base64 for audio input/output instead of file URLs
    """
    
    def __init__(self):
        self.api_key = 'DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w'
        self.api_url = os.getenv('BHASHINI_API_URL', 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline')
        self.headers = {
            'Authorization': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def asr_speech_to_text(self, audio_base64: str, source_language: str = 'en') -> Optional[str]:
        """
        Convert speech to text using ASR
        audio_base64: base64 encoded audio string
        source_language: language code (en, hi, gu, etc.)
        Returns: recognized text or None
        """
        try:
            # Determine service ID based on language
            if source_language == 'en':
                service_id = "ai4bharat/whisper-medium-en--gpu--t4"
            else:
                service_id = "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4"
            
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": source_language
                            },
                            "serviceId": service_id,
                            "audioFormat": "webm",  # CHANGED from "wav" to "webm"
                            "samplingRate": 16000
                        }
                    }
                ],
                "inputData": {
                    "audio": [
                        {
                            "audioContent": audio_base64
                        }
                    ]
                }
            }
            
            # DEBUG: Print payload structure (without full audio)
            print(f"ASR Request - Language: {source_language}")
            print(f"ASR Request - Service ID: {service_id}")
            print(f"ASR Request - Audio length: {len(audio_base64)} characters")
            print(f"ASR Request - Audio format: webm")
            print(f"ASR Request - Audio starts with: {audio_base64[:50]}...")
            print(f"ASR Request - API URL: {self.api_url}")
            print(f"ASR Request - API Key: {self.api_key[:20]}...")
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            print(f"ASR Response Status: {response.status_code}")
            print(f"ASR Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                # Extract recognized text from response
                text = result.get('pipelineResponse', [{}])[0].get('output', [{}])[0].get('source', '')
                print(f"ASR Recognized Text: {text}")
                return text
            else:
                print(f"ASR Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"ASR Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def translate_text(self, text: str, source_language: str = 'en', target_language: str = 'hi') -> Optional[str]:
        """
        Translate text from source to target language
        """
        try:
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": source_language,
                                "targetLanguage": target_language
                            },
                            "serviceId": "ai4bharat/indictrans-v2-all-gpu--t4"
                        }
                    }
                ],
                "inputData": {
                    "input": [
                        {
                            "source": text
                        }
                    ]
                }
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                translated_text = result.get('pipelineResponse', [{}])[0].get('output', [{}])[0].get('target', text)
                return translated_text
            else:
                print(f"Translation Error: {response.status_code} - {response.text}")
                return text
                
        except Exception as e:
            print(f"Translation Exception: {str(e)}")
            return text
    
    def text_to_speech(self, text: str, target_language: str = 'hi', gender: str = 'female') -> Optional[str]:
        """
        Convert text to speech using TTS
        Returns: base64 encoded audio string
        """
        try:
            # Determine service ID based on language and gender
            service_id = f"ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4"
            
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "tts",
                        "config": {
                            "language": {
                                "sourceLanguage": target_language
                            },
                            "serviceId": service_id,
                            "gender": gender,
                            "samplingRate": 8000
                        }
                    }
                ],
                "inputData": {
                    "input": [
                        {
                            "source": text
                        }
                    ]
                }
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                # Extract base64 audio from response
                audio_base64 = result.get('pipelineResponse', [{}])[0].get('audio', [{}])[0].get('audioContent', '')
                return audio_base64
            else:
                print(f"TTS Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"TTS Exception: {str(e)}")
            return None
    
    def complete_flow(self, audio_base64: str, source_language: str = 'en', target_language: str = 'hi') -> Dict[str, Any]:
        """
        Complete flow: ASR -> Translate -> Return both texts
        """
        result = {
            'original_text': None,
            'translated_text': None,
            'error': None
        }
        
        try:
            # Step 1: Speech to text
            original_text = self.asr_speech_to_text(audio_base64, source_language)
            if not original_text:
                result['error'] = 'Speech recognition failed'
                return result
            
            result['original_text'] = original_text
            
            # Step 2: Translate
            translated_text = self.translate_text(original_text, source_language, target_language)
            result['translated_text'] = translated_text
            
            return result
            
        except Exception as e:
            result['error'] = str(e)
            return result
