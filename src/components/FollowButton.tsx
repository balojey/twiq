import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FollowButtonProps {
  targetUserId: string
  targetUsername: string
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({ 
  targetUserId, 
  targetUsername, 
  isFollowing = false,
  onFollowChange 
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState(isFollowing)
  const { user } = useAuth()

  const handleFollow = async () => {
    if (!user || loading) return
    
    setLoading(true)
    
    try {
      if (following) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
        
        if (error) throw error
        
        setFollowing(false)
        onFollowChange?.(false)
        toast.success(`Unfollowed @${targetUsername}`)
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          })
        
        if (error) throw error
        
        setFollowing(true)
        onFollowChange?.(true)
        toast.success(`Now following @${targetUsername}`)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setLoading(false)
    }
  }

  if (user?.id === targetUserId) {
    return null // Don't show follow button for own profile
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={following ? "outline" : "default"}
      size="sm"
      className={following ? "hover:bg-destructive hover:text-destructive-foreground" : ""}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  )
}