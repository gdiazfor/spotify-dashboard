"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpotify } from "@/hooks/use-spotify"
import { useEffect, useState, useTransition } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeRangeSelector } from "@/components/shared/time-range-selector"
import { WandIcon, RadioIcon, BrainCircuitIcon, UsersIcon, ListMusicIcon, HistoryIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayButton } from "@/components/shared/play-button"
import { NowPlaying } from "@/components/now-playing"
import { ArtistsTab } from "@/components/dashboard/artists-tab"
import { UserNav } from "@/components/layout/user-nav"
import { Badge } from "@/components/ui/badge"
import { MiniNowPlaying } from "@/components/mini-now-playing"
import Image from 'next/image'
import { MostListenedAlbum } from "@/components/dashboard/most-listened-album"
import { TrackCarousel } from "@/components/dashboard/track-carousel"
import { MostListenedArtists } from "@/components/dashboard/most-listened-artists"

interface TopTrack {
  name: string
  artists: { name: string }[]
  album: { 
    name: string
    images: { url: string }[]
  }
  popularity: number
  preview_url: string | null
  id: string
}

interface TopArtist {
  id: string
  name: string
  images: { url: string }[]
  popularity: number
  genres: string[]
  followers: { total: number }
  affinity?: number  // Optional since it might be calculated separately
}

interface ListeningStats {
  uniqueTracks: number
  totalTracks: number
  avgPopularity: number
  timeRange: string
}

interface ToolCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

interface RecentTrack {
  track: {
    name: string
    artists: { name: string }[]
    album: {
      name: string
      images: { url: string }[]
    }
    preview_url: string | null
  }
  played_at: string
}

const musicTools: ToolCard[] = [
  {
    title: "Create Top Tracks Playlist",
    description: "Generate a playlist with your most played songs from your selected time range",
    icon: <ListMusicIcon className="h-6 w-6" />,
    href: "/dashboard/tools/create-top-playlist",
    color: "text-indigo-500"
  },
  {
    title: "Smart Playlist Generator",
    description: "Create personalized playlists based on your music taste",
    icon: <ListMusicIcon className="h-6 w-6" />,
    href: "/dashboard/tools/playlist-generator",
    color: "text-purple-500"
  },
  {
    title: "Artist Discovery",
    description: "Find similar artists you've never listened to based on your favorites",
    icon: <UsersIcon className="h-6 w-6" />,
    href: "/dashboard/tools/artist-discovery",
    color: "text-orange-500"
  },
  {
    title: "Music Discovery",
    description: "Find new artists and tracks based on your favorites",
    icon: <WandIcon className="h-6 w-6" />,
    href: "/dashboard/tools/discover",
    color: "text-blue-500"
  },
  {
    title: "Mood Radio",
    description: "Generate playlists based on your current mood",
    icon: <RadioIcon className="h-6 w-6" />,
    href: "/dashboard/tools/mood-radio",
    color: "text-pink-500"
  },
  {
    title: "AI Music Assistant",
    description: "Get personalized music recommendations using AI",
    icon: <BrainCircuitIcon className="h-6 w-6" />,
    href: "/dashboard/tools/ai-assistant",
    color: "text-green-500"
  },
]

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
}

function ToolCard({ tool }: { tool: ToolCard }) {
  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className={`${tool.color} bg-background p-2 rounded-lg`}>
            {tool.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{tool.title}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function TracksSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function TopTracksContent({ tracks }: { tracks: TopTrack[] }) {
  return (
    <div className="space-y-4">
      {tracks.map((track, i) => (
        <div key={i} className="flex items-center space-x-4 group">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Image 
              src={track.album.images[2]?.url || track.album.images[0]?.url} 
              alt={track.album.name}
              fill
              className="object-cover rounded shadow-sm"
              sizes="48px"
            />
            <PlayButton previewUrl={track.preview_url} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-none group-hover:text-primary transition-colors truncate">
              {track.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {track.artists[0].name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {track.popularity}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ArtistsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function TopArtistsContent({ artists }: { artists: TopArtist[] }) {
  return (
    <div className="space-y-4">
      {artists.map((artist, i) => (
        <div key={i} className="flex items-center space-x-4 group">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Image
              src={artist.images[1]?.url || artist.images[0]?.url}
              alt={artist.name}
              width={48}
              height={48}
              className="object-cover rounded-sm"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-none group-hover:text-primary transition-colors truncate">
              {artist.name}
            </p>
            <p className="text-sm text-muted-foreground">
              #{i + 1} in your top artists
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {artist.popularity}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentTracksContent({ tracks }: { tracks: RecentTrack[] }) {
  return (
    <div className="space-y-4">
      <div className="mb-8">
        <MiniNowPlaying />
      </div>
     
      {tracks.map((item, i) => (
        <div key={i} className="flex items-center space-x-4 group">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Image 
              src={item.track.album.images[2]?.url || item.track.album.images[0]?.url} 
              alt={item.track.album.name}
              fill
              className="object-cover rounded shadow-sm"
              sizes="48px"
            />
            <PlayButton previewUrl={item.track.preview_url} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium leading-none group-hover:text-primary transition-colors truncate">
              {item.track.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {item.track.artists[0].name}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.played_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const timeRangeText = {
  short_term: 'in the last 4 weeks',
  medium_term: 'in the last 6 months',
  long_term: 'of all time'
} as const;


const timeRangeTextAlt = {
    short_term: 'Your last month',
    medium_term: 'Your last 6 months',
    long_term: 'All your stats'
  } as const;

export default function DashboardPage() {
  const [, startTransition] = useTransition()
  const [topTracks, setTopTracks] = useState<TopTrack[]>([])
  const [topArtists, setTopArtists] = useState<TopArtist[]>([])
  const [timeRange, setTimeRange] = useState('short_term')
  const [, setListeningStats] = useState<ListeningStats>({
    uniqueTracks: 0,
    totalTracks: 0,
    avgPopularity: 0,
    timeRange: 'short_term'
  })
  const { fetchWithToken } = useSpotify()
  const [isLoading, setIsLoading] = useState(true);
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([])
  const [selectedTab, setSelectedTab] = useState('artists')

  useEffect(() => {
    let mounted = true
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 300)

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tracksData, artistsData, recentlyPlayed] = await Promise.all([
          fetchWithToken(`/me/top/tracks?limit=50&time_range=${timeRange}`),
          fetchWithToken(`/me/top/artists?limit=50&time_range=${timeRange}`),
          fetchWithToken(`/me/player/recently-played?limit=50`)
        ])

        if (mounted) {
          const uniqueTracks = new Set(tracksData.items.map((track: TopTrack) => track.id)).size
          const avgPopularity = Math.round(
            tracksData.items.reduce((acc: number, track: TopTrack) => acc + track.popularity, 0) / 
            tracksData.items.length
          )

          const timeRangeText = {
            short_term: 'in the last 4 weeks',
            medium_term: 'in the last 6 months',
            long_term: 'of all time'
          }

          startTransition(() => {
            setTopTracks(tracksData.items)
            setTopArtists(artistsData.items)
            console.log(artistsData.items)
            setListeningStats({
              uniqueTracks,
              totalTracks: tracksData.items.length,
              avgPopularity,
              timeRange: timeRangeText[timeRange as keyof typeof timeRangeText]
            })
            setRecentTracks(recentlyPlayed.items)
            setIsLoading(false)
          })
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setIsLoading(false)
      }
    }

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [timeRange, fetchWithToken])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold tracking-tight relative inline-block">
            {timeRangeTextAlt[timeRange as keyof typeof timeRangeTextAlt]} on Spotify
            <span className="absolute left-0 bottom-0 w-full h-2.5 bg-green-500 -z-10"></span>
        </h2>
        <div className="flex items-center space-x-2">
          <UserNav />
        </div>
      </div>

                
        <Tabs defaultValue="overview" className="space-y-4 mt-6">
            <div className="flex justify-between">   
                <TabsList>

                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="yourmonth">Your month</TabsTrigger>

                    {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
                    <TabsTrigger value="artists">Artists</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>

                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

            </div>

            <TabsContent value="overview" className="space-y-4">
              <TrackCarousel timeRange={timeRange} />
              {/* Top tracks, artists, and recent tracks */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                
                {/* 3. Recently Played */}
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col border-none bg-transparent">
                        <CardHeader className="pb-0">
                        <CardTitle className="text-3xl">Recently Played</CardTitle>
                        <CardDescription>Your listening history</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-y-auto pt-4">
                        {isLoading ? (
                            <TracksSkeleton />
                        ) : (
                            <RecentTracksContent tracks={recentTracks} />
                        )}
                        </CardContent>
                        <div className="p-6 pt-0">
                        {/* <Button 
                            variant="outline" 
                            className="w-full flex items-center gap-2 hover:bg-accent"
                            disabled
                        >
                            <HistoryIcon className="h-4 w-4" />
                            View Full History
                        </Button> */}
                        </div>
                    </Card>
                </div>


                {/* Artsist card */}
                <div className="lg:col-span-2 relative">
                    <Card className="border-none bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-3xl">Your Top Artists</CardTitle>
                            <CardDescription>
                                Most played artists  {timeRangeText[timeRange as keyof typeof timeRangeText]}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MostListenedArtists artists={topArtists} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>

                

                {/* 4. Now Playing */}
                <div className="lg:col-span-2 row-span-2">
                    <Card className="h-full flex flex-col border-none bg-transparent">
                        <CardHeader>
                            <CardTitle className="text-3xl">Your Top Albums</CardTitle>
                            <CardDescription>
                                Your most played album {timeRangeText[timeRange as keyof typeof timeRangeText]}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MostListenedAlbum timeRange={timeRange} />
                        </CardContent>
                    </Card>
                </div>

                

            </div>

            </TabsContent>

            <TabsContent value="yourmonth" className="space-y-4">


                <div className="flex gap-4 w-full">
                    
                    {/* Your most played artists */}
                    <Card className="w-1/3 bg-[#d4b63d] h-[700px]">
                        <CardHeader>
                        <CardTitle className="text-black">Your Top 5 Artists</CardTitle>
                        <CardDescription className="text-black">Most played artists in this time range</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-6">
                            {isLoading ? (
                            // Skeleton loading state
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-6">
                                <div className="text-4xl font-bold text-muted-foreground w-8 ml-3">{i + 1}</div>
                                <Skeleton className="h-24 w-24 rounded-sm" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                                </div>
                            ))
                            ) : (
                            // Actual content
                            topArtists.slice(0, 5).map((artist, i) => (
                                <div key={artist.id} className="flex items-center gap-6 group">
                                <div className="text-4xl font-bold w-8 text-black ml-3">{i + 1}</div>
                                <div className="relative aspect-square w-24 flex-shrink-0">
                                    <Image
                                    src={artist.images[1]?.url || artist.images[0]?.url}
                                    alt={artist.name}
                                    fill
                                    className="object-cover rounded-sm"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-black text-xl font-bold leading-none group-hover:text-primary transition-colors mb-2 truncate">
                                    {artist.name}
                                    </p>
                                    <p className="text-black text-base truncate">
                                    {artist.genres[0] || 'No genre available'}
                                    </p>
                                </div>
                                </div>
                            ))
                            )}
                        </div>
                        </CardContent>
                    </Card>

                    {/* <Card className="w-1/3 bg-[#1DB954] h-[700px]">
                        <CardHeader>
                            <CardTitle className="text-black">Most Listened Artist</CardTitle>
                            <CardDescription className="text-black">Your #1 artist this month</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center px-6">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-48 w-48 rounded-full" />
                                    <Skeleton className="h-6 w-32 mx-auto" />
                                </div>
                            ) : (
                                topArtists[0] && (
                                    <>
                                        <div className="relative aspect-square w-full max-w-[288px] mb-4">
                                            <Image
                                                src={topArtists[0].images[0]?.url}
                                                alt={topArtists[0].name}
                                                fill
                                                className="object-cover rounded-lg"
                                                sizes="(max-width: 768px) 100vw, 288px"
                                                priority
                                            />
                                        </div>
                                        <h3 className="text-2xl font-bold text-black mb-2">
                                            {topArtists[0].name}
                                        </h3>
                                        <div className="space-y-2 text-black">
                                            <p className="text-sm">
                                                Top Genre: <span className="font-medium">{topArtists[0].genres[0]}</span>
                                            </p>
                                            <p className="text-sm">
                                                {topArtists[0].affinity} tracks in your top 50
                                            </p>
                                            <div className="flex gap-2 justify-center mt-2">
                                                <Badge variant="outline" className="bg-black/10">
                                                    {formatNumber(topArtists[0].followers.total)} followers
                                                </Badge>
                                                <Badge variant="outline" className="bg-black/10">
                                                    {topArtists[0].popularity}% popularity
                                                </Badge>
                                            </div>
                                        </div>
                                    </>
                                )
                            )}
                        </CardContent>
                    </Card> */}


                    {/* 4. Now Playing */}
                    <div className="lg:col-span-2 row-span-2">
                        <Card className="h-full flex flex-col">
                            <NowPlaying />
                        </Card>
                    </div>

                    <div className="flex flex-col w-1/3 h-fit gap-4">
                    
                        {/* Your listening history */}
                        <Card className="w-full h-fit flex flex-col">
                            <CardHeader>
                            <CardTitle>Recently Played</CardTitle>
                            <CardDescription>Your listening history</CardDescription>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto pt-4">
                            {isLoading ? (
                                <TracksSkeleton />
                            ) : (
                                
                                <RecentTracksContent tracks={recentTracks} />
                            )}
                            </CardContent>
                            <div className="p-6 pt-0">
                            <Button 
                                variant="outline" 
                                className="w-full flex items-center gap-2 hover:bg-accent"
                                disabled
                            >
                                <HistoryIcon className="h-4 w-4" />
                                View Full History
                            </Button>
                            </div>
                        </Card>
                    </div>
                    
                </div>

            </TabsContent>

            


            <TabsContent value="artists" className="space-y-4">
            <ArtistsTab />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
            <Card>
                <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
            </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                {musicTools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                    <ToolCard tool={tool} />
                </Link>
                ))}
            </div>

            {/* <Card>
                <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>More tools are being developed</CardDescription>
                </CardHeader>
                <CardContent>
                <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                    <li>Playlist Analyzer</li>
                    <li>Music Time Machine</li>
                    <li>Social Music Sharing</li>
                    <li>Advanced Genre Explorer</li>
                </ul>
                </CardContent>
            </Card> */}
            </TabsContent>
        </Tabs>


      
    </div>
  )
}