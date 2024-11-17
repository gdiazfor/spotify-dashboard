"use client"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { useSpotify } from "@/hooks/use-spotify"
import { Play, ExternalLink, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrackCarousel({ timeRange }: { timeRange: string }) {
  const [tracks, setTracks] = useState<any[]>([])
  const { fetchWithToken } = useSpotify()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchWithToken(`/me/top/tracks?limit=50&time_range=${timeRange}`)
      .then(data => setTracks([...data.items, ...data.items]))
  }, [timeRange, fetchWithToken])

  const handlePlay = (track: any) => {
    if (!track.preview_url) return

    if (currentlyPlaying === track.id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      audioRef.current = new Audio(track.preview_url)
      audioRef.current.play()
      setCurrentlyPlaying(track.id)

      audioRef.current.onended = () => {
        setCurrentlyPlaying(null)
      }
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return (
    <div className="w-full overflow-hidden py-2 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-4xl font-bold">Most listened tracks</h2>
        <Button
          variant="outline"
          className="bg-transparent text-[#1DB954] border-[#1DB954] hover:bg-[#1DB954]"
          asChild
          >
          <a href="/dashboard/tools/create-top-playlist">Create playlist</a>
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">Your top tracks that defined your time</p>
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className="flex animate-scroll"
        >
          {tracks.map((track, i) => (
            <div key={i} className="flex-shrink-0 w-48 pl-8 pr-4 select-none pt-4">
              <div className="relative aspect-square w-full mb-2 group">
                <span className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-sm font-medium text-muted-foreground z-10">
                  {(i % (tracks.length / 2)) + 1}
                </span>
                <Image
                  src={track.album.images[0].url}
                  alt={track.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="256px"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full hover:scale-105 transition-transform ${
                      !track.preview_url ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handlePlay(track)}
                    disabled={!track.preview_url}
                    title={track.preview_url ? 'Play preview' : 'No preview available'}
                  >
                    {currentlyPlaying === track.id ? (
                      <Pause className="h-6 w-6 text-white" fill="white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" fill="white" />
                    )}
                  </Button>
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{track.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artists[0].name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}