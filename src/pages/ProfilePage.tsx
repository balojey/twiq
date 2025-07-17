import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { User, Tweet } from '@/types'
import TweetCard from '@/components/TweetCard'
import FollowButton from '@/components/FollowButton'
import { formatDistanceToNow } from 'date-fns'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [tweetsLoading, setTweetsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [stats, setStats] = useState({
    tweetsCount: 0,
    followersCount: 0,
    followingCount: 0
  })

  const isOwnProfile = user?.username === username

  useEffect(() => {
    if (username) {
      fetchProfile()
      fetchUserTweets()
    }
  }, [username])

  useEffect(() => {
    if (profileUser && user && !isOwnProfile) {
      checkFollowStatus()
    }
    if (profileUser) {
      fetchUserStats()
    }
  }, [profileUser, user, isOwnProfile])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      setProfileUser(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFollowStatus = async () => {
    if (!user || !profileUser) return
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileUser.id)
        .single()
      
      setIsFollowing(!!data)
    } catch (error) {
      // No follow relationship exists
      setIsFollowing(false)
    }
  }
  const fetchUserTweets = async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          user:users(*)
        `)
        .eq('user.username', username)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      // Process tweets with counts (simplified for now)
      const processedTweets = data?.map(tweet => ({
        ...tweet,
        likes_count: 0,
        retweets_count: 0,
        replies_count: 0,
        is_liked: false,
        is_retweeted: false,
      })) || []

      setTweets(processedTweets)
    } catch (error) {
      console.error('Error fetching user tweets:', error)
    } finally {
      setTweetsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    if (!profileUser) return

    try {
      // Get tweets count
      const { count: tweetsCount } = await supabase
        .from('tweets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileUser.id)

      // Get follow stats
      const { data: followStats } = await supabase
        .rpc('get_user_follow_stats', { p_user_id: profileUser.id })
        .single()
      setStats({
        tweetsCount: tweetsCount || 0,
        followersCount: followStats?.followers_count || 0,
        followingCount: followStats?.following_count || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleFollowChange = (newFollowStatus: boolean) => {
    setIsFollowing(newFollowStatus)
    setStats(prev => ({
      ...prev,
      followersCount: prev.followersCount + (newFollowStatus ? 1 : -1)
    }))
  }
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold">Profile not found</h1>
        </div>
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                The user @{username} doesn't exist.
              </p>
              <Link to="/">
                <Button className="mt-4">Go Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">@{profileUser.username}</h1>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {profileUser.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{profileUser.username}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">Level {profileUser.level}</Badge>
                  <span className="text-sm text-muted-foreground">{profileUser.xp} XP</span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profileUser.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              )}
              {!isOwnProfile && profileUser && (
                <FollowButton
                  targetUserId={profileUser.id}
                  targetUsername={profileUser.username}
                  isFollowing={isFollowing}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {profileUser.bio || 'No bio yet.'}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.tweetsCount}</div>
                <div className="text-sm text-muted-foreground">Tweets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.followingCount}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.followersCount}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Tweets</h2>
          {tweetsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tweets.length > 0 ? (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't posted any tweets yet. Start sharing your thoughts!"
                    : `@${profileUser.username} hasn't posted any tweets yet.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}