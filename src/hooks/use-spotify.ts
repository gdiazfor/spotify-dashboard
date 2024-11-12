import { useAuthStore } from '@/store/auth-store'
import { refreshAccessToken } from '@/lib/spotify-service'
import { useMemo } from 'react'

export function useSpotify() {
  const { spotify, setSpotifyAuth, clearSpotifyAuth } = useAuthStore()

  const fetchWithToken = useMemo(() => {
    return async (url: string, options: RequestInit = {}) => {
      if (!spotify.accessToken) {
        throw new Error('No access token available')
      }

      // Check if token needs refresh
      if (spotify.expiresAt && spotify.expiresAt <= Date.now() && spotify.refreshToken) {
        try {
          const refreshedTokens = await refreshAccessToken(spotify.refreshToken)
          setSpotifyAuth({
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token || spotify.refreshToken,
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
          })
        } catch (error) {
          clearSpotifyAuth()
          throw new Error(`Failed to refresh token: ${error}`)
        }
      }

      const response = await fetch(`https://api.spotify.com/v1${url}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${spotify.accessToken}`,
        },
      })

      if (response.status === 204) {
        return response;
      }

      if (response.ok) {
        return response.json();
      }

      throw new Error(`Spotify API error: ${response.statusText}`);
    }
  }, [spotify.accessToken, spotify.refreshToken, spotify.expiresAt, setSpotifyAuth, clearSpotifyAuth])

  return {
    fetchWithToken,
    isAuthenticated: !!spotify.accessToken
  }
} 