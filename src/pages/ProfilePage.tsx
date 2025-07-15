import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.username}</CardTitle>
                <p className="text-muted-foreground">Level {user?.level} • {user?.xp} XP</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {user?.bio || 'No bio yet. Start tweeting to build your profile!'}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Tweets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}