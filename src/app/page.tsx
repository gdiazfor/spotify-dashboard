import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">Your Spotify Stats</h1>
      <p className="mb-8 text-muted-foreground">
        Discover your music listening patterns across platforms
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </div>
  )
}
