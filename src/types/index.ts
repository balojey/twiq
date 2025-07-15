export interface User {
  id: string
  username: string
  avatar_url?: string
  bio?: string
  level: number
  xp: number
  created_at: string
}

export interface Tweet {
  id: string
  user_id: string
  content: string
  media_url?: string
  parent_id?: string
  created_at: string
  user?: User
  likes_count?: number
  retweets_count?: number
  replies_count?: number
  is_liked?: boolean
  is_retweeted?: boolean
}

export interface Quest {
  id: string
  title: string
  description: string
  xp_reward: number
  criteria: Record<string, any>
  active: boolean
}

export interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  progress: Record<string, any>
  completed_at?: string
  quest?: Quest
}