// Bhashini API Integration Service
export interface BhashiniConfig {
  apiKey: string
  baseUrl: string
}

export interface ASRRequest {
  audio: string // base64 encoded audio
  sourceLanguage: string
  targetLanguage: string
}

export interface ASRResponse {
  text: string
  confidence: number
}

export interface TTSRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
}

export interface TTSResponse {
  audio: string // base64 encoded audio
}

export interface MTRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
}

export interface MTResponse {
  translatedText: string
}

export interface OCRRequest {
  image: string // base64 encoded image
  sourceLanguage: string
  targetLanguage: string
}

export interface OCRResponse {
  extractedText: string
  confidence: number
}

export interface CompleteFlowResponse {
  success: boolean
  recognizedText: string
  recognizedLanguage: string
  questionInEnglish: string
  answerInEnglish: string
  answerTranslated: string
  answerLanguage: string
  answerAudioContent: string
}

export class BhashiniService {
  private config: BhashiniConfig

  constructor(config: BhashiniConfig) {
    this.config = config
  }

  async speechToText(audioBlob: Blob, sourceLanguage: string = 'hi'): Promise<string> {
    try {
      const audioBase64 = await this.blobToBase64(audioBlob)
      
      const response = await fetch('/api/bhashini/asr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioBase64,
          sourceLanguage,
          targetLanguage: 'en'
        })
      })

      if (!response.ok) {
        throw new Error(`ASR API error: ${response.status}`)
      }

      const result: ASRResponse = await response.json()
      return result.text
    } catch (error) {
      console.error('ASR Error:', error)
      throw error
    }
  }

  async textToSpeech(text: string, targetLanguage: string = 'hi', gender: string = 'female'): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: targetLanguage,
          gender
        })
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      const result = await response.json()
      return result.audioContent
    } catch (error) {
      console.error('TTS Error:', error)
      throw error
    }
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const response = await fetch('/api/bhashini/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage
        })
      })

      if (!response.ok) {
        throw new Error(`MT API error: ${response.status}`)
      }

      const result: MTResponse = await response.json()
      return result.translatedText
    } catch (error) {
      console.error('MT Error:', error)
      throw error
    }
  }

  async extractTextFromImage(imageBlob: Blob, sourceLanguage: string = 'hi'): Promise<string> {
    try {
      const imageBase64 = await this.blobToBase64(imageBlob)
      
      const response = await fetch('/api/bhashini/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          sourceLanguage,
          targetLanguage: 'en'
        })
      })

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`)
      }

      const result: OCRResponse = await response.json()
      return result.extractedText
    } catch (error) {
      console.error('OCR Error:', error)
      throw error
    }
  }

  async completeVoiceFlow(
    audioBase64: string,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'hi'
  ): Promise<CompleteFlowResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/bhashini/complete-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioContent: audioBase64,
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Complete flow failed')
      }

      return response.json()
    } catch (error) {
      // Fallback when API is not available
      console.warn('Bhashini API not available, using fallback')
      return {
        success: true,
        recognizedText: "Voice message received (API unavailable)",
        recognizedLanguage: sourceLanguage,
        questionInEnglish: "Voice message received (API unavailable)",
        answerInEnglish: "I received your voice message, but the speech recognition service is currently unavailable. Please try typing your question instead.",
        answerTranslated: "I received your voice message, but the speech recognition service is currently unavailable. Please try typing your question instead.",
        answerLanguage: targetLanguage,
        answerAudioContent: ""
      }
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private base64ToBlob(base64: string, mimeType: string = 'audio/mpeg'): Blob {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  async playAudioFromBase64(base64Audio: string): Promise<void> {
    try {
      const audioBlob = this.base64ToBlob(base64Audio)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      await audio.play()
      
      // Clean up URL after playing
      audio.onended = () => URL.revokeObjectURL(audioUrl)
    } catch (error) {
      console.error('Audio playback error:', error)
      throw error
    }
  }
}

// Language mapping for Bhashini
export const BHASHINI_LANGUAGES = {
  'hi': 'Hindi',
  'en': 'English',
  'bn': 'Bengali',
  'te': 'Telugu',
  'mr': 'Marathi',
  'ta': 'Tamil',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi',
  'or': 'Odia',
  'as': 'Assamese'
} as const

export type BhashiniLanguage = keyof typeof BHASHINI_LANGUAGES

// Initialize Bhashini service
export const bhashiniService = new BhashiniService({
  apiKey: process.env.NEXT_PUBLIC_BHASHINI_API_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_BHASHINI_BASE_URL || 'http://localhost:8000'
})

// Legacy functions for backward compatibility
export async function translateText(
  text: string,
  sourceLanguage: string = 'hi',
  targetLanguage: string = 'en'
): Promise<string> {
  try {
    const response = await fetch('http://localhost:8000/api/bhashini/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const result = await response.json()
    return result.translatedText
  } catch (error) {
    // Fallback when API is not available
    console.warn('Bhashini API not available, using fallback')
    return text
  }
}

export async function speechToText(
  audioBase64: string,
  sourceLanguage: string = 'hi'
): Promise<string> {
  try {
    const response = await fetch('http://localhost:8000/api/bhashini/asr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioContent: audioBase64,
        sourceLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error('Speech to text failed')
    }

    const result = await response.json()
    return result.recognizedText
  } catch (error) {
    // Fallback when API is not available
    console.warn('Bhashini API not available, using fallback')
    return "Voice message received (API unavailable)"
  }
}

export async function completeVoiceFlow(
  audioBase64: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'hi'
): Promise<CompleteFlowResponse> {
  try {
    console.log('Sending complete flow request to:', 'http://localhost:8000/api/bhashini/complete-flow')
    console.log('Request data:', { sourceLanguage, targetLanguage, audioLength: audioBase64.length })
    
    const response = await fetch('http://localhost:8000/api/bhashini/complete-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioContent: audioBase64,
        sourceLanguage,
        targetLanguage,
      }),
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response error:', errorText)
      throw new Error(`Complete flow failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('Complete flow result:', result)
    return result
  } catch (error) {
    // Fallback when API is not available
    console.error('Complete flow error:', error)
    console.warn('Bhashini API not available, using fallback')
    return {
      success: true,
      recognizedText: "Voice message received (API unavailable)",
      recognizedLanguage: sourceLanguage,
      questionInEnglish: "Voice message received (API unavailable)",
      answerInEnglish: "I received your voice message, but the speech recognition service is currently unavailable. Please try typing your question instead.",
      answerTranslated: "I received your voice message, but the speech recognition service is currently unavailable. Please try typing your question instead.",
      answerLanguage: targetLanguage,
      answerAudioContent: ""
    }
  }
}