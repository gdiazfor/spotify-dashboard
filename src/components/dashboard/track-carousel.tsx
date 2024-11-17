"use client"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { useSpotify } from "@/hooks/use-spotify"
import { Play, ExternalLink, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, LayoutList } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function TrackCarousel({ timeRange }: { timeRange: string }) {
  const [tracks, setTracks] = useState<any[]>([])
  const { fetchWithToken } = useSpotify()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [viewType, setViewType] = useState<'large' | 'small'>('large')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchWithToken(`/me/top/tracks?limit=50&time_range=${timeRange}`)
      .then(data => setTracks([...data.items, ...data.items]))
      .finally(() => setIsLoading(false))
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

  // Skeleton loaders for both views
  const LargeSkeleton = () => (
    <div className="flex-shrink-0 w-[20vw] min-w-[100px] max-w-[300px] pl-8 pr-1 select-none pt-3">
      <div className="relative aspect-square w-full mb-2">
        <Skeleton className="absolute -left-2 -top-2 w-6 h-6 rounded-full" />
        <Skeleton className="w-full h-full rounded-md" />
      </div>
      <Skeleton className="w-4/5 h-5 mb-2" />
      <Skeleton className="w-2/3 h-4" />
    </div>
  )

  const SmallSkeleton = () => (
    <div className="flex-shrink-0 w-[300px] pl-8 pr-1 select-none pt-3">
      <div className="flex items-center gap-4 border border-zinc-100/10 rounded-md p-2">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Skeleton className="absolute -left-2 -top-2 w-5 h-5 rounded-full" />
          <Skeleton className="w-full h-full rounded-md" />
        </div>
        <div className="flex-1">
          <Skeleton className="w-4/5 h-5 mb-2" />
          <Skeleton className="w-2/3 h-4 mb-1" />
          <Skeleton className="w-1/3 h-3" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full overflow-hidden py-2 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold">Most listened tracks</h2>
          <Tabs defaultValue="large" onValueChange={(value) => setViewType(value as 'large' | 'small')}>
            <TabsList className="bg-background/10">
              <TabsTrigger value="large" className="data-[state=active]:bg-accent">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="small" className="data-[state=active]:bg-accent">
                <LayoutList className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button
          variant="outline"
          className="bg-transparent text-[#1DB954] border-[#1DB954] hover:bg-[#1DB954]"
          asChild
        >
          <a href="/dashboard/tools/create-top-playlist">Create playlist</a>
        </Button>
      </div>

      <div className="overflow-hidden relative hover:pause-animation">
        <div
          ref={containerRef}
          className="flex animate-scroll"
          style={{ width: 'fit-content' }}
        >
          {isLoading ? (
            // Show 10 skeleton items while loading
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                {viewType === 'large' ? <LargeSkeleton /> : <SmallSkeleton />}
              </div>
            ))
          ) : (
            // Regular track items
            tracks.map((track, i) => (
              <div 
                key={`${track.id}-${i}`}
                className={viewType === 'large' 
                  ? "flex-shrink-0 w-[20vw] min-w-[100px] max-w-[300px] pl-8 pr-1 select-none pt-3"
                  : "flex-shrink-0 w-[300px] pl-8 pr-1 select-none pt-3"
                }
              >
                {viewType === 'large' ? (
                  <>
                    <div className="relative aspect-square w-full mb-2 group">
                      <span className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-sm font-medium text-muted-foreground z-10">
                        {(i % (tracks.length / 2)) + 1}
                      </span>
                      <Image
                        src={track.album.images[0].url}
                        alt={track.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 640px) 40vw, 
                               (max-width: 1024px) 25vw, 
                               20vw"
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
                  </>
                ) : (
                  // Small view (new design)
                  <div className="flex items-center gap-4 group border border-zinc-100/10 rounded-md p-2">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <span className="absolute -left-2 -top-2 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center text-xs font-medium text-muted-foreground z-10">
                        {(i % (tracks.length / 2)) + 1}
                      </span>
                      <Image
                        src={track.album.images[0].url}
                        alt={track.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="64px"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 rounded-full hover:scale-105 transition-transform ${
                            !track.preview_url ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handlePlay(track)}
                          disabled={!track.preview_url}
                          title={track.preview_url ? 'Play preview' : 'No preview available'}
                        >
                          {currentlyPlaying === track.id ? (
                            <Pause className="h-4 w-4 text-white" fill="white" />
                          ) : (
                            <Play className="h-4 w-4 text-white" fill="white" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artists[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(track.album.release_date).getFullYear()}
                      </p>
                    </div>
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}