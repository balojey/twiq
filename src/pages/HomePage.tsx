import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'public' | 'following' | 'popular'>('public')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <h1 className="text-xl font-bold">Home</h1>
        
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'public', label: 'Public' },
            { key: 'following', label: 'Following' },
            { key: 'popular', label: 'Popular' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Twiq! 🎮</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You're now part of the gamified social experience. Start tweeting to earn XP and level up!
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Post a tweet</span>
                <span className="text-primary font-medium">+10 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Get a like</span>
                <span className="text-primary font-medium">+5 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Get a retweet</span>
                <span className="text-primary font-medium">+10 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Daily login bonus</span>
                <span className="text-primary font-medium">+20 XP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}