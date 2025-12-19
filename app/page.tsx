'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import VoiceRecorder from '@/components/VoiceRecorder'
import MessageBubble from '@/components/MessageBubble'
import { useVoice } from '@/hooks/useVoice'
import { completeVoiceFlow } from '@/lib/bhashini-client'

// Initialize Supabase client
const supabaseUrl = 'https://fpekoatpefuzwczyarzr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWtvYXRwZWZ1endjenlhcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTEyNjcsImV4cCI6MjA3NTY2NzI2N30.Y4oh4qMeGTJCgaAC7X3nEgD6fqn6yMXGxXnE2egQ-9o'
const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions
interface User {
  id: string
  full_name: string
  email: string
  phone: string
  language: string
  region: string
  crops: string[]
}

interface Chat {
  id: string
  participant_a: string
  participant_b: string
  last_message: string
  updated_at: string
  participant_a_profile: {
    full_name: string
    email: string
    region: string
  }
  participant_b_profile: {
    full_name: string
    email: string
    region: string
  }
}

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: string
  created_at: string
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [region, setRegion] = useState('')
  const [crops, setCrops] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Chat states
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchUsers, setSearchUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [currentView, setCurrentView] = useState('chats') // 'chats', 'weather', 'profile'
  const [feedPosts, setFeedPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  
  // Weather states
  const [weatherData, setWeatherData] = useState<any>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const { startRecording, stopRecording, isSupported: voiceSupported } = useVoice()
  
  // Notification states
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'error' | 'success'} | null>(null)

  // Check if user is already logged in (using localStorage)
  useEffect(() => {
    const checkUser = async () => {
      const savedUser = localStorage.getItem('agrisaarthi_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        console.log('User loaded from localStorage:', user)
        setUser(user)
        setIsLoggedIn(true)
        loadUserChats(user.id)
      }
    }
    checkUser()
  }, [])

  const loadUserChats = async (userId: string) => {
    try {
      // First get all chats for this user
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (chatsError) throw chatsError

      if (!chatsData || chatsData.length === 0) {
        setChats([])
        return
      }

      // Now get profile information for all participants
      const participantIds = new Set()
      chatsData.forEach(chat => {
        if (chat.participant_a !== 'bot-agrisaarthi') participantIds.add(chat.participant_a)
        if (chat.participant_b !== 'bot-agrisaarthi') participantIds.add(chat.participant_b)
      })

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, region')
        .in('id', Array.from(participantIds))

      if (profilesError) throw profilesError

      // Create a map of profiles for quick lookup
      const profilesMap: { [key: string]: any } = {}
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile
        })
      }

      // Enrich chats with profile data
      const enrichedChats = chatsData.map(chat => ({
        ...chat,
        participant_a_profile: chat.participant_a === 'bot-agrisaarthi' 
          ? { full_name: 'AgriSaarthi Bot', email: 'bot@agrisaarthi.com', region: 'AI Assistant' }
          : profilesMap[chat.participant_a] || { full_name: 'Unknown User', email: '', region: '' },
        participant_b_profile: chat.participant_b === 'bot-agrisaarthi'
          ? { full_name: 'AgriSaarthi Bot', email: 'bot@agrisaarthi.com', region: 'AI Assistant' }
          : profilesMap[chat.participant_b] || { full_name: 'Unknown User', email: '', region: '' }
      }))

      console.log('Loaded chats:', enrichedChats) // Debug log
      setChats(enrichedChats)
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

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        // Check if email already exists
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)

        if (existingProfiles && existingProfiles.length > 0) {
          throw new Error('Email already exists. Please use a different email.')
        }

        // Create profile directly in database
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(), // Generate a random UUID
            full_name: fullName,
            phone: phone,
            language: language,
            region: region,
            crops: crops.split(',').map(crop => crop.trim()).filter(Boolean),
            email: email,
            password_hash: password,
          })
          .select()
          .single()

        if (profileError) throw profileError

        setUser(newProfile)
        setIsLoggedIn(true)
        localStorage.setItem('agrisaarthi_user', JSON.stringify(newProfile))
        loadUserChats(newProfile.id)
      } else {
        // Sign in by checking profiles table directly
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .eq('password_hash', password)

        if (error) throw error

        if (profiles && profiles.length > 0) {
          const profile = profiles[0]
          setUser(profile)
          setIsLoggedIn(true)
          localStorage.setItem('agrisaarthi_user', JSON.stringify(profile))
          loadUserChats(profile.id)
        } else {
          throw new Error('Invalid email or password')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('agrisaarthi_user')
    setUser(null)
    setIsLoggedIn(false)
    setChats([])
    setMessages([])
    setActiveChat(null)
  }

  const startChatWithBot = async () => {
    try {
      // Check if bot chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .eq('participant_a', user?.id || '')
        .eq('participant_b', 'bot-agrisaarthi')
        .single()

      if (existingChat) {
        setActiveChat(existingChat.id)
        loadMessages(existingChat.id)
        return
      }

      // Create new bot chat in database
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_a: user?.id || '',
          participant_b: 'bot-agrisaarthi',
          last_message: 'Chat started with AgriSaarthi Bot',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Enrich the chat with profile data
      const enrichedChat = {
        ...newChat,
        participant_a_profile: { full_name: user?.full_name || '', email: user?.email || '', region: user?.region || '' },
        participant_b_profile: { full_name: 'AgriSaarthi Bot', email: 'bot@agrisaarthi.com', region: 'AI Assistant' }
      }

      setChats(prev => [enrichedChat, ...prev])
      setActiveChat(newChat.id)
      
      // Add welcome message to database
      const welcomeMessage = {
        id: crypto.randomUUID(),
        chat_id: newChat.id,
        sender_id: 'bot-agrisaarthi',
        content: 'Hello! I am AgriSaarthi Bot. How can I help you with your farming needs today?',
        type: 'text',
        created_at: new Date().toISOString()
      }

      const { error: msgError } = await supabase
        .from('messages')
        .insert(welcomeMessage)

      if (!msgError) {
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false)
      const result = await stopRecording()
      if (result) {
        await sendMessage(result, 'voice')
      }
    } else {
      setIsRecording(true)
      await startRecording()
    }
  }

  const handleVoiceRecordingComplete = async (audioBase64: string) => {
    try {
      setIsRecording(false)
      console.log('Voice recording completed, calling completeVoiceFlow...')
      const result = await completeVoiceFlow(audioBase64, 'en', 'hi')
      console.log('Complete voice flow result:', result)
      
      if (result.success) {
        console.log('Sending message with recognized text:', result.recognizedText)
        await sendMessage(result.recognizedText, 'text')
        
        // Show notification if API was not available
        if (result.recognizedText.includes('API unavailable')) {
          setNotification({
            message: 'Voice message received! Speech recognition service is currently unavailable.',
            type: 'info'
          })
          setTimeout(() => setNotification(null), 5000)
        }
      }
    } catch (error) {
      console.error('Voice error:', error)
      // Show user-friendly message when voice recording fails
      await sendMessage("Voice message received, but speech recognition is currently unavailable. Please try typing your question.", 'text')
      setNotification({
        message: 'Voice recording failed. Please try typing your message.',
        type: 'error'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const sendMessage = async (messageText?: string, messageType: string = 'text') => {
    const messageContent = messageText || newMessage
    if (!messageContent.trim() || !activeChat) return

    try {
      // Save user message to database
      const userMessage = {
        id: crypto.randomUUID(),
        chat_id: activeChat,
        sender_id: user?.id || '',
        content: messageContent,
        type: messageType,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('messages')
        .insert(userMessage)

      if (error) throw error

      // Add to local state
      setMessages(prev => [...prev, userMessage])

      // Update chat's last message and refresh chat list
      await supabase
        .from('chats')
        .update({ 
          last_message: messageContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeChat)

      // Refresh the chat list to show updated last message
      if (user) loadUserChats(user.id)

      // Generate AI response (only for bot chats)
      if (activeChat && chats.find(chat => chat.id === activeChat)?.participant_b === 'bot-agrisaarthi') {
        setTimeout(async () => {
          try {
            // Call the AI service to get a proper response
            const response = await fetch('http://localhost:8000/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: messageContent,
                language: 'en'
              })
            })
            
            let aiResponse = `I understand you're asking about "${messageContent}". Let me help you with that! For detailed agricultural advice, please provide more specific information about your crops, region, or farming challenges.`
            
            if (response.ok) {
              const data = await response.json()
              aiResponse = data.response || aiResponse
            }
            
          const botResponse = {
              id: crypto.randomUUID(),
            chat_id: activeChat,
            sender_id: 'bot-agrisaarthi',
              content: aiResponse,
              type: 'text',
              created_at: new Date().toISOString()
          }

          const { error: botError } = await supabase
            .from('messages')
            .insert(botResponse)

          if (!botError) {
            setMessages(prev => [...prev, botResponse])
            
            // Update chat's last message with bot response
            await supabase
              .from('chats')
              .update({ 
                last_message: botResponse.content,
                updated_at: new Date().toISOString()
              })
              .eq('id', activeChat)
            
            // Refresh the chat list
            if (user) loadUserChats(user.id)
          }
          } catch (error) {
            console.error('Error generating AI response:', error)
            // Fallback to generic response if AI service fails
            const fallbackResponse = {
              id: crypto.randomUUID(),
              chat_id: activeChat,
              sender_id: 'bot-agrisaarthi',
              content: `I understand you're asking about "${messageContent}". Let me help you with that! For detailed agricultural advice, please provide more specific information about your crops, region, or farming challenges.`,
              type: 'text',
              created_at: new Date().toISOString()
            }
            
            const { error: botError } = await supabase
              .from('messages')
              .insert(fallbackResponse)
            
            if (!botError) {
              setMessages(prev => [...prev, fallbackResponse])
            }
          }
        }, 1000)
      }

      if (!messageText) {
      setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    loadMessages(chatId)
  }

  const searchForUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchUsers([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, region, language')
        .neq('id', user?.id) // Don't show current user
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,region.ilike.%${query}%`)
        .limit(10)

      if (error) throw error
      setSearchUsers(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const fetchWeatherData = async (location: string) => {
    if (!location.trim()) return

    setWeatherLoading(true)
    setWeatherError('')
    
    try {
      const response = await fetch(`http://localhost:8004/data/weather_advisory?location=${encodeURIComponent(location)}`)
      
      if (!response.ok) {
        throw new Error('Weather service unavailable')
      }
      
      const data = await response.json()
      
      // Parse the message to extract weather details
      const message = data.message
      const tempMatch = message.match(/(\d+(?:\.\d+)?)°C/)
      const windMatch = message.match(/(\d+(?:\.\d+)?) km\/h/)
      const humidityMatch = message.match(/(\d+)%/)
      const conditionMatch = message.match(/with ([^.]+)\./)
      
      const weatherInfo = {
        location: location,
        temperature: tempMatch ? parseFloat(tempMatch[1]) : 0,
        condition: conditionMatch ? conditionMatch[1] : 'Unknown',
        windSpeed: windMatch ? parseFloat(windMatch[1]) : 0,
        humidity: humidityMatch ? parseInt(humidityMatch[1]) : 0,
        advisory: message,
        timestamp: new Date().toLocaleString()
      }
      
      setWeatherData(weatherInfo)
      
    } catch (err) {
      setWeatherError('Unable to fetch weather data. Please check your connection and try again.')
      console.error('Weather fetch error:', err)
    } finally {
      setWeatherLoading(false)
    }
  }

  const startChatWithUser = async (otherUserId: string) => {
    try {
      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(`and(participant_a.eq.${user?.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user?.id})`)
        .single()

      if (existingChat) {
        console.log('Found existing chat:', existingChat)
        setActiveChat(existingChat.id)
        loadMessages(existingChat.id)
        setShowUserSearch(false)
        return
      }

      // Get the other user's profile info
      const { data: otherUserProfile } = await supabase
        .from('profiles')
        .select('full_name, email, region')
        .eq('id', otherUserId)
        .single()

      // Create new chat with better data
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_a: user?.id || '',
          participant_b: otherUserId,
          last_message: `Chat started with ${otherUserProfile?.full_name || 'User'}`,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) throw error

      // Enrich the chat with profile data
      const enrichedChat = {
        ...newChat,
        participant_a_profile: { full_name: user?.full_name || '', email: user?.email || '', region: user?.region || '' },
        participant_b_profile: otherUserProfile || { full_name: 'Unknown User', email: '', region: '' }
      }

      console.log('Created new chat:', enrichedChat)
      setChats(prev => [enrichedChat, ...prev])
      setActiveChat(newChat.id)
      setShowUserSearch(false)
      setSearchQuery('')
      setSearchUsers([])
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d1fae5%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-2xl animate-pulse">
              🌾
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              AgriSaarthi
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              {isSignup ? "Join the farming community" : "Welcome back, farmer!"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isSignup ? "Create your account to get started" : "Sign in to continue your farming journey"}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              {isSignup && (
                <>
                  <div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="te">Telugu</option>
                      <option value="ta">Tamil</option>
                      <option value="bn">Bengali</option>
                      <option value="gu">Gujarati</option>
                      <option value="mr">Marathi</option>
                      <option value="kn">Kannada</option>
                      <option value="ml">Malayalam</option>
                      <option value="pa">Punjabi</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Region (e.g., Nashik, Maharashtra)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={crops}
                      onChange={(e) => setCrops(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Crops (comma-separated, optional)"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (isSignup ? 'Sign up' : 'Sign in')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'error' 
            ? 'bg-red-100 border border-red-300 text-red-800' 
            : notification.type === 'success'
            ? 'bg-green-100 border border-green-300 text-green-800'
            : 'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Sidebar - Clean Minimalistic Design */}
      <div className="w-80 bg-white shadow-lg flex flex-col relative z-10 border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgriSaarthi</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'}</p>
              </div>
            </div>
          <button
            onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
          </button>
          </div>
        </div>

        {/* Navigation - Clean Design */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCurrentView('chats')}
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'chats' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Chats</span>
            </button>
            <button
              onClick={() => setCurrentView('weather')}
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'weather' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span>Weather</span>
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'profile' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
          </div>
        </div>
        
        {currentView === 'chats' && (
          <>
            {/* Action Buttons - Clean Design */}
            <div className="px-6 py-4 space-y-3">
              <button
                onClick={startChatWithBot}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Start Chat with Bot</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowUserSearch(!showUserSearch)}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium">{showUserSearch ? 'Cancel Search' : 'Search Farmers'}</span>
                </div>
              </button>

              <button
                onClick={() => user && loadUserChats(user.id)}
                className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Chats</span>
                </div>
              </button>
            </div>

            {/* Search Bar - Clean Design */}
            {showUserSearch && (
              <div className="px-6 pb-4">
                <div className="relative">
                <input
                  type="text"
                    placeholder="Search farmers by name, region, or crops..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                      if (user) searchForUsers(e.target.value)
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 placeholder-gray-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {searchUsers.length > 0 && (
                  <div className="mt-4 max-h-48 overflow-y-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100">
                    {searchUsers.map((searchUser) => (
                      <div
                        key={searchUser.id}
                        onClick={() => startChatWithUser(searchUser.id)}
                        className="p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border-b border-green-100 last:border-b-0 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {searchUser.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">{searchUser.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{searchUser.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">📍 {searchUser.region}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">🌾 Farmer</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat List - Farming Theme */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
                {chats.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl animate-pulse">
                      🌱
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No conversations yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Start chatting with our AI assistant or connect with other farmers!</p>
                    <div className="flex justify-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    </div>
                  </div>
                ) : (
                  chats.map((chat) => {
                const isBotChat = chat.participant_b === 'bot-agrisaarthi'
                  const otherUser = chat.participant_a === user?.id ? 
                  (chat.participant_b_profile || { full_name: 'AgriSaarthi Bot' }) : 
                    (chat.participant_a_profile || { full_name: 'AgriSaarthi Bot' })
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                        activeChat === chat.id 
                          ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-2xl transform scale-105 border-2 border-white/20' 
                          : 'bg-white/80 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 shadow-lg hover:shadow-xl hover:scale-105 border border-green-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          isBotChat 
                            ? 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400' 
                            : 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400'
                        }`}>
                          {isBotChat ? '🤖' : otherUser.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className={`text-lg font-bold truncate ${
                              activeChat === chat.id ? 'text-white' : 'text-gray-900'
                            }`}>
                          {isBotChat ? 'AgriSaarthi Bot' : otherUser.full_name}
                        </p>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                activeChat === chat.id ? 'bg-green-200' : 'bg-green-400'
                              } animate-pulse`}></div>
                              <p className={`text-xs font-medium ${
                                activeChat === chat.id ? 'text-green-100' : 'text-gray-400'
                              }`}>
                                {new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <p className={`text-sm truncate ${
                            activeChat === chat.id ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {chat.last_message || 'No messages yet'}
                          </p>
                          {isBotChat && (
                            <div className="flex items-center space-x-1 mt-2">
                              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">AI Assistant</span>
                              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">24/7 Available</span>
                            </div>
                          )}
                        </div>
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          activeChat === chat.id ? 'opacity-100' : ''
                        }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                      </div>
                    </div>
                  </div>
                )
                }))}
              </div>
            </div>
          </>
        )}


        {currentView === 'profile' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative text-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl border-2 border-white/30">
                    {user?.full_name?.charAt(0).toUpperCase()}
            </div>
                  <h3 className="text-3xl font-bold mb-2">{user?.full_name}</h3>
                  <p className="text-green-100 text-lg">{user?.email}</p>
                  <div className="flex justify-center space-x-2 mt-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🌾 Farmer</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">📍 {user?.region}</span>
          </div>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📱</span>
                      </div>
                      <label className="text-sm font-bold text-green-700">Phone Number</label>
                    </div>
                    <p className="text-gray-800 font-semibold text-lg">{user?.phone}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🌍</span>
                      </div>
                      <label className="text-sm font-bold text-blue-700">Region</label>
                    </div>
                    <p className="text-gray-800 font-semibold text-lg">{user?.region}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🗣️</span>
                      </div>
                      <label className="text-sm font-bold text-purple-700">Language</label>
                    </div>
                    <p className="text-gray-800 font-semibold text-lg capitalize">{user?.language}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🌾</span>
                      </div>
                      <label className="text-sm font-bold text-amber-700">Crops</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user?.crops && user.crops.length > 0 ? (
                        user.crops.map((crop, index) => (
                          <span key={index} className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            {crop}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No crops specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Farming Stats */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Farming Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{chats.length}</div>
                      <div className="text-sm text-green-700">Active Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-sm text-green-700">AI Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-green-700">Organic</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Clean Design */}
      <div className="flex-1 flex flex-col bg-white">
        {currentView === 'chats' && (
          <>
            {activeChat ? (
              <>
                {/* Chat Header - Clean Design */}
                <div className="bg-white border-b border-gray-200 p-4">
                  {(() => {
                    const currentChat = chats.find(chat => chat.id === activeChat)
                    const isBotChat = currentChat?.participant_b === 'bot-agrisaarthi'
                    const otherUser = currentChat?.participant_a === user?.id ? 
                      (currentChat?.participant_b_profile || { full_name: 'AgriSaarthi Bot' }) : 
                      (currentChat?.participant_a_profile || { full_name: 'AgriSaarthi Bot' })
                    
                    return (
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          isBotChat 
                            ? 'bg-green-600' 
                            : 'bg-purple-600'
                        }`}>
                          {isBotChat ? 'A' : otherUser.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {isBotChat ? 'AgriSaarthi Bot' : otherUser.full_name}
                        </h2>
                          <p className="text-sm text-gray-500">
                            {isBotChat ? 'AI Farming Assistant' : `Farmer • ${(otherUser as any)?.region || 'Unknown Region'}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-500">Online</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Messages - Clean Design */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={{
                        id: message.id,
                        text: message.content,
                        sender: message.sender_id === user?.id ? 'user' : 'bot',
                        timestamp: new Date(message.created_at),
                        type: message.type as 'text' | 'voice' | 'image'
                      }}
                      isSpeaking={false}
                      onToggleSpeaking={() => {}}
                    />
                  ))}
                </div>

                {/* Message Input - Clean Design */}
                <div className="bg-white border-t border-gray-200 p-4 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage()
                        }
                      }}
                        placeholder="Type your message or ask about farming..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                        disabled={isRecording}
                      />
                    </div>
                    
                    <VoiceRecorder
                      isRecording={isRecording}
                      onToggleRecording={handleVoiceInput}
                      onRecordingComplete={handleVoiceRecordingComplete}
                    />
                    
                    <button
                      onClick={() => sendMessage()}
                      disabled={!newMessage.trim() || isRecording}
                      className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="text-center max-w-md px-8">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6">
                    A
                </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to AgriSaarthi
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Get instant farming advice, connect with other farmers, and grow your agricultural knowledge.
                  </p>
                  
                  <div className="space-y-3">
                <button
                      onClick={startChatWithBot}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Start Chat with Bot
                </button>
                    
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Search Farmers
                    </button>
                    </div>
            </div>
          </div>
            )}
          </>
        )}

        {currentView === 'weather' && (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-green-50">
            <div className="max-w-6xl mx-auto p-6">
              {/* Weather Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-2xl animate-pulse">
                  🌤️
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Weather & Farming Advisory
                </h2>
                <p className="text-gray-600 text-lg">Get real-time weather data and AI-powered farming recommendations</p>
              </div>

              {/* Weather Search */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8 mb-8">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (region.trim()) {
                    fetchWeatherData(region.trim())
                  }
                }} className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Check Weather for Your Farm</h3>
                    <p className="text-gray-600">Enter your location to get detailed weather information and farming advice</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Enter city, village, or region..."
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-2xl">📍</span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white rounded-2xl hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-bold text-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🌡️</span>
                        <span>Get Weather</span>
                      </div>
                    </button>
                  </div>
                </form>
              </div>

              {/* Weather Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Current Weather Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-xl border border-blue-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-blue-800">Current Weather</h3>
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                      🌡️
                    </div>
                  </div>
                  
                  <div className="text-center">
                    {weatherLoading ? (
                      <div className="py-8">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                          <span className="text-2xl">🌤️</span>
                        </div>
                        <div className="text-lg text-blue-600 font-medium">Loading weather data...</div>
                      </div>
                    ) : weatherError ? (
                      <div className="py-8">
                        <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="text-lg text-red-600 font-medium">{weatherError}</div>
                      </div>
                    ) : weatherData ? (
                      <>
                        <div className="text-6xl font-bold text-blue-600 mb-2">{weatherData?.temperature}°C</div>
                        <div className="text-xl text-blue-700 mb-4">{weatherData?.condition}</div>
                        <div className="text-gray-600 mb-6">{weatherData?.location}</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/60 rounded-2xl p-4">
                            <div className="text-2xl mb-2">💨</div>
                            <div className="text-sm text-gray-600">Wind Speed</div>
                            <div className="text-lg font-bold text-blue-700">{weatherData?.windSpeed} km/h</div>
                          </div>
                          <div className="bg-white/60 rounded-2xl p-4">
                            <div className="text-2xl mb-2">💧</div>
                            <div className="text-sm text-gray-600">Humidity</div>
                            <div className="text-lg font-bold text-blue-700">{weatherData?.humidity}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🌤️</span>
                        </div>
                        <div className="text-lg text-gray-600 font-medium">Enter a location to get weather data</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farming Advisory Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl border border-green-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-green-800">Farming Advisory</h3>
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                      🌱
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {weatherData ? (
                      <div className="bg-white/60 rounded-2xl p-4 border-l-4 border-green-400">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <div className="font-bold text-green-800 mb-1">AI Farming Advisory</div>
                            <div className="text-sm text-gray-600">{weatherData?.advisory}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white/60 rounded-2xl p-4 border-l-4 border-green-400">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">✅</span>
                            <div>
                              <div className="font-bold text-green-800 mb-1">Good for Irrigation</div>
                              <div className="text-sm text-gray-600">Current conditions are suitable for watering your crops</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 rounded-2xl p-4 border-l-4 border-yellow-400">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                              <div className="font-bold text-yellow-800 mb-1">Monitor Soil Moisture</div>
                              <div className="text-sm text-gray-600">Check soil moisture levels before next irrigation</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/60 rounded-2xl p-4 border-l-4 border-blue-400">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">📊</span>
                            <div>
                              <div className="font-bold text-blue-800 mb-1">Optimal Growth</div>
                              <div className="text-sm text-gray-600">Temperature and humidity are ideal for crop growth</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">📅</span>
                    <span>7-Day Forecast</span>
                  </div>
                </button>
                
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">🚨</span>
                    <span>Weather Alerts</span>
                  </div>
                </button>
                
                <button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 px-6 rounded-2xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">📈</span>
                    <span>Farming Tips</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}