import { SPOTIFY_CONFIG } from './config'

function generateCodeVerifier(length: number) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function initiateSpotifyLogin() {
  const codeVerifier = generateCodeVerifier(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  
  // Store the code verifier for later use
  localStorage.setItem('code_verifier', codeVerifier)
  
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SPOTIFY_CONFIG.scopes,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
} 