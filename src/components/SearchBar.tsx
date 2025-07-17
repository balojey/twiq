import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "Search Twiq..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch?.(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Try searching for:</p>
                  <div className="flex flex-wrap gap-2">
                    {['#gamification', '#quests', '#levelup', '#twiq'].map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(tag)
                          onSearch?.(tag)
                        }}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}