'use client'

import React, { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBase64: string) => void
  isRecording: boolean
  onToggleRecording: () => void
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  isRecording, 
  onToggleRecording 
}: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        
        // Convert blob to base64
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          onRecordingComplete(base64Audio)
          setIsProcessing(false)
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
    onToggleRecording()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={
        isProcessing 
          ? 'Processing voice message...' 
          : isRecording 
            ? 'Stop recording' 
            : 'Start voice recording'
      }
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  )
}
