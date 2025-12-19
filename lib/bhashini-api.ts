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

  async textToSpeech(text: string, targetLanguage: string = 'hi'): Promise<string> {
    try {
      const response = await fetch('/api/bhashini/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage: 'en',
          targetLanguage
        })
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      const result: TTSResponse = await response.json()
      return result.audio
    } catch (error) {
      console.error('TTS Error:', error)
      throw error
    }
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const response = await fetch('/api/bhashini/mt', {
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
  baseUrl: process.env.NEXT_PUBLIC_BHASHINI_BASE_URL || 'https://api.bhashini.gov.in'
})
