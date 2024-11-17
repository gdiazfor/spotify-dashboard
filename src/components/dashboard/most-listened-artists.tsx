import { useState } from 'react'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtistDetailsModal } from "@/components/artists/artist-details-modal"

interface Artist {
  id: string
  name: string
  images: { url: string }[]
  popularity: number
  genres: string[]
  followers: { total: number }
}

interface MostListenedArtistsProps {
  artists: Artist[]
  isLoading: boolean
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
}

export function MostListenedArtists({ artists, isLoading }: MostListenedArtistsProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArtistClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="text-4xl font-bold text-muted-foreground w-8">{i + 1}</div>
              <Skeleton className="h-24 w-24 rounded-sm" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))
        ) : (
          // Content with click handlers
          artists.slice(0, 25).map((artist, i) => (
            i === 0 ? (
              // Top Artist Display
              <div 
                key={artist.id} 
                className="flex flex-col mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleArtistClick(artist)}
              >
                <div className="relative w-full aspect-square">
                  <Image
                    draggable={false}
                    src={artist.images[0]?.url}
                    alt={artist.name}
                    fill
                    className="object-cover pb-2 rounded-md"
                    sizes="(max-width: 768px) 100vw, 288px"
                    priority
                  />
                </div>
                <div className="p-6 pb-3 pt-2 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {artist.genres[0] || 'No genre available'}
                  </p>
                </div>
              </div>
            ) : (
              // Rest of the artists list
              <div 
                key={artist.id} 
                className="flex items-center gap-6 group cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors"
                onClick={() => handleArtistClick(artist)}
              >
                <div className="text-4xl font-bold text-muted-foreground w-8">{i + 1}</div>
                <div className="relative h-24 w-24">
                  <Image
                    draggable={false}
                    src={artist.images[1]?.url || artist.images[0]?.url}
                    alt={artist.name}
                    fill
                    className="object-cover rounded-sm"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div>
                  <p className="text-lg font-medium leading-none group-hover:text-primary transition-colors mb-2">
                    {artist.name}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {artist.genres[0] || 'No genre available'}
                  </p>
                </div>
              </div>
            )
          ))
        )}
      </div>

      <ArtistDetailsModal
        artist={selectedArtist}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 