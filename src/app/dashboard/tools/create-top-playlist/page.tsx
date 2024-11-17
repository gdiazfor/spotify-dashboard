"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { SaveIcon, ShuffleIcon, RotateCcwIcon, PlayIcon, PauseIcon } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useSpotify } from "@/hooks/use-spotify"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumImage: string
  albumImages?: { 
    url: string
    height: number
    width: number 
  }[]
  duration_ms: number
  plays: number
  isRemoved?: boolean
  preview_url: string | null
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { 
    name: string
    images: { url: string; height: number; width: number }[]
  }
  duration_ms: number
  preview_url: string | null
}

export default function CreateTopPlaylistPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [timeRange, setTimeRange] = useState<string>("short_term")
  const [isLoading, setIsLoading] = useState(true)
  const { fetchWithToken } = useSpotify()
  const [originalTracks, setOriginalTracks] = useState<Track[]>([])
  const [isShuffled, setIsShuffled] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true)
      try {
        const response = await fetchWithToken(
          `/me/top/tracks?limit=50&time_range=${timeRange}`
        )

        const formattedTracks: Track[] = response.items.map((item: SpotifyTrack) => ({
          id: item.id,
          name: item.name,
          artist: item.artists[0].name,
          album: item.album.name,
          albumImage: item.album.images[2]?.url || '',
          albumImages: item.album.images,
          duration_ms: item.duration_ms,
          plays: 0,
          isRemoved: false,
          preview_url: item.preview_url
        }))

        console.log('Tracks with previews:', formattedTracks.filter(t => t.preview_url).length)
        setTracks(formattedTracks)
        setOriginalTracks(formattedTracks)
        setIsShuffled(false)
      } catch (error) {
        console.error('Failed to fetch tracks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [timeRange, fetchWithToken])

  const shuffleTracks = () => {
    setTracks(tracks => {
      const activeTracks = tracks.filter(track => !track.isRemoved)
      const removedTracks = tracks.filter(track => track.isRemoved)

      const shuffled = [...activeTracks]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      setIsShuffled(true)
      return [...shuffled, ...removedTracks]
    })
  }

  const resetOrder = () => {
    setTracks(originalTracks)
    setIsShuffled(false)
  }

  const handlePreview = (trackId: string, previewUrl: string | null, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent dialog from opening

    if (!previewUrl) return

    if (playingTrackId === trackId) {
      // Stop current track
      audio?.pause()
      setPlayingTrackId(null)
      setAudio(null)
    } else {
      // Stop previous track if any
      audio?.pause()
      
      // Play new track
      const newAudio = new Audio(previewUrl)
      newAudio.addEventListener('ended', () => {
        setPlayingTrackId(null)
        setAudio(null)
      })
      newAudio.play()
      setPlayingTrackId(trackId)
      setAudio(newAudio)
    }
  }

  // Add loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card className="p-6">
          <div className="flex gap-6">
            <Skeleton className="w-[300px] h-[300px] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-96" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="mt-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-[60%]" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const totalDuration = tracks.reduce((acc, track) => acc + track.duration_ms, 0)
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const timeRangeOptions = {
    short_term: "Last Month",
    medium_term: "Last 6 Months",
    long_term: "All Time"
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6 border-none bg-transparent">
        <div className="flex gap-6">
          {/* Playlist Cover */}
          <div className="w-[250px] h-[250px] bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg shadow-lg flex items-center justify-center">
            <span className="text-4xl font-bold text-white">Top Tracks</span>
          </div>

          <div className="flex-1">
            {/* Header with Time Range */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Public Playlist</p>
              
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Time Range:</span>
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range">
                      {timeRangeOptions[timeRange as keyof typeof timeRangeOptions]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Last month</SelectItem>
                    <SelectItem value="medium_term">Last 6 Months</SelectItem>
                    <SelectItem value="long_term">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Playlist Info */}
            <div className="space-y-2">
              <h1 className="text-5xl font-bold">Your Top Tracks</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{tracks.length} songs,</span>
                <span>{formatDuration(totalDuration)} total</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-20">
            <Button size="lg" className="gap-2">
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Playlist
            </Button>
            <Button 
                size="lg" 
                variant="outline" 
                className="gap-2"
                onClick={shuffleTracks}
            >
                <ShuffleIcon className="mr-2 h-4 w-4" />
                Shuffle Playlist
            </Button>
            {isShuffled && (
                <Button 
                size="lg" 
                variant="ghost" 
                className="gap-2"
                onClick={resetOrder}
                >
                <RotateCcwIcon className="mr-2 h-4 w-4" />
                Reset Order
                </Button>
                )}
                </div>
          </div>
        </div>

        {/* Tracks Table */}
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Album</TableHead>
                <TableHead className="w-24">Duration</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track, index) => (
                <Dialog key={track.id}>
                  <DialogTrigger asChild>
                    <TableRow 
                      className={cn(
                        "cursor-pointer hover:bg-accent/50 transition-colors",
                        track.isRemoved && "opacity-50"
                      )}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {track.preview_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handlePreview(track.id, track.preview_url, e)}
                          >
                            {playingTrackId === track.id ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={track.albumImage}
                            alt={track.album}
                            width={60}
                            height={60}
                            className="rounded"
                          />
                          <div>
                            <p className="font-medium">{track.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {track.artist}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {track.album}
                      </TableCell>
                      <TableCell>
                        {formatDuration(track.duration_ms)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent dialog from opening
                            setTracks(tracks.map(t => 
                              t.id === track.id ? { ...t, isRemoved: !t.isRemoved } : t
                            ))
                          }}
                        >
                          {track.isRemoved ? "+" : "×"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[1050px]">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Track Details: {track.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-[500px_1fr] gap-6">
                      {/* Large Album Cover */}
                      <div>
                        <Image
                          src={track.albumImages?.[0]?.url || track.albumImage}
                          alt={track.album}
                          width={500}
                          height={500}
                          className="rounded-lg shadow-md"
                        />
                      </div>

                      {/* Track Information */}
                      <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground mb-2">Track</p>
                        <h1 className="text-4xl font-bold mb-2">{track.name}</h1>
                        <p className="text-lg text-muted-foreground">{track.artist}</p>
                        
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{track.album}</span>
                          <span>•</span>
                          <span>{formatDuration(track.duration_ms)}</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
