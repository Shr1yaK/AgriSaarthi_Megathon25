'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, Profile, Chat, Message } from '@/lib/supabase'
import { Send, Paperclip, Mic, MicOff } from 'lucide-react'

interface ChatInterfaceProps {
  profile: Profile
}

export default function ChatInterface({ profile }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chats on component mount
  useEffect(() => {
    loadChats()
  }, [profile.id])

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!activeChat) return

    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${activeChat}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_a.eq.${profile.id},participant_b.eq.${profile.id}`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading chats:', error)
        return
      }

      setChats(data || [])
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    loadMessages(chatId)
  }

  const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' | 'document' = 'text', mediaUrl?: string) => {
    if (!activeChat || !content.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChat,
          sender_id: profile.id,
          content,
          type,
          media_url: mediaUrl
        })

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      // Update chat's last message
      await supabase
        .from('chats')
        .update({ 
          last_message: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeChat)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!activeChat) return

    setIsUploading(true)
    try {
      const filePath = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (error) throw error

      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('audio/') ? 'audio' : 'document'

      await sendMessage(file.name, fileType, data.path)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const startChatWithBot = async () => {
    try {
      const botId = 'bot-agrisaarthi'
      
      const { data, error } = await supabase
        .from('chats')
        .insert({
          participant_a: profile.id,
          participant_b: botId,
          last_message: 'Chat started with AgriSaarthi Bot',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating chat:', error)
        return
      }

      setChats(prev => [data, ...prev])
      setActiveChat(data.id)
      loadMessages(data.id)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">AgriSaarthi Chat</h1>
          <p className="text-sm text-gray-600">Welcome, {profile.full_name}</p>
        </div>
        
        <div className="p-4">
          <button
            onClick={startChatWithBot}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Chat with AgriSaarthi Bot
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                activeChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.participant_b === 'bot-agrisaarthi' ? '🤖' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chat.participant_b === 'bot-agrisaarthi' ? 'AgriSaarthi Bot' : 'Farmer'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">AgriSaarthi Bot</h2>
              <p className="text-sm text-gray-600">Always here to help with your farming needs</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === profile.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message.type === 'image' && (
                      <img
                        src={`${supabase.storage.from('documents').getPublicUrl(message.media_url || '').data.publicUrl}`}
                        alt="Uploaded image"
                        className="max-w-full h-auto rounded"
                      />
                    )}
                    {message.type === 'audio' && (
                      <audio controls className="w-full">
                        <source
                          src={`${supabase.storage.from('documents').getPublicUrl(message.media_url || '').data.publicUrl}`}
                          type="audio/mpeg"
                        />
                      </audio>
                    )}
                    {message.type === 'document' && (
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4" />
                        <a
                          href={`${supabase.storage.from('documents').getPublicUrl(message.media_url || '').data.publicUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {message.content}
                        </a>
                      </div>
                    )}
                    {message.type === 'text' && <p>{message.content}</p>}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  accept="image/*,audio/*,.pdf,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(newMessage)
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AgriSaarthi Chat</h3>
              <p className="text-gray-600">Select a chat or start a new conversation with our AI assistant</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}