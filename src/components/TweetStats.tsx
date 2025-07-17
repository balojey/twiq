import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, MessageCircle, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Stats {
  totalTweets: number
  totalLikes: number
  totalRetweets: number
  totalUsers: number
}

export default function TweetStats() {
  const [stats, setStats] = useState<Stats>({
    totalTweets: 0,
    totalLikes: 0,
    totalRetweets: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total tweets
      const { count: tweetsCount } = await supabase
        .from('tweets')
        .select('*', { count: 'exact', head: true })

      // Get total likes
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })

      // Get total retweets
      const { count: retweetsCount } = await supabase
        .from('retweets')
        .select('*', { count: 'exact', head: true })

      // Get total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalTweets: tweetsCount || 0,
        totalLikes: likesCount || 0,
        totalRetweets: retweetsCount || 0,
        totalUsers: usersCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statItems = [
    {
      title: 'Total Tweets',
      value: stats.totalTweets,
      icon: MessageCircle,
      color: 'text-blue-500'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'Total Retweets',
      value: stats.totalRetweets,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{item.title}</p>
                <p className="text-lg font-semibold">{item.value.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}