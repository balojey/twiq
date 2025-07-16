import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Tweet } from '@/types'
import TweetCard from '@/components/TweetCard'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface TweetFeedProps {
  feedType: 'public' | 'following' | 'popular'
}

export default function TweetFeed({ feedType }: TweetFeedProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTweets = async () => {
    if (!user) return

    setLoading(true)
    
    try {
      // First get tweets with user data
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('tweets')
        .select(`
          *,
          user:users(*)
        `)
        .is('parent_id', null) // Only top-level tweets, not replies
        .order('created_at', { ascending: false })
        .limit(20)

      if (tweetsError) throw tweetsError

      if (!tweetsData) {
        setTweets([])
        return
      }

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

      setTweets(processedTweets)
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      setLoading(false)
    }
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
              ? "No tweets from people you follow yet."
              : "No popular tweets right now."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onUpdate={fetchTweets}
        />
      ))}
    </div>
  )
}