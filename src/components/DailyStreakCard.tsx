import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flame, Trophy } from 'lucide-react'
import { useDailyLogin } from '@/hooks/useDailyLogin'
import { motion } from 'framer-motion'

export default function DailyStreakCard() {
  const { getCurrentStreak } = useDailyLogin()
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [])

  const fetchStreak = async () => {
    try {
      const currentStreak = await getCurrentStreak()
      setStreak(currentStreak)
    } catch (error) {
      console.error('Error fetching streak:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakBadge = (streakCount: number) => {
    if (streakCount >= 30) {
      return { variant: 'default' as const, text: 'Legend', color: 'text-yellow-500' }
    } else if (streakCount >= 14) {
      return { variant: 'default' as const, text: 'Champion', color: 'text-purple-500' }
    } else if (streakCount >= 7) {
      return { variant: 'secondary' as const, text: 'Warrior', color: 'text-blue-500' }
    } else if (streakCount >= 3) {
      return { variant: 'outline' as const, text: 'Rising', color: 'text-green-500' }
    }
    return null
  }

  const streakBadge = getStreakBadge(streak)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Daily Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-16 mb-2"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Daily Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              key={streak}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <Flame className={`h-6 w-6 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-2xl font-bold">{streak}</span>
            </motion.div>
            <p className="text-sm text-muted-foreground">
              {streak === 0 ? 'Start your streak!' : `${streak} day${streak === 1 ? '' : 's'}`}
            </p>
          </div>
          
          {streakBadge && (
            <div className="text-right">
              <Badge variant={streakBadge.variant} className="mb-1">
                <Trophy className={`h-3 w-3 mr-1 ${streakBadge.color}`} />
                {streakBadge.text}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {streak >= 30 ? 'Max level!' : `${Math.max(0, (streak >= 14 ? 30 : streak >= 7 ? 14 : streak >= 3 ? 7 : 3) - streak)} days to next level`}
              </p>
            </div>
          )}
        </div>
        
        {streak > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Keep logging in daily to maintain your streak and earn bonus XP!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}