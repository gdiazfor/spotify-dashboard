"use client"

import { useSpotify } from "@/hooks/use-spotify"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Album {
  id: string
  name: string
  artists: { name: string }[]
  images: { url: string }[]
  release_date: string
  total_tracks: number
  playCount: number
  genres?: string[]
}

export function MostListenedAlbum({ timeRange }: { timeRange: string }) {
  const [topAlbums, setTopAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { fetchWithToken } = useSpotify()

  useEffect(() => {
    const fetchTopAlbums = async () => {
      setIsLoading(true)
      try {
        const response = await fetchWithToken(`/me/top/tracks?limit=50&time_range=${timeRange}`)
        
        // Count album occurrences
        const albumCounts = response.items.reduce((acc: { [key: string]: Album }, track: any) => {
          const albumId = track.album.id
          if (!acc[albumId]) {
            acc[albumId] = {
              id: albumId,
              name: track.album.name,
              artists: track.album.artists,
              images: track.album.images,
              release_date: track.album.release_date,
              total_tracks: track.album.total_tracks,
              playCount: 0
            }
          }
          acc[albumId].playCount++
          return acc
        }, {})

        // Convert to array and sort by play count
        const sortedAlbums = Object.values(albumCounts)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 25)

        setTopAlbums(sortedAlbums)
      } catch (error) {
        console.error('Failed to fetch top albums:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopAlbums()
  }, [timeRange, fetchWithToken])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!topAlbums.length) {
    return <div>No album data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Top Album */}
      <div className="flex flex-col">
        <div className="relative w-full aspect-square">
          <Image
            draggable={false}
            src={topAlbums[0].images[0]?.url}
            alt={topAlbums[0].name}
            fill
            className="object-cover pb-2 rounded-md"
            sizes="(max-width: 768px) 100vw, 288px"
            priority
          />
        </div>
        <div className="p-6 pt-2 text-center">
          <h3 className="text-xl font-bold mb-2">
            {topAlbums[0].name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {topAlbums[0].artists[0].name}
          </p>
        </div>
      </div>

      {/* Other Top Albums */}
      <div className="space-y-4">
        {topAlbums.slice(1).map((album, index) => (
          <div key={album.id} className="flex items-center space-x-4 group">
            <div className="relative h-16 w-16 flex-shrink-0">
              <Image
                draggable={false}
                src={album.images[2]?.url || album.images[0]?.url}
                alt={album.name}
                fill
                className="object-cover rounded"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-none group-hover:text-primary transition-colors truncate">
                {album.name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {album.artists[0].name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {album.playCount} plays • {album.total_tracks} tracks
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
