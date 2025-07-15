import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

export default function XPProgressBar() {
  const { user } = useAuth()

  if (!user) return null

  // Calculate XP needed for next level (simple formula: level * 100)
  const currentLevelXP = (user.level - 1) * 100
  const nextLevelXP = user.level * 100
  const progressXP = user.xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progressPercentage = (progressXP / neededXP) * 100

  return (
    <div className="fixed bottom-4 left-4 bg-card border rounded-lg p-3 shadow-lg min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Level {user.level}</span>
        <span className="text-xs text-muted-foreground">
          {progressXP}/{neededXP} XP
        </span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}