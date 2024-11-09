'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ListMusic } from "lucide-react"
import { initiateSpotifyLogin } from "@/lib/spotify-auth"

export default function LoginPage() {
  const handleSpotifyLogin = async () => {
    try {
      await initiateSpotifyLogin()
    } catch (error) {
      console.error('Failed to initiate Spotify login:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connect Your Music</CardTitle>
          <CardDescription>
            Choose your music streaming services to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full flex items-center gap-2" 
            variant="outline"
            onClick={handleSpotifyLogin}
          >
            <ListMusic className="h-5 w-5" />
            Connect Spotify
          </Button>
          {/* <Button className="w-full flex items-center gap-2" variant="outline">
            <Music className="h-5 w-5" />
            Connect Apple Music
          </Button> */}
        </CardContent>
      </Card>
    </div>
  )
} 