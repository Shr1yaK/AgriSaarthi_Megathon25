'use client'

import { useState, useCallback } from 'react'
import { chatService, ChatMessage } from '@/lib/chat-service'

interface UseChatReturn {
  messages: ChatMessage[]
  sendMessage: (content: string | File, type: 'text' | 'voice' | 'image') => Promise<void>
  isLoading: boolean
}

export function useChat(selectedLanguage: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string | File, type: 'text' | 'voice' | 'image') => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: typeof content === 'string' ? content : type === 'image' ? 'Image uploaded' : 'Voice message',
      sender: 'user',
      timestamp: new Date(),
      type,
      imageUrl: type === 'image' && typeof content !== 'string' ? URL.createObjectURL(content) : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call actual chat service
      const response = await chatService.sendMessage(content, type, selectedLanguage)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        audioUrl: response.audioUrl,
        translatedText: response.translatedText
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: selectedLanguage === 'hi' 
          ? 'क्षमा करें, एक त्रुटि हुई है। कृपया पुनः प्रयास करें।'
          : 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [selectedLanguage])

  return { messages, sendMessage, isLoading }
}

