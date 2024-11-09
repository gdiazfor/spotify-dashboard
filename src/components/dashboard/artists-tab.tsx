"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useSpotify } from "@/hooks/use-spotify"
import { useEffect, useState, useTransition } from "react"
import { TimeRangeSelector } from "@/components/shared/time-range-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MusicIcon } from "lucide-react"
import { ArtistDetailsModal } from "@/components/artists/artist-details-modal"

interface Artist {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  popularity: number
  followers: { total: number }
  affinity?: number
}

function ArtistSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length:  50 }).map((_, i) => (
        <Card key={i} className="relative">
          <div className="absolute top-2 left-2">
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

function ArtistCard({ artist, rank, onClick }: { artist: Artist; rank: number; onClick: () => void }) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow relative cursor-pointer" 
      onClick={onClick}
    >
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="text-sm font-bold">
          #{rank}
        </Badge>
      </div>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={artist.images[0]?.url} alt={artist.name} />
            <AvatarFallback>
              <MusicIcon className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-none mb-2">{artist.name}</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">
                {formatNumber(artist.followers.total)} followers
              </Badge>
              <Badge variant="secondary">
                {artist.popularity}% popular
              </Badge>
              {artist.affinity && (
                <Badge variant="default" className="bg-primary">
                  {artist.affinity} tracks in top 50
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {artist.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="capitalize">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ArtistsTab() {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [timeRange, setTimeRange] = useState('short_term')
  const { fetchWithToken } = useSpotify()
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const artistsData = await fetchWithToken(`/me/top/artists?limit=50&time_range=${timeRange}`)
        const tracksData = await fetchWithToken(`/me/top/tracks?limit=50&time_range=${timeRange}`)
        
        if (mounted) {
          const artistAppearances = tracksData.items.reduce((acc: { [key: string]: number }, track: any) => {
            track.artists.forEach((artist: { id: string }) => {
              acc[artist.id] = (acc[artist.id] || 0) + 1
            })
            return acc
          }, {})

          const artistsWithAffinity = artistsData.items.map((artist: Artist) => ({
            ...artist,
            affinity: artistAppearances[artist.id] || 0
          }))

          startTransition(() => {
            setTopArtists(artistsWithAffinity)
            setIsLoading(false)
          })
        }
      } catch (err) {
        const error = err as Error
        console.error('Failed to fetch data:', error.message)
        setIsLoading(false)
      }
    }

    timeoutId = setTimeout(() => {
      fetchData()
    }, 300)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [timeRange, fetchWithToken])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Top Artists</h2>
          <p className="text-sm text-muted-foreground">
            Based on your listening history. The number shows how many of their tracks appear in your top 50.
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {(isLoading || isPending) ? (
        <ArtistSkeleton />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {topArtists.map((artist, index) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              rank={index + 1}
              onClick={() => setSelectedArtist(artist)}
            />
          ))}
        </div>
      )}

      <ArtistDetailsModal
        artist={selectedArtist}
        isOpen={!!selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  )
} 