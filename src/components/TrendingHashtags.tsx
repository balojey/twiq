import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Hash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

interface Hashtag {
  hashtag: string
  count: number
  recent_count: number
}

export default function TrendingHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingHashtags()
  }, [])

  const fetchTrendingHashtags = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_hashtags', { p_limit: 5 })

      if (error) throw error
      setHashtags(data || [])
    } catch (error) {
      console.error('Error fetching trending hashtags:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hashtags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Hash className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No trending hashtags yet. Start using hashtags in your tweets!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Trending</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <motion.div
              key={hashtag.hashtag}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">#{hashtag.hashtag}</p>
                <p className="text-xs text-muted-foreground">
                  {hashtag.count} tweet{hashtag.count === 1 ? '' : 's'}
                </p>
              </div>
              {hashtag.recent_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {hashtag.recent_count} today
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}