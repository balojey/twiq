import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Tweet } from '@/types'
import { motion } from 'framer-motion'
import { showNotification } from '@/components/NotificationToast'

interface TweetCardProps {
  tweet: Tweet
  onUpdate?: () => void
}

export default function TweetCard({ tweet, onUpdate }: TweetCardProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isRetweeting, setIsRetweeting] = useState(false)
  const { user } = useAuth()

  const handleLike = async () => {
    if (!user || isLiking) return
    
    setIsLiking(true)
    
    try {
      if (tweet.is_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('tweet_id', tweet.id)
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            tweet_id: tweet.id
          })

        if (error) throw error

        // Award XP to tweet author for receiving a like
        if (tweet.user_id !== user.id) {
          await supabase.rpc('award_xp', {
            p_user_id: tweet.user_id,
            p_event_type: 'like_received',
            p_xp_amount: 5,
            p_reference_id: tweet.id
          })
          
          showNotification({
            type: 'xp',
            message: 'Tweet liked! Author earned +5 XP',
            amount: 5
          })
        }
      }
      
      onUpdate?.()
    } catch (error) {
      console.error('Error toggling like:', error)
      showNotification({
        type: 'like',
        message: 'Failed to update like'
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleRetweet = async () => {
    if (!user || isRetweeting) return
    
    setIsRetweeting(true)
    
    try {
      if (tweet.is_retweeted) {
        // Unretweet
        await supabase
          .from('retweets')
          .delete()
          .eq('user_id', user.id)
          .eq('tweet_id', tweet.id)
      } else {
        // Retweet
        const { error } = await supabase
          .from('retweets')
          .insert({
            user_id: user.id,
            tweet_id: tweet.id
          })

        if (error) throw error

        // Award XP to tweet author for receiving a retweet
        if (tweet.user_id !== user.id) {
          await supabase.rpc('award_xp', {
            p_user_id: tweet.user_id,
            p_event_type: 'retweet_received',
            p_xp_amount: 10,
            p_reference_id: tweet.id
          })
          
          showNotification({
            type: 'xp',
            message: 'Tweet retweeted! Author earned +10 XP',
            amount: 10
          })
        }
      }
      
      onUpdate?.()
    } catch (error) {
      console.error('Error toggling retweet:', error)
      showNotification({
        type: 'retweet',
        message: 'Failed to update retweet'
      })
    } finally {
      setIsRetweeting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-foreground">
                {tweet.user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-foreground">
                  {tweet.user?.username}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Level {tweet.user?.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tweet.user?.xp} XP
                  </span>
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto p-1 h-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-foreground whitespace-pre-wrap mb-3">
                {tweet.content}
              </p>
              
              {tweet.media_url && (
                <div className="mb-3">
                  <img
                    src={tweet.media_url}
                    alt="Tweet media"
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between max-w-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tweet.replies_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetweet}
                  disabled={isRetweeting}
                  className={`p-2 ${
                    tweet.is_retweeted
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-100'
                      : 'text-muted-foreground hover:text-green-600 hover:bg-green-100'
                  }`}
                >
                  <Repeat2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tweet.retweets_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`p-2 ${
                    tweet.is_liked
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-100'
                      : 'text-muted-foreground hover:text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${tweet.is_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{tweet.likes_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}