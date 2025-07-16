import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<(User & { rank: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10)

      if (error) throw error

      const leaderboardWithRanks = data?.map((user, index) => ({
        ...user,
        rank: index + 1
      })) || []

      setLeaderboard(leaderboardWithRanks)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <p className="text-sm text-muted-foreground">Top XP earners of all time</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
      <div className="p-4 space-y-4">
        {leaderboard.length > 0 ? leaderboard.map((user) => (
          <Card key={user.rank}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">
                    {user.username?.[0]?.toUpperCase()}
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
        )) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-muted-foreground">
                No users on the leaderboard yet!
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        
        {leaderboard.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Start tweeting and engaging to climb the leaderboard!
          </p>
        )}
      </div>
      )}
    </div>
  )
}