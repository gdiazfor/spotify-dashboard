"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSpotify } from "../hooks/use-spotify"
import { Volume2, ExternalLink, SkipBack, Pause, Play, SkipForward } from "lucide-react"
import Link from "next/link"

interface CurrentTrack {
  item: {
    name: string
    artists: { name: string; external_urls: { spotify: string } }[]
    album: {
      name: string
      images: { url: string }[]
      external_urls: { spotify: string }
    }
    external_urls: { spotify: string }
    duration_ms: number
  }
  is_playing: boolean
  progress_ms: number
  device: {
    name: string
    volume_percent: number
  }
}

interface Lyrics {
  lyrics: string
}

interface SpotifyDevice {
  id: string
  is_active: boolean
  // Add other device properties if needed
}

export function NowPlaying() {
  const { fetchWithToken, isAuthenticated } = useSpotify()
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)
  const [lyrics, setLyrics] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentTrack = async () => {
      try {
        const data = await fetchWithToken('/me/player/currently-playing')
        if (!data) {
          setError(true)
          setCurrentTrack(null)
          return
        }
        setError(false)
        setCurrentTrack(data)
      } catch {
        setError(true)
        setCurrentTrack(null)
      }
    }

    fetchCurrentTrack()
    const interval = setInterval(fetchCurrentTrack, 10000)
    return () => clearInterval(interval)
  }, [fetchWithToken])

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentTrack?.item) return
      try {
        const response = await fetch(`/api/lyrics?track=${currentTrack.item.name}&artist=${currentTrack.item.artists[0].name}`)
        const data: Lyrics = await response.json()
        setLyrics(data.lyrics)
      } catch (error) {
        console.error('Failed to fetch lyrics:', error)
      }
    }

    fetchLyrics()
  }, [currentTrack?.item])

  useEffect(() => {
    if (!isAuthenticated) return

    const getDevices = async () => {
      try {
        const response = await fetchWithToken('/me/player/devices')
        if (!response.ok) {
          console.error('Failed to fetch devices:', response.statusText)
          return
        }
        const data = await response.json()
        const activeDevice = data.devices.find((d: SpotifyDevice) => d.is_active)
        if (activeDevice) {
          setDeviceId(activeDevice.id)
        }
      } catch (error) {
        console.error('Failed to get devices:', error)
      }
    }
    
    getDevices()
    const interval = setInterval(getDevices, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchWithToken])

  const handlePlayPause = async () => {
    if (!isAuthenticated || !deviceId) {
      console.error('Not authenticated or no active device')
      return
    }

    try {
      const response = await fetchWithToken(
        `/me/player/${currentTrack?.is_playing ? 'pause' : 'play'}`,
        { 
          method: 'PUT',
          body: JSON.stringify({ device_id: deviceId })
        }
      )
      if (!response.ok) {
        console.error('Failed to toggle playback:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error)
    }
  }

  const handleSkip = async (direction: 'prev' | 'next') => {
    if (!isAuthenticated || !deviceId) {
      console.error('Not authenticated or no active device')
      return
    }

    try {
      const response = await fetchWithToken(
        `/me/player/${direction === 'prev' ? 'previous' : 'next'}`,
        { 
          method: 'POST',
          body: JSON.stringify({ device_id: deviceId })
        }
      )
      if (!response.ok) {
        console.error('Failed to skip track:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to skip track:', error)
    }
  }

  if (error || !currentTrack?.item) {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full aspect-square relative bg-muted rounded-sm flex items-center justify-center">
          <Volume2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="flex flex-col flex-1 p-6">
          <h2 className="text-2xl font-bold text-muted-foreground">Not Playing</h2>
          <p className="text-sm text-muted-foreground">Play something on Spotify to see it here</p>
        </div>
      </div>
    )
  }

  const progress = (currentTrack.progress_ms / currentTrack.item.duration_ms) * 100
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="w-full aspect-square relative group">
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
      
      <div className="flex flex-col flex-1 p-6 min-h-0">
        <div className="flex justify-center gap-8 mb-4">
          <button
            onClick={() => handleSkip('prev')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            onClick={handlePlayPause}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {currentTrack?.is_playing ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => handleSkip('next')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold truncate pr-4">
            {currentTrack.item.name}
          </h2>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(currentTrack.progress_ms)} / {formatTime(currentTrack.item.duration_ms)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground truncate mb-2">
          {currentTrack.item.artists.map(artist => artist.name).join(", ")}
        </p>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary mt-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Lyrics - scrollable container */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-0 pr-2">
          <div className="text-sm text-muted-foreground whitespace-pre-line h-full">
            {lyrics ? lyrics.split('\n').map((line, i) => (
              <p key={i} className="mb-1">
                {line}
              </p>
            )) : "No lyrics available"}
          </div>
        </div>
      </div>
    </div>
  )
}
