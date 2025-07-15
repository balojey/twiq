import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/AuthModal'
import Sidebar from '@/components/Sidebar'
import XPProgressBar from '@/components/XPProgressBar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()

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
      <div className="max-w-6xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 min-h-screen border-x border-border">
          {children}
        </main>
        <div className="w-80 p-4">
          {/* Right sidebar for trending, suggestions, etc. */}
        </div>
      </div>
      <XPProgressBar />
    </div>
  )
}