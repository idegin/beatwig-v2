"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Youtube } from "lucide-react"

interface MediaPlayerProps {
  mediaId: string
  mediaType: "movie" | "tv"
  title: string
  backUrl: string
  youtubeTrailerId?: string
}

export function MediaPlayer({ mediaId, mediaType, title, backUrl, youtubeTrailerId }: MediaPlayerProps) {
  const [source, setSource] = useState<"vidsrc" | "youtube">("vidsrc")
  // https://vidsrc.xyz/embed/movie/1126166
  // https://vidsrc.xyz/embed/movie/1126166
  // Construct the embed URLs
  // const vidsrcUrl = `https://vidsrc.xyz/embed/${mediaType}/${mediaId}`;
   const vidsrcUrl = `https://vidsrc.xyz/embed/${mediaType}/${mediaId}`
  const youtubeUrl = youtubeTrailerId
    ? `https://www.youtube.com/embed/${youtubeTrailerId}?autoplay=1&modestbranding=1`
    : null

  return (
    <div className="relative min-h-screen bg-black">
      {/* Back button and source toggle */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Button asChild variant="outline" className="bg-black/50 backdrop-blur-sm hover:bg-black/70">
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {mediaType === "movie" ? "movie" : "TV show"}
          </Link>
        </Button>

        {youtubeTrailerId && (
          <Button
            variant={source === "youtube" ? "default" : "outline"}
            size="sm"
            className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            onClick={() => setSource("youtube")}
          >
            <Youtube className="mr-2 h-4 w-4" />
            Trailer
          </Button>
        )}

        <Button
          variant={source === "vidsrc" ? "default" : "outline"}
          size="sm"
          className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
          onClick={() => setSource("vidsrc")}
        >
          Full {mediaType === "movie" ? "Movie" : "Show"}
        </Button>
      </div>

      {/* Media player iframe */}
      <div className="absolute inset-0 flex items-center justify-center">
        <iframe
          src={vidsrcUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  )
}

