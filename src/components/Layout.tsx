import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'
import Sidebar from '@/components/Sidebar'
import XPProgressBar from '@/components/XPProgressBar'
import ThemeToggle from '@/components/ThemeToggle'
import UserSuggestions from '@/components/UserSuggestions'
import TweetStats from '@/components/TweetStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDailyLogin } from '@/hooks/useDailyLogin'
import DailyStreakCard from '@/components/DailyStreakCard'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()
  useDailyLogin() // Automatically check daily login

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthModal />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 min-h-screen border-x border-border">
          {children}
        </main>
        <div className="w-80 p-4">
          <div className="sticky top-4 space-y-4">
            <TweetStats />
            
            <DailyStreakCard />
            
            <UserSuggestions />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's happening</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>🎮 Welcome to Twiq! Start tweeting to earn XP and level up.</p>
                  <p>🏆 Complete quests to unlock achievements and climb the leaderboard.</p>
                  <p>⚡ Engage with others to boost your social score!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <XPProgressBar />
    </div>
  )
}