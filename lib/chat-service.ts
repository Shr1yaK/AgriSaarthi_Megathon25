import { supabase } from './supabase'

export interface BotResponse {
  status: string
  message: string
}

export class ChatService {
  private static instance: ChatService
  private botServiceUrl: string

  constructor() {
    this.botServiceUrl = process.env.NEXT_PUBLIC_BOT_SERVICE_URL || 'http://localhost:8005'
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  async sendMessageToBot(chatId: string, content: string, userId: string): Promise<BotResponse> {
    try {
      const response = await fetch(`${this.botServiceUrl}/bot/process-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          content,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Bot service error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message to bot:', error)
      throw error
    }
  }

  async processAudioMessage(chatId: string, audioUrl: string, userId: string): Promise<BotResponse> {
    try {
      const response = await fetch(`${this.botServiceUrl}/bot/process-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          audio_url: audioUrl,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Bot service error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing audio message:', error)
      throw error
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const filePath = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'audio' | 'document' = 'text',
    mediaUrl?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          type,
          media_url: mediaUrl,
        })

      if (error) throw error

      // If it's a text message and not from bot, send to bot for processing
      if (type === 'text' && senderId !== 'bot-agrisaarthi') {
        try {
          await this.sendMessageToBot(chatId, content, senderId)
        } catch (botError) {
          console.error('Bot processing failed:', botError)
          // Continue even if bot fails
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async createChat(participantA: string, participantB: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          participant_a: participantA,
          participant_b: participantB,
          last_message: 'Chat started',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  }

  async getChats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching chats:', error)
      throw error
    }
  }

  async getMessages(chatId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      throw error
    }
  }

  subscribeToMessages(chatId: string, callback: (message: any) => void) {
    return supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()
  }
}

export const chatService = ChatService.getInstance()