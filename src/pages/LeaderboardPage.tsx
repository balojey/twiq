import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

export default function LeaderboardPage() {
  // Mock data for now
  const leaderboard = [
    { rank: 1, username: 'alice_dev', level: 15, xp: 1500, avatar: 'A' },
    { rank: 2, username: 'bob_gamer', level: 12, xp: 1200, avatar: 'B' },
    { rank: 3, username: 'charlie_code', level: 10, xp: 1000, avatar: 'C' },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top XP earners this week</p>
      </div>

      <div className="p-4 space-y-4">
        {leaderboard.map((user) => (
          <Card key={user.rank}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">
                    {user.avatar}
                  </span>
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {user.level}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-primary">{user.xp} XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">
              Start tweeting to join the leaderboard!
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}