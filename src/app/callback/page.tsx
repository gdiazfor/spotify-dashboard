'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { exchangeCodeForTokens } from '@/lib/spotify-service'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setSpotifyAuth = useAuthStore((state) => state.setSpotifyAuth)

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          router.replace('/login')
          return
        }

        const tokens = await exchangeCodeForTokens(code)
        
        const authData = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
        }
        
        setSpotifyAuth(authData)

        setTimeout(() => {
          localStorage.removeItem('code_verifier')
          router.replace('/dashboard')
        }, 100)
      } catch (error) {
        console.error('Error during callback:', error)
        router.replace('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, setSpotifyAuth])

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">Connecting to Spotify...</h2>
      <p className="text-muted-foreground mt-2">
        Please wait while we complete the authentication
      </p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  )
} 