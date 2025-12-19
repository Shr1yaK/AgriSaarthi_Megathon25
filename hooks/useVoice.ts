'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseVoiceReturn {
  isRecording: boolean
  isSupported: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string | null>
  transcript: string
  error: string | null
}

export function useVoice(): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'hi-IN' // Default to Hindi, can be changed based on selected language
        
        recognitionInstance.onstart = () => {
          setIsRecording(true)
          setError(null)
        }
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setTranscript(transcript)
        }
        
        recognitionInstance.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsRecording(false)
        }
        
        recognitionInstance.onend = () => {
          setIsRecording(false)
        }
        
        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!recognition) {
      setError('Speech recognition not supported')
      return
    }

    try {
      setTranscript('')
      setError(null)
      recognition.start()
    } catch (err) {
      setError('Failed to start recording')
    }
  }, [recognition])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recognition || !isRecording) {
      return null
    }

    try {
      recognition.stop()
      
      // Wait a bit for the result
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return transcript
    } catch (err) {
      setError('Failed to stop recording')
      return null
    }
  }, [recognition, isRecording, transcript])

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    transcript,
    error
  }
}