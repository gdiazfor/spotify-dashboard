"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSpotify } from "@/hooks/use-spotify"
import { Volume2, ExternalLink, SkipBack, Pause, Play, SkipForward } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { useNowPlaying } from "@/hooks/use-now-playing"
import { useAuthStore } from "@/store/auth-store"

interface SpotifyDevice {
    id: string
    is_active: boolean
    // Add other device properties if needed
  }
interface CurrentTrack {
  item: {
    name: string
    artists: { name: string; external_urls: { spotify: string } }[]
    album: {
      name: string
      images: { url: string }[]
      external_urls: { spotify: string }
      release_date: string
    }
    external_urls: { spotify: string }
    duration_ms: number
    popularity: number
  }
  is_playing: boolean
  progress_ms: number
}

interface MiniNowPlayingProps {
  className?: string;
}

export function MiniNowPlaying({ className }: MiniNowPlayingProps) {
  const { data: currentTrack, error } = useNowPlaying()
  const { fetchWithToken, isAuthenticated, spotify } = useSpotify()
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const { spotify: authSpotify } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    const getDevices = async () => {
      try {
        const response = await fetchWithToken('/me/player/devices')
        if (!response?.devices) return null
        const activeDevice = response.devices.find((d: SpotifyDevice) => d.is_active)
        if (activeDevice) setDeviceId(activeDevice.id)
      } catch (error) {
        console.error('Failed to get devices:', error)
      }
    }
    
    getDevices()
    const interval = setInterval(getDevices, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchWithToken])

  const handlePlayPause = async () => {
    if (!isAuthenticated || !deviceId) return
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/${currentTrack?.is_playing ? 'pause' : 'play'}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authSpotify.accessToken}`,
          'Content-Type': 'application/json'
        },
        ...((!currentTrack?.is_playing && {
          body: JSON.stringify({
            device_id: deviceId
          })
        }))
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error)
    }
  }

  const handleSkip = async (direction: 'prev' | 'next') => {
    if (!isAuthenticated || !deviceId) return
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/${direction === 'prev' ? 'previous' : 'next'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authSpotify.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to skip track:', error)
    }
  }

  if (error || !currentTrack?.item) {
    return (
      <div className={className}>
        <Card className="flex items-center p-4 h-32 bg-muted/50">
          <div className="w-24 h-24 relative bg-muted rounded-sm flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-muted-foreground">Not Playing</h3>
            <p className="text-sm text-muted-foreground">Play something on Spotify</p>
          </div>
        </Card>
      </div>
    )
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).getFullYear()
  }

  return (
    <div className={className}>
      <Card className="flex p-4 h-32 bg-card hover:bg-accent transition-colors">
        <div className="relative w-24 h-24 group">
          <Image
            src={currentTrack.item.album.images[0]?.url}
            alt={currentTrack.item.name}
            fill
            className="object-cover rounded-sm"
          />
          <Link 
            href={currentTrack.item.external_urls.spotify}
            target="_blank"
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4 text-white" />
          </Link>
        </div>

        <div className="ml-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 mr-4">
                <h3 className="font-semibold truncate max-w-full">
                  {currentTrack.item.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate max-w-full">
                  {currentTrack.item.artists.map(artist => artist.name).join(", ")}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSkip('prev')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {currentTrack.is_playing ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSkip('next')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTrack.item.duration_ms)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end text-xs text-muted-foreground">
            <div className="flex-1 min-w-0 mr-4">
              <p className="font-medium">Album</p>
              <p className="truncate">{currentTrack.item.album.name}</p>
            </div>
            <div className="flex gap-4 whitespace-nowrap">
              <div>
                <p className="font-medium">Year</p>
                <p>{formatDate(currentTrack.item.album.release_date)}</p>
              </div>
              <div>
                <p className="font-medium">Popularity</p>
                <p>{currentTrack.item.popularity}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 