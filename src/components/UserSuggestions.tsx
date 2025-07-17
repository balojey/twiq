import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import { Link } from 'react-router-dom'

export default function UserSuggestions() {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchSuggestions()
  }, [user])

  const fetchSuggestions = async () => {
    if (!user) return

    try {
      // Get top users by XP, excluding current user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .order('xp', { ascending: false })
        .limit(3)

      if (error) throw error
      setSuggestions(data || [])
    } catch (error) {
      console.error('Error fetching user suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions available yet. Start engaging to discover other users!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestedUser) => (
          <div key={suggestedUser.id} className="flex items-center justify-between">
            <Link 
              to={`/profile/${suggestedUser.username}`}
              className="flex items-center space-x-3 flex-1 hover:bg-accent/50 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {suggestedUser.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{suggestedUser.username}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Level {suggestedUser.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {suggestedUser.xp} XP
                  </span>
                </div>
              </div>
            </Link>
            <Button size="sm" variant="outline" className="ml-2">
              <UserPlus className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        <Link to="/leaderboard">
          <Button variant="ghost" className="w-full text-sm">
            View all users
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}