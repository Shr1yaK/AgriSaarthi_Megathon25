'use client'

import React, { useState } from 'react'
import { Volume2, VolumeX, Download, Eye } from 'lucide-react'
import { bhashiniService } from '@/lib/bhashini-client'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type: 'text' | 'voice' | 'image'
  audioUrl?: string
  imageUrl?: string
  translatedText?: string
}

interface MessageBubbleProps {
  message: Message
  isSpeaking: boolean
  onToggleSpeaking: () => void
}

export default function MessageBubble({ message, isSpeaking, onToggleSpeaking }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handlePlayAudio = () => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    }
  }

  const handleTextToSpeech = async () => {
    if (message.sender !== 'bot') return
    
    try {
      setIsGeneratingAudio(true)
      const audioBase64 = await bhashiniService.textToSpeech(message.text, 'hi', 'female')
      
      if (audioBase64) {
        // Create audio URL from base64
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Play the audio
        const audio = new Audio(audioUrl)
        audio.play()
        setIsPlaying(true)
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl) // Clean up
        }
      }
    } catch (error) {
      console.error('TTS Error:', error)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleDownload = () => {
    if (message.audioUrl) {
      const link = document.createElement('a')
      link.href = message.audioUrl
      link.download = `agrisaarthi-${message.id}.mp3`
      link.click()
    }
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
        message.sender === 'user' 
          ? 'bg-chat-user text-white' 
          : 'bg-chat-bot text-white'
      }`}>
        {/* Message Content */}
        <div className="space-y-2">
          {message.type === 'image' && message.imageUrl && (
            <div className="mb-2">
              <img 
                src={message.imageUrl} 
                alt="Uploaded image" 
                className="w-full rounded-lg max-h-48 object-cover"
              />
            </div>
          )}
          
          <div className="text-sm">
            {message.translatedText && (
              <div className="mb-2">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-xs opacity-75 hover:opacity-100 underline"
                >
                  {showOriginal ? 'Show Translation' : 'Show Original'}
                </button>
              </div>
            )}
            
            <p className="text-balance">
              {showOriginal && message.translatedText ? message.translatedText : message.text}
            </p>
          </div>

          {/* Audio Controls */}
          {message.type === 'voice' && message.audioUrl && (
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={handlePlayAudio}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bot Message Controls */}
          {message.sender === 'bot' && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTextToSpeech}
                  className={`p-1 rounded transition-colors ${
                    isGeneratingAudio ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  disabled={isGeneratingAudio}
                  title="Convert to speech"
                >
                  {isGeneratingAudio ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-xs opacity-75">
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}

          {/* User Message Timestamp */}
          {message.sender === 'user' && (
            <div className="text-right">
              <span className="text-xs opacity-75">
                {formatTime(message.timestamp)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
