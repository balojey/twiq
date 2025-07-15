// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Email types
export interface Email {
  id: string
  subject: string
  sender: string
  recipient: string
  content: string
  timestamp: string
  read: boolean
  important: boolean
  labels: string[]
}

// Conversation types
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  type: 'text' | 'voice'
}

export interface Conversation {
  id: string
  user_id: string
  messages: Message[]
  created_at: string
  updated_at: string
}

// Voice types
export interface VoiceSettings {
  voice_id: string
  stability: number
  similarity_boost: number
  style: number
}

// PicaOS automation types
export interface EmailAction {
  type: 'reply' | 'forward' | 'delete' | 'archive' | 'label' | 'schedule'
  email_id: string
  parameters: Record<string, any>
}