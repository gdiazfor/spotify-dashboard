import { SPOTIFY_CONFIG } from './config'

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const codeVerifier = localStorage.getItem('code_verifier')
  if (!codeVerifier) {
    throw new Error('No code verifier found')
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    code_verifier: codeVerifier,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
} 