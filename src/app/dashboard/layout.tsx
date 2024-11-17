"use client"

import { memo } from "react"
import { useNowPlaying } from "@/hooks/use-now-playing";
import { ProtectedRoute } from "@/components/auth/protected-route";

const DashboardContent = memo(function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: nowPlaying } = useNowPlaying();
  const currentArtistImage = nowPlaying?.artistData?.images[0]?.url;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Now Playing Artist Banner */}
      {currentArtistImage && (
        <div className="absolute top-0 left-0 w-full h-[580px] overflow-hidden z-10">
          <div 
            className="absolute inset-0 bg-center -z-10 opacity-50"
            style={{
              backgroundImage: `url(${currentArtistImage})`,
              transition: 'background-image 0.3s ease-in-out',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,1))'
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-14 py-10 z-20">
        <div className="flex flex-col flex-1">
          {/* <header className="border-b">
            <div className="flex h-16 items-center justify-between">
            </div>
          </header> */}
          <div className="flex-1 space-y-8 py-8 pt-20">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  )
} 