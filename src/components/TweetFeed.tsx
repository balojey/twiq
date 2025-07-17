import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Tweet } from '@/types'
import TweetCard from '@/components/TweetCard'
import InfiniteScroll from '@/components/InfiniteScroll'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface TweetFeedProps {
  feedType: 'public' | 'following' | 'popular'
  onTweetClick?: (tweetId: string) => void
}

const TWEETS_PER_PAGE = 10
export default function TweetFeed({ feedType, onTweetClick }: TweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const { user } = useAuth()

  const fetchTweets = async (isLoadMore = false) => {
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
      
      let tweetsData, tweetsError
      
      if (feedType === 'following') {
        // Get tweets from followed users
        const { data, error } = await supabase
          .rpc('get_following_feed', {
            p_user_id: user.id,
            p_limit: TWEETS_PER_PAGE,
            p_offset: currentOffset
          })
        
        tweetsData = data?.map(tweet => ({
          id: tweet.tweet_id,
          user_id: tweet.user_id,
          content: tweet.content,
          media_url: tweet.media_url,
          parent_id: tweet.parent_id,
          created_at: tweet.created_at,
          user: {
            id: tweet.user_id,
            username: tweet.username,
            avatar_url: tweet.avatar_url,
            level: tweet.user_level,
            xp: tweet.user_xp
          }
        }))
        tweetsError = error
      } else {
        // Get public tweets with user data
        const { data, error } = await supabase
          .from('tweets')
          .select(`
            *,
            user:users(*)
          `)
          .is('parent_id', null) // Only top-level tweets, not replies
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + TWEETS_PER_PAGE - 1)
        
        tweetsData = data
        tweetsError = error
      }

      if (tweetsError) throw tweetsError

      if (!tweetsData) {
        if (!isLoadMore) setTweets([])
        setHasMore(false)
        return
      }

      // Check if we have more tweets
      setHasMore(tweetsData.length === TWEETS_PER_PAGE)
      setOffset(currentOffset + tweetsData.length)

      // Get counts and user interactions for each tweet
      const processedTweets = await Promise.all(
        tweetsData.map(async (tweet) => {
          // Get likes count
          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('tweet_id', tweet.id)

          // Get retweets count
          const { count: retweetsCount } = await supabase
            .from('retweets')
            .select('*', { count: 'exact', head: true })
            .eq('tweet_id', tweet.id)

          // Get replies count
          const { count: repliesCount } = await supabase
            .from('tweets')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', tweet.id)

          // Check if current user liked this tweet
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('tweet_id', tweet.id)
            .single()

          // Check if current user retweeted this tweet
          const { data: userRetweet } = await supabase
            .from('retweets')
            .select('id')
            .eq('user_id', user.id)
            .eq('tweet_id', tweet.id)
            .single()

          return {
            ...tweet,
            likes_count: likesCount || 0,
            retweets_count: retweetsCount || 0,
            replies_count: repliesCount || 0,
            is_liked: !!userLike,
            is_retweeted: !!userRetweet,
          }
        })
      )

      if (isLoadMore) {
        setTweets(prev => [...prev, ...processedTweets])
      } else {
        setTweets(processedTweets)
      }
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleLoadMore = () => {
    fetchTweets(true)
  }

  useEffect(() => {
    fetchTweets()
  }, [feedType, user])

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
          <p className="text-muted-foreground">
            {feedType === 'public' 
              ? "No tweets yet. Be the first to post!"
              : feedType === 'following'
              ? "No tweets from people you follow yet. Try following some users!"
              : "No popular tweets right now."
            }
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
        {tweets.map((tweet) => (
          <motion.div
            key={tweet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <TweetCard
              tweet={tweet}
              onUpdate={() => fetchTweets(false)}
              onTweetClick={onTweetClick}
            />
          </motion.div>
        ))}
      </div>
    </InfiniteScroll>
  )
}