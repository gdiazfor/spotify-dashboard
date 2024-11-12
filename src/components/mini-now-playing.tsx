"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSpotify } from "@/hooks/use-spotify"
import { Volume2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

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
  const { fetchWithToken } = useSpotify()
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)
  const [error, setError] = useState<boolean>(false)

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
              <h3 className="font-semibold truncate">
                {currentTrack.item.name}
              </h3>
              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                {formatTime(currentTrack.item.duration_ms)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {currentTrack.item.artists.map(artist => artist.name).join(", ")}
            </p>
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