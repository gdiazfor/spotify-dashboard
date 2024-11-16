"use client"

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { useSpotify } from "@/hooks/use-spotify"

export function TrackCarousel({ timeRange }: { timeRange: string }) {
  const [tracks, setTracks] = useState<any[]>([])
  const { fetchWithToken } = useSpotify()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    fetchWithToken(`/me/top/tracks?limit=20&time_range=${timeRange}`)
      .then(data => setTracks([...data.items, ...data.items]))
  }, [timeRange, fetchWithToken])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    if (containerRef.current) {
      const startPos = e.clientX - containerRef.current.offsetLeft
      setStartX(startPos)
      setScrollLeft(containerRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    if (containerRef.current) {
      const x = e.clientX - containerRef.current.offsetLeft
      const walk = (startX - x) * 1.5  // Multiply by 1.5 to make it more responsive
      containerRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full overflow-hidden bg-black/10 py-2 mb-6">
      <h2 className="text-4xl font-bold mb-2">Most listened tracks</h2>
      <p className="text-muted-foreground mb-6">Your top tracks that defined your time</p>
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className={`flex animate-scroll hover:pause-animation ${
            isDragging ? 'cursor-grabbing animation-none' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={(e) => {
            setIsDragging(true)
            if (containerRef.current) {
              const touch = e.touches[0]
              setStartX(touch.clientX - containerRef.current.offsetLeft)
              setScrollLeft(containerRef.current.scrollLeft)
            }
          }}
          onTouchMove={(e) => {
            if (!isDragging) return
            if (containerRef.current) {
              const touch = e.touches[0]
              const x = touch.clientX - containerRef.current.offsetLeft
              const walk = (startX - x) * 1.5
              containerRef.current.scrollLeft = scrollLeft + walk
            }
          }}
          onTouchEnd={handleMouseUp}
        >
          {tracks.map((track, i) => (
            <div key={i} className="flex-shrink-0 w-48 px-4 select-none">
              <div className="relative aspect-square w-full mb-2">
                <div className="absolute -left-2 -top-2 z-10 bg-background border rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-medium">
                    {(i % (tracks.length / 2)) + 1}
                  </span>
                </div>
                <Image
                  src={track.album.images[0].url}
                  alt={track.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="256px"
                  draggable={false}
                />
              </div>
              <h3 className="font-medium truncate">{track.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artists[0].name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}