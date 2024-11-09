import { Play, Pause } from "lucide-react"
import { useState } from "react"

interface PlayButtonProps {
  previewUrl: string | null
}

export function PlayButton({ previewUrl }: PlayButtonProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    if (!previewUrl) return

    if (audio) {
      audio.pause()
      setAudio(null)
      setIsPlaying(false)
    } else {
      const newAudio = new Audio(previewUrl)
      newAudio.play()
      setIsPlaying(true)
      newAudio.addEventListener('ended', () => {
        setAudio(null)
        setIsPlaying(false)
      })
      setAudio(newAudio)
    }
  }

  if (!previewUrl) return null

  return (
    <button
      onClick={handlePlay}
      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {isPlaying ? (
        <Pause className="w-8 h-8 text-white" fill="white" />
      ) : (
        <Play className="w-8 h-8 text-white" fill="white" />
      )}
    </button>
  )
} 