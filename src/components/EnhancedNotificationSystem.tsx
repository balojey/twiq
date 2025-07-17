import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trophy, Zap, Heart, Repeat2, MessageCircle, Crown, Star, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
}

export function useNotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          showEnhancedNotification(newNotification)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await supabase
        .rpc('mark_notifications_read', {
          p_user_id: user?.id,
          p_notification_ids: notificationIds
        })

      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const showEnhancedNotification = (notification: Notification) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'like':
          return <Heart className="h-4 w-4 text-red-500" />
        case 'retweet':
          return <Repeat2 className="h-4 w-4 text-green-500" />
        case 'reply':
          return <MessageCircle className="h-4 w-4 text-blue-500" />
        case 'follow':
          return <Star className="h-4 w-4 text-yellow-500" />
        case 'level_up':
          return <Crown className="h-4 w-4 text-purple-500" />
        case 'quest_complete':
          return <Trophy className="h-4 w-4 text-orange-500" />
        case 'achievement_unlocked':
          return <Award className="h-4 w-4 text-pink-500" />
        default:
          return <Zap className="h-4 w-4 text-blue-500" />
      }
    }

    const getToastStyle = () => {
      switch (notification.type) {
        case 'level_up':
          return 'border-purple-200 bg-purple-50 dark:bg-purple-950'
        case 'achievement_unlocked':
          return 'border-pink-200 bg-pink-50 dark:bg-pink-950'
        case 'quest_complete':
          return 'border-orange-200 bg-orange-50 dark:bg-orange-950'
        default:
          return ''
      }
    }

    // Special handling for achievement notifications
    if (notification.type === 'achievement_unlocked' && notification.data.badge_icon) {
      toast.success(notification.message, {
        icon: <span className="text-lg">{notification.data.badge_icon}</span>,
        description: `Achievement: ${notification.data.achievement_title}`,
        duration: 6000,
        className: getToastStyle(),
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to achievements page
            window.location.href = '/analytics'
          }
        }
      })
      return
    }

    // Special handling for level up notifications
    if (notification.type === 'level_up') {
      toast.success(notification.message, {
        icon: getIcon(),
        description: `You're now level ${notification.data.new_level}!`,
        duration: 5000,
        className: getToastStyle(),
        action: {
          label: 'Celebrate',
          onClick: () => {
            // Could trigger confetti or other celebration
            console.log('🎉 Level up celebration!')
          }
        }
      })
      return
    }

    // Default notification
    toast.success(notification.message, {
      icon: getIcon(),
      description: notification.title !== notification.message ? notification.title : undefined,
      duration: 4000,
      className: getToastStyle()
    })
  }

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    fetchNotifications
  }
}

export default function EnhancedNotificationSystem() {
  useNotificationSystem()
  return null // This component only handles the notification logic
}