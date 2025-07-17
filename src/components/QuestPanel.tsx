import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Quest, UserQuest } from '@/types'
import { showNotification } from '@/components/NotificationToast'

export default function QuestPanel() {
  const [quests, setQuests] = useState<(Quest & { userQuest?: UserQuest })[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchQuests()
    }
  }, [user])

  const fetchQuests = async () => {
    if (!user) return

    try {
      // Get all active quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true })

      if (questsError) throw questsError

      // Get user's quest progress
      const { data: userQuestsData, error: userQuestsError } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', user.id)

      if (userQuestsError) throw userQuestsError

      // Combine quests with user progress
      const questsWithProgress = questsData?.map(quest => {
        const userQuest = userQuestsData?.find(uq => uq.quest_id === quest.id)
        return {
          ...quest,
          userQuest
        }
      }) || []

      setQuests(questsWithProgress)
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getQuestProgress = (quest: Quest & { userQuest?: UserQuest }) => {
    if (!quest.userQuest) return 0
    if (quest.userQuest.completed_at) return 100

    const criteria = quest.criteria as Record<string, number>
    const progress = quest.userQuest.progress as Record<string, number>
    
    // Calculate progress based on quest type
    const criteriaKey = Object.keys(criteria)[0]
    const required = criteria[criteriaKey]
    const current = progress[criteriaKey] || 0
    
    return Math.min((current / required) * 100, 100)
  }

  const getQuestStatus = (quest: Quest & { userQuest?: UserQuest }) => {
    if (!quest.userQuest) return 'not_started'
    if (quest.userQuest.completed_at) return 'completed'
    return 'in_progress'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>
      default:
        return <Badge variant="outline">Available</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Daily Quests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
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
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Daily Quests</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quests.map((quest) => {
            const progress = getQuestProgress(quest)
            const status = getQuestStatus(quest)
            
            return (
              <div key={quest.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <h4 className="font-medium">{quest.title}</h4>
                  </div>
                  {getStatusBadge(status)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {quest.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-muted-foreground">
                    Reward: +{quest.xp_reward} XP
                  </span>
                  {status === 'completed' && (
                    <Badge variant="default" className="bg-green-500">
                      <Trophy className="h-3 w-3 mr-1" />
                      Claimed
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
          
          {quests.length === 0 && (
            <div className="text-center py-6">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No quests available right now</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}