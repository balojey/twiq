import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart, 
  Repeat2, 
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface UserGrowthMetric {
  date: string
  followers_gained: number
  tweets_posted: number
  engagement_score: number
  xp_earned: number
}

interface EngagementStats {
  total_tweets: number
  total_likes_received: number
  total_retweets_received: number
  total_replies_received: number
  avg_engagement_rate: number
  best_performing_tweet: string
}

export default function AnalyticsDashboard() {
  const [growthMetrics, setGrowthMetrics] = useState<UserGrowthMetric[]>([])
  const [engagementStats, setEngagementStats] = useState<EngagementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch growth metrics
      const { data: growthData, error: growthError } = await supabase
        .rpc('get_user_growth_metrics', { 
          p_user_id: user.id, 
          p_days: parseInt(timeRange) 
        })

      if (growthError) throw growthError

      // Fetch engagement stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_activity_stats', { p_user_id: user.id })
        .single()

      if (statsError) throw statsError

      setGrowthMetrics(growthData || [])
      setEngagementStats({
        total_tweets: statsData.tweets_count || 0,
        total_likes_received: statsData.likes_received || 0,
        total_retweets_received: statsData.retweets_received || 0,
        total_replies_received: 0, // Would need additional query
        avg_engagement_rate: 0, // Would need calculation
        best_performing_tweet: '' // Would need additional query
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalFollowersGained = growthMetrics.reduce((sum, metric) => sum + metric.followers_gained, 0)
  const totalTweetsPosted = growthMetrics.reduce((sum, metric) => sum + metric.tweets_posted, 0)
  const totalXPEarned = growthMetrics.reduce((sum, metric) => sum + metric.xp_earned, 0)
  const avgEngagementScore = growthMetrics.length > 0 
    ? growthMetrics.reduce((sum, metric) => sum + metric.engagement_score, 0) / growthMetrics.length 
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
            <TabsTrigger value="90">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Followers Gained</p>
                  <p className="text-2xl font-bold">{totalFollowersGained}</p>
                  <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tweets Posted</p>
                  <p className="text-2xl font-bold">{totalTweetsPosted}</p>
                  <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">{avgEngagementScore.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Engagement Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">XP Earned</p>
                  <p className="text-2xl font-bold">{totalXPEarned}</p>
                  <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Growth Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {growthMetrics.slice(0, 7).map((metric, index) => (
                <motion.div
                  key={metric.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {new Date(metric.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.tweets_posted} tweets
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      +{metric.followers_gained} followers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.xp_earned} XP
                    </p>
                  </div>
                </motion.div>
              ))}
              {growthMetrics.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No data available for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Engagement Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagementStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{engagementStats.total_likes_received}</p>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Repeat2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{engagementStats.total_retweets_received}</p>
                    <p className="text-sm text-muted-foreground">Total Retweets</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Content:</span>
                      <Badge variant="secondary">{engagementStats.total_tweets} tweets</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Likes per Tweet:</span>
                      <span>{engagementStats.total_tweets > 0 
                        ? (engagementStats.total_likes_received / engagementStats.total_tweets).toFixed(1)
                        : '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Retweets per Tweet:</span>
                      <span>{engagementStats.total_tweets > 0 
                        ? (engagementStats.total_retweets_received / engagementStats.total_tweets).toFixed(1)
                        : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}