import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SpotifyAuth {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

interface AuthStore {
  spotify: SpotifyAuth
  setSpotifyAuth: (auth: SpotifyAuth) => void
  clearSpotifyAuth: () => void
  isAuthenticated: () => boolean
  _hasCheckedAuth: boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      spotify: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
      _hasCheckedAuth: false,
      setSpotifyAuth: (auth) => {
        set({ spotify: auth, _hasCheckedAuth: true })
      },
      clearSpotifyAuth: () => {
        set({
          spotify: {
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          },
          _hasCheckedAuth: true
        })
      },
      isAuthenticated: () => {
        const { spotify, _hasCheckedAuth } = get()
        if (!_hasCheckedAuth) {
          const isAuth = Boolean(
            spotify.accessToken && 
            spotify.expiresAt && 
            spotify.expiresAt > Date.now()
          )
          console.log('Initial auth check:', { 
            hasToken: !!spotify.accessToken,
            hasExpiry: !!spotify.expiresAt,
            isValid: spotify.expiresAt ? spotify.expiresAt > Date.now() : false,
            isAuth 
          })
          set({ _hasCheckedAuth: true })
          return isAuth
        }
        return Boolean(
          spotify.accessToken && 
          spotify.expiresAt && 
          spotify.expiresAt > Date.now()
        )
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 