import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Tweet } from '@/types'
import TweetCard from '@/components/TweetCard'
import InfiniteScroll from '@/components/InfiniteScroll'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface PopularFeedProps {
  onTweetClick?: (tweetId: string) => void
}

const TWEETS_PER_PAGE = 10

export default function PopularFeed({ onTweetClick }: PopularFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const { user } = useAuth()

  const fetchPopularTweets = async (isLoadMore = false) => {
    if (!user) return

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setOffset(0)
      setHasMore(true)
    }
    
    try {
      const currentOffset = isLoadMore ? offset : 0
      
      // Get tweets with high engagement (likes + retweets) from the last 7 days
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          user:users(*),
          likes:likes(count),
          retweets:retweets(count)
        `)
        .is('parent_id', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + TWEETS_PER_PAGE - 1)

      if (error) throw error

      if (!data) {
        if (!isLoadMore) setTweets([])
        setHasMore(false)
        return
      }

      // Calculate engagement score and sort by popularity
      const tweetsWithEngagement = await Promise.all(
        data.map(async (tweet) => {
          // Get actual counts
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('tweet_id', tweet.id)

          const { count: retweetsCount } = await supabase
            .from('retweets')
            .select('*', { count: 'exact', head: true })
            .eq('tweet_id', tweet.id)

          const { count: repliesCount } = await supabase
            .from('tweets')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', tweet.id)

          // Check user interactions
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('tweet_id', tweet.id)
            .single()

          const { data: userRetweet } = await supabase
            .from('retweets')
            .select('id')
            .eq('user_id', user.id)
            .eq('tweet_id', tweet.id)
            .single()

          const engagementScore = (likesCount || 0) * 1 + (retweetsCount || 0) * 2 + (repliesCount || 0) * 1.5

          return {
            ...tweet,
            likes_count: likesCount || 0,
            retweets_count: retweetsCount || 0,
            replies_count: repliesCount || 0,
            is_liked: !!userLike,
            is_retweeted: !!userRetweet,
            engagement_score: engagementScore
          }
        })
      )

      // Sort by engagement score (descending)
      const sortedTweets = tweetsWithEngagement
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .filter(tweet => tweet.engagement_score > 0) // Only show tweets with some engagement

      setHasMore(sortedTweets.length === TWEETS_PER_PAGE)
      setOffset(currentOffset + sortedTweets.length)

      if (isLoadMore) {
        setTweets(prev => [...prev, ...sortedTweets])
      } else {
        setTweets(sortedTweets)
      }
    } catch (error) {
      console.error('Error fetching popular tweets:', error)
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleLoadMore = () => {
    fetchPopularTweets(true)
  }

  useEffect(() => {
    fetchPopularTweets()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No popular tweets this week. Start engaging with content to see trending tweets!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loading={loadingMore}
      onLoadMore={handleLoadMore}
    >
      <div className="space-y-4">
        {tweets.map((tweet, index) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <TweetCard
              tweet={tweet}
              onUpdate={() => fetchPopularTweets(false)}
              onTweetClick={onTweetClick}
            />
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  )
}