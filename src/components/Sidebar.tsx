import { Link, useLocation } from 'react-router-dom'
import { Home, User, Trophy, Settings, LogOut, Wallet, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/SearchBar'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Quests', href: '/quests', icon: Target },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="w-64 p-4 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Twiq</h1>
        <p className="text-xs text-muted-foreground mt-1">Gamified Social Network</p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search users, tweets..." />
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/profile' && location.pathname.startsWith('/profile'))
          
          return (
            <Link
              key={item.name}
              to={item.href === '/profile' ? `/profile/${user?.username}` : item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" disabled>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {user && (
        <div className="mt-4 p-3 bg-card rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {user.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground">Level {user.level} • {user.xp} XP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}