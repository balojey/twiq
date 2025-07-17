import QuestPanel from '@/components/QuestPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Target, Award } from 'lucide-react'

export default function QuestsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Quests & Achievements</h1>
        <p className="text-sm text-muted-foreground">Complete quests to earn XP and level up!</p>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuestPanel />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Quest Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Trophy className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Daily Reset</p>
                  <p className="text-muted-foreground">Quests reset every 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Progress Tracking</p>
                  <p className="text-muted-foreground">Your progress is saved automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Award className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">XP Rewards</p>
                  <p className="text-muted-foreground">Complete quests to earn bonus XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li>• Weekly challenges</li>
                <li>• Achievement badges</li>
                <li>• Streak bonuses</li>
                <li>• Special events</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}