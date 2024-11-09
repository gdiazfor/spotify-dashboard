export const SPOTIFY_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:1717/callback',
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-library-read',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ].join(' ')
} 