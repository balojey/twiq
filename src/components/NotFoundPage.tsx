import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <span className="text-4xl font-bold text-primary">404</span>
            </motion.div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="space-y-2">
              <Link to="/">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Looking for something specific?
              </p>
              <div className="flex space-x-2">
                <Link to="/leaderboard" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/quests" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    Quests
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}