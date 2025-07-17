import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, Smile, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { showNotification } from '@/components/NotificationToast'

interface TweetComposerProps {
  onTweetPosted?: () => void
  placeholder?: string
  parentId?: string
}

export default function TweetComposer({ onTweetPosted, placeholder = "What's happening?", parentId }: TweetComposerProps) {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !user) return
    
    setIsPosting(true)
    
    try {
      const { error } = await supabase
        .from('tweets')
        .insert({
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        })

      if (error) throw error

      // Award XP for posting a tweet
      await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_event_type: 'tweet',
        p_xp_amount: 10
      })

      setContent('')
      showNotification({
        type: 'xp',
        message: 'Tweet posted successfully!',
        amount: 10
      })
      onTweetPosted?.()
    } catch (error) {
      console.error('Error posting tweet:', error)
      showNotification({
        type: 'reply',
        message: 'Failed to post tweet'
      })
    } finally {
      setIsPosting(false)
    }
  }

  const characterCount = content.length
  const isOverLimit = characterCount > 280
  const isEmpty = content.trim().length === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-foreground">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] resize-none border-none p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                disabled={isPosting}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    disabled
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    disabled
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    disabled
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                    disabled
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {characterCount}/280
                  </span>
                  <Button
                    type="submit"
                    disabled={isEmpty || isOverLimit || isPosting}
                    className="rounded-full px-6"
                  >
                    {isPosting ? 'Posting...' : parentId ? 'Reply' : 'Tweet'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  )
}