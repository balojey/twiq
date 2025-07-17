import { useEffect } from 'react'
import { toast } from 'sonner'
import { Trophy, Zap, Heart, Repeat2, MessageCircle } from 'lucide-react'

interface NotificationToastProps {
  type: 'xp' | 'level_up' | 'quest_complete' | 'like' | 'retweet' | 'reply'
  message: string
  amount?: number
  questTitle?: string
}

export function showNotification({ type, message, amount, questTitle }: NotificationToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'xp':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'level_up':
        return <Trophy className="h-4 w-4 text-gold-500" />
      case 'quest_complete':
        return <Trophy className="h-4 w-4 text-purple-500" />
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'retweet':
        return <Repeat2 className="h-4 w-4 text-green-500" />
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'xp':
        return `+${amount} XP Earned!`
      case 'level_up':
        return `Level Up! 🎉`
      case 'quest_complete':
        return `Quest Complete! 🏆`
      case 'like':
        return 'Someone liked your tweet!'
      case 'retweet':
        return 'Someone retweeted your tweet!'
      case 'reply':
        return 'New reply to your tweet!'
      default:
        return 'Notification'
    }
  }

  toast.success(message, {
    icon: getIcon(),
    description: type === 'quest_complete' ? `"${questTitle}" completed!` : undefined,
    duration: type === 'level_up' ? 5000 : 3000,
    className: type === 'level_up' ? 'border-gold-200 bg-gold-50' : undefined
  })
}

export default function NotificationToast(props: NotificationToastProps) {
  useEffect(() => {
    showNotification(props)
  }, [])

  return null
}