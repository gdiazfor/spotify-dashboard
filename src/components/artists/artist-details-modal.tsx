"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MusicIcon, Disc3Icon, UsersIcon, TrendingUpIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { useSpotify } from "@/hooks/use-spotify"

interface Artist {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  popularity: number
  followers: { total: number }
  affinity?: number
}

interface Track {
  id: string
  name: string
  album: {
    name: string
    images: { url: string }[]
  }
  popularity: number
}

interface ArtistDetailsModalProps {
  artist: Artist | null
  isOpen: boolean
  onClose: () => void
}

export function ArtistDetailsModal({ artist, isOpen, onClose }: ArtistDetailsModalProps) {
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const { fetchWithToken } = useSpotify()

  useEffect(() => {
    if (artist?.id && isOpen) {
      // Fetch top tracks
      fetchWithToken(`/artists/${artist.id}/top-tracks?market=from_token`)
        .then(data => setTopTracks(data.tracks))
        .catch(console.error)

      // Fetch related artists
      fetchWithToken(`/artists/${artist.id}/related-artists`)
        .then(data => setRelatedArtists(data.artists.slice(0, 6)))
        .catch(console.error)
    }
  }, [artist?.id, isOpen, fetchWithToken])

  if (!artist) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={artist.images[0]?.url} alt={artist.name} />
              <AvatarFallback>
                <MusicIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl mb-2">{artist.name}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {new Intl.NumberFormat().format(artist.followers.total)} followers
                </Badge>
                <Badge variant="secondary">{artist.popularity}% popularity</Badge>
                {artist.affinity && (
                  <Badge variant="default" className="bg-primary">
                    {artist.affinity} tracks in your top 50
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tracks">Top Tracks</TabsTrigger>
              <TabsTrigger value="related">Related Artists</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Genres</CardTitle>
                  <CardDescription>Artist's musical styles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="capitalize">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="h-4 w-4" />
                      <CardTitle className="text-sm">Followers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat().format(artist.followers.total)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <TrendingUpIcon className="h-4 w-4" />
                      <CardTitle className="text-sm">Popularity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{artist.popularity}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Disc3Icon className="h-4 w-4" />
                      <CardTitle className="text-sm">Your Top Tracks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{artist.affinity || 0}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tracks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Tracks</CardTitle>
                  <CardDescription>Most played songs by {artist.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTracks.map((track, index) => (
                      <div key={track.id} className="flex items-center space-x-4">
                        <span className="text-muted-foreground w-4">{index + 1}.</span>
                        <img 
                          src={track.album.images[2]?.url} 
                          alt={track.album.name}
                          className="h-10 w-10 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.album.name}
                          </p>
                        </div>
                        <Badge variant="secondary">{track.popularity}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Similar Artists</CardTitle>
                  <CardDescription>Artists you might like if you enjoy {artist.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {relatedArtists.map((related) => (
                      <div key={related.id} className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={related.images[0]?.url} alt={related.name} />
                          <AvatarFallback>
                            <MusicIcon className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-none">{related.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {related.popularity}% popularity
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 