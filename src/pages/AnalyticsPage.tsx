import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import AchievementPanel from '@/components/AchievementPanel'

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">Analytics & Achievements</h1>
        <p className="text-sm text-muted-foreground">Track your progress and unlock achievements</p>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsDashboard />
        </div>
        
        <div>
          <AchievementPanel />
        </div>
      </div>
    </div>
  )
}