import { useState } from 'react'
import { Button } from '@/components/ui/button'
import TweetComposer from '@/components/TweetComposer'
import TweetFeed from '@/components/TweetFeed'
import TweetDetailModal from '@/components/TweetDetailModal'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'public' | 'following' | 'popular'>('public')
  const [feedKey, setFeedKey] = useState(0)
  const [selectedTweetId, setSelectedTweetId] = useState<string | null>(null)

  const handleTweetPosted = () => {
    // Force feed refresh by updating key
    setFeedKey(prev => prev + 1)
  }

  const handleTweetClick = (tweetId: string) => {
    setSelectedTweetId(tweetId)
  }
  return (
    <>
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
        <div className="space-y-4">
          <TweetComposer onTweetPosted={handleTweetPosted} />
          <TweetFeed 
            key={feedKey} 
            feedType={activeTab} 
            onTweetClick={handleTweetClick}
          />
        </div>
      </div>
    </div>
      
      <TweetDetailModal
        tweetId={selectedTweetId}
        open={!!selectedTweetId}
        onClose={() => setSelectedTweetId(null)}
      />
    </>
  )
}