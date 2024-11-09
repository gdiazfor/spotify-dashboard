import { motion } from "framer-motion"

interface Artist {
  name: string
  rank: number
  popularity: number
}

export function ArtistBubbles({ artists }: { artists: Artist[] }) {
  return (
    <div className="relative h-full w-full">
      {artists.map((artist, i) => {
        // Calculate size based on rank (1-50)
        const size = Math.max(30, 150 - (artist.rank * 2.5))
        // Random position within container
        const x = Math.random() * 80 // percentage
        const y = Math.random() * 80

        return (
          <motion.div
            key={artist.name}
            className="absolute rounded-full flex items-center justify-center text-center bg-accent hover:bg-accent/40 cursor-pointer transition-colors"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
              fontSize: `${Math.max(10, size / 8)}px`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="p-2">
              <div className="font-medium truncate">{artist.name}</div>
              <div className="text-xs text-muted-foreground">#{artist.rank}</div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 