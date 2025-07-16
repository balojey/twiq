import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

export default function XPProgressBar() {
  const { user } = useAuth()
  const [showXPGain, setShowXPGain] = useState(false)
  const [xpGain, setXPGain] = useState(0)
  const [prevXP, setPrevXP] = useState(0)

  useEffect(() => {
    if (user && prevXP > 0 && user.xp > prevXP) {
      const gain = user.xp - prevXP
      setXPGain(gain)
      setShowXPGain(true)
      
      const timer = setTimeout(() => {
        setShowXPGain(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
    if (user) {
      setPrevXP(user.xp)
    }
  }, [user?.xp, prevXP])

  if (!user) return null

  // Calculate XP needed for next level (simple formula: level * 100)
  const currentLevelXP = (user.level - 1) * 100
  const nextLevelXP = user.level * 100
  const progressXP = user.xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progressPercentage = (progressXP / neededXP) * 100

  return (
    <div className="fixed bottom-4 left-4 bg-card border rounded-lg p-3 shadow-lg min-w-[200px] z-50">
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
      
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg"
          >
            <Zap className="h-3 w-3" />
            <span>+{xpGain} XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}