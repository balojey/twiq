import { useState, useEffect } from 'react'
import { Github, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

export default function AuthModal() {
  const [loading, setLoading] = useState(false)
  const { signInWithGitHub } = useAuth()

  const handleGithubLogin = async () => {
    setLoading(true)
    try {
      await signInWithGitHub()
    } catch (error) {
      console.error('Error logging in with GitHub:', error)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mb-4"
          >
            <span className="text-2xl font-bold text-primary-foreground">T</span>
          </motion.div>
          <DialogTitle className="text-2xl font-bold">Welcome to Twiq</DialogTitle>
          <DialogDescription className="text-base">
            Join the gamified social experience. Sign in to start earning XP and leveling up!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full h-12"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12"
            size="lg"
            disabled
          >
            <Mail className="mr-2 h-4 w-4" />
            Email (Coming Soon)
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}