import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const track = searchParams.get('track')
  const artist = searchParams.get('artist')

  const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

  try {
    // Search for the song
    const searchResponse = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(`${track} ${artist}`)}`,
      {
        headers: {
          Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
      }
    )
    
    const searchData = await searchResponse.json()
    const firstHit = searchData.response.hits[0]?.result

    if (!firstHit) {
      return NextResponse.json({ lyrics: "Lyrics not found" })
    }

    // Fetch the actual lyrics page
    const lyricsResponse = await fetch(firstHit.url)
    const html = await lyricsResponse.text()
    
    // Use cheerio to parse the HTML
    const $ = cheerio.load(html)
    // Target Genius lyrics containers
    const lyrics = $('[class*="Lyrics__Container"]')
      .map((i, el) => {
        const text = $(el).html()
          ?.replace(/<br>/g, '\n')  // Convert <br> to newlines
          ?.replace(/<(?!\/?br>)[^>]+>/g, '') // Remove other HTML tags
          ?.replace(/\[/g, '\n[')  // Add newline before sections
          ?.replace(/\n\n+/g, '\n') // Remove extra newlines
          ?.trim()
        return text
      })
      .get()
      .join('\n')
    
    return NextResponse.json({ 
      lyrics: lyrics.split('\n').filter(line => line.trim() !== '').join('\n') 
    })
  } catch (error) {
    console.error('Lyrics fetch error:', error)
    return NextResponse.json({ lyrics: "Error fetching lyrics" })
  }
}
