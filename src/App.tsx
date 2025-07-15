import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Mic, MicOff, Send, Settings } from 'lucide-react'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [message, setMessage] = useState('')

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Email AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your emails with voice and text
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Conversation</span>
                <Badge variant="secondary">Connected</Badge>
              </CardTitle>
              <CardDescription>
                Ask me to help with your emails - I can read, reply, summarize, and organize them for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chat Messages Area */}
              <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 max-w-md">
                    <p className="text-sm">
                      Hello! I'm your email AI assistant. I can help you manage your emails through voice or text. 
                      What would you like me to help you with today?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your message or use voice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[60px] pr-12"
                  />
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "secondary"}
                    className="absolute right-2 top-2"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {isListening && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Check Inbox</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review new emails
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Compose Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Draft a new message
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Organize</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sort and filter emails
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App