import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Crown, Gem } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface Achievement {
  achievement_id: string
  title: string
  description: string
  badge_icon: string
  badge_color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
  xp_reward: number
  unlocked_at: string | null
  progress_percentage: number
}

export default function AchievementPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .rpc('get_user_achievement_progress', { p_user_id: user.id })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'epic':
        return <Gem className="h-4 w-4 text-purple-500" />
      case 'rare':
        return <Star className="h-4 w-4 text-blue-500" />
      default:
        return <Trophy className="h-4 w-4 text-gray-500" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      case 'epic':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950'
      case 'rare':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-950'
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked_at)
  const lockedAchievements = achievements.filter(a => !a.unlocked_at)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </div>
          <Badge variant="secondary">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 text-green-600 dark:text-green-400">
                Unlocked ({unlockedAchievements.length})
              </h4>
              <div className="space-y-3">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.achievement_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.badge_icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-sm">{achievement.title}</h5>
                          {getRarityIcon(achievement.rarity)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Unlocked
                          </span>
                          {achievement.xp_reward > 0 && (
                            <span className="text-xs text-primary">
                              +{achievement.xp_reward} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                Locked ({lockedAchievements.length})
              </h4>
              <div className="space-y-3">
                {lockedAchievements.slice(0, 5).map((achievement, index) => (
                  <motion.div
                    key={achievement.achievement_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-muted bg-muted/20 opacity-75"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl grayscale">{achievement.badge_icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-sm">{achievement.title}</h5>
                          {getRarityIcon(achievement.rarity)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="space-y-2">
                          <Progress value={achievement.progress_percentage} className="h-1" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(achievement.progress_percentage)}% complete
                            </span>
                            {achievement.xp_reward > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{achievement.xp_reward} XP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {lockedAchievements.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{lockedAchievements.length - 5} more achievements to unlock
                  </p>
                )}
              </div>
            </div>
          )}

          {achievements.length === 0 && (
            <div className="text-center py-6">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No achievements available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}