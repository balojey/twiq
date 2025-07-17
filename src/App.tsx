import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WalletContextProvider } from '@/contexts/WalletContextProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import QuestsPage from '@/pages/QuestsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/components/NotFoundPage'
import EnhancedNotificationSystem from '@/components/EnhancedNotificationSystem'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WalletContextProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/quests" element={<QuestsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Layout>
                <EnhancedNotificationSystem />
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </WalletContextProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
