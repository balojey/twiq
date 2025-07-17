import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { showNotification } from '@/components/NotificationToast'

interface DailyLoginResult {
  already_logged_in: boolean
  streak_count: number
  xp_awarded: number
  base_xp?: number
  streak_bonus?: number
}

export function useDailyLogin() {
  const { user } = useAuth()
  const [loginResult, setLoginResult] = useState<DailyLoginResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkDailyLogin()
    }
  }, [user])

  const checkDailyLogin = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('record_daily_login', { p_user_id: user.id })

      if (error) throw error

      const result = data as DailyLoginResult
      setLoginResult(result)

      // Show notification if XP was awarded
      if (!result.already_logged_in && result.xp_awarded > 0) {
        const message = result.streak_bonus && result.streak_bonus > 0
          ? `Daily login bonus! +${result.base_xp} XP + ${result.streak_bonus} streak bonus`
          : `Daily login bonus! +${result.xp_awarded} XP`

        showNotification({
          type: 'xp',
          message,
          amount: result.xp_awarded
        })

        // Show streak notification for milestones
        if (result.streak_count === 7) {
          setTimeout(() => {
            showNotification({
              type: 'quest_complete',
              message: 'Week streak achieved!',
              questTitle: '7 Day Login Streak'
            })
          }, 1000)
        } else if (result.streak_count === 30) {
          setTimeout(() => {
            showNotification({
              type: 'quest_complete',
              message: 'Month streak achieved!',
              questTitle: '30 Day Login Streak'
            })
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error checking daily login:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStreak = async () => {
    if (!user) return 0

    try {
      const { data, error } = await supabase
        .rpc('get_user_login_streak', { p_user_id: user.id })

      if (error) throw error
      return data as number
    } catch (error) {
      console.error('Error getting login streak:', error)
      return 0
    }
  }

  return {
    loginResult,
    loading,
    getCurrentStreak,
    checkDailyLogin
  }
}