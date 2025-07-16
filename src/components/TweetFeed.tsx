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
      let query = supabase
        .from('tweets')
        .select(`
          *,
          user:users(*),
          likes_count:likes(count),
          retweets_count:retweets(count),
          replies_count:tweets!parent_id(count),
          is_liked:likes!inner(user_id),
          is_retweeted:retweets!inner(user_id)
        `)
        .is('parent_id', null) // Only top-level tweets, not replies
        .order('created_at', { ascending: false })
        .limit(20)

      // For now, all feeds show public tweets
      // TODO: Implement following and popular logic
      
      const { data, error } = await query

      if (error) throw error

      // Process the data to flatten the counts and boolean flags
      const processedTweets = data?.map(tweet => ({
        ...tweet,
        likes_count: tweet.likes_count?.[0]?.count || 0,
        retweets_count: tweet.retweets_count?.[0]?.count || 0,
        replies_count: tweet.replies_count?.[0]?.count || 0,
        is_liked: tweet.is_liked?.some((like: any) => like.user_id === user.id) || false,
        is_retweeted: tweet.is_retweeted?.some((retweet: any) => retweet.user_id === user.id) || false,
      })) || []

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