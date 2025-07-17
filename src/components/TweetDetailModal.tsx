import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Tweet } from '@/types'
import TweetCard from '@/components/TweetCard'
import TweetComposer from '@/components/TweetComposer'
import { motion, AnimatePresence } from 'framer-motion'

interface TweetDetailModalProps {
  tweetId: string | null
  open: boolean
  onClose: () => void
}

export default function TweetDetailModal({ tweetId, open, onClose }: TweetDetailModalProps) {
  const [tweet, setTweet] = useState<Tweet | null>(null)
  const [replies, setReplies] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [repliesLoading, setRepliesLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (open && tweetId) {
      fetchTweetDetails()
      fetchReplies()
    }
  }, [open, tweetId])

  const fetchTweetDetails = async () => {
    if (!tweetId || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', tweetId)
        .single()

      if (error) throw error

      // Get interaction counts and user status
      const [likesResult, retweetsResult, repliesResult, userLikeResult, userRetweetResult] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('tweet_id', tweetId),
        supabase.from('retweets').select('*', { count: 'exact', head: true }).eq('tweet_id', tweetId),
        supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('parent_id', tweetId),
        supabase.from('likes').select('id').eq('user_id', user.id).eq('tweet_id', tweetId).single(),
        supabase.from('retweets').select('id').eq('user_id', user.id).eq('tweet_id', tweetId).single()
      ])

      const processedTweet = {
        ...data,
        likes_count: likesResult.count || 0,
        retweets_count: retweetsResult.count || 0,
        replies_count: repliesResult.count || 0,
        is_liked: !!userLikeResult.data,
        is_retweeted: !!userRetweetResult.data,
      }

      setTweet(processedTweet)
    } catch (error) {
      console.error('Error fetching tweet details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    if (!tweetId || !user) return

    setRepliesLoading(true)
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          user:users(*)
        `)
        .eq('parent_id', tweetId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Process replies with interaction data
      const processedReplies = await Promise.all(
        (data || []).map(async (reply) => {
          const [likesResult, retweetsResult, repliesResult, userLikeResult, userRetweetResult] = await Promise.all([
            supabase.from('likes').select('*', { count: 'exact', head: true }).eq('tweet_id', reply.id),
            supabase.from('retweets').select('*', { count: 'exact', head: true }).eq('tweet_id', reply.id),
            supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('parent_id', reply.id),
            supabase.from('likes').select('id').eq('user_id', user.id).eq('tweet_id', reply.id).single(),
            supabase.from('retweets').select('id').eq('user_id', user.id).eq('tweet_id', reply.id).single()
          ])

          return {
            ...reply,
            likes_count: likesResult.count || 0,
            retweets_count: retweetsResult.count || 0,
            replies_count: repliesResult.count || 0,
            is_liked: !!userLikeResult.data,
            is_retweeted: !!userRetweetResult.data,
          }
        })
      )

      setReplies(processedReplies)
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setRepliesLoading(false)
    }
  }

  const handleReplyPosted = () => {
    fetchReplies()
    fetchTweetDetails() // Refresh to update reply count
  }

  const handleTweetUpdate = () => {
    fetchTweetDetails()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Tweet</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tweet ? (
            <>
              <TweetCard tweet={tweet} onUpdate={handleTweetUpdate} />
              
              <div className="border-t pt-4">
                <TweetComposer
                  onTweetPosted={handleReplyPosted}
                  placeholder="Tweet your reply..."
                  parentId={tweet.id}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">
                  {replies.length > 0 ? `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}` : 'No replies yet'}
                </h3>
                
                {repliesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-4">
                      {replies.map((reply) => (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TweetCard tweet={reply} onUpdate={fetchReplies} />
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tweet not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}