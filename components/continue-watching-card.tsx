"use client"

import Image from "next/image"
import Link from "next/link"
import { getTMDBImageUrl, formatRating, isMovie, getMediaTitle } from "@/lib/utils"
import { BACKDROP_SIZES } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"
import { Badge } from "@/components/ui/badge"
import { Star, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ContinueWatchingCardProps {
  media: Movie | TVShow
  progress: number
  episodeInfo?: {
    season: number
    episode: number
    name: string
  }
  priority?: boolean
}

export default function ContinueWatchingCard({ 
  media, 
  progress, 
  episodeInfo,
  priority = false 
}: ContinueWatchingCardProps) {
  if (!media) return null

  const title = getMediaTitle(media)
  const type = media.media_type;
  const linkPath = `/${type}/${media.id}`
  
  // Add season and episode to link path for TV shows
  const watchPath = `/${type}/${media.id}/watch${
    type === "tv" && episodeInfo 
      ? `?season=${episodeInfo.season}&episode=${episodeInfo.episode}` 
      : ""
  }`

  // Use backdrop for continue watching cards
  const backdropUrl = media.backdrop_path
    ? getTMDBImageUrl(media.backdrop_path, BACKDROP_SIZES.MEDIUM)
    : "/placeholder-wide.svg?height=300&width=500"

  return (
    <div className="group relative block rounded-lg overflow-hidden">
      {/* Details link */}
      <Link href={linkPath} className="absolute inset-0 z-10 opacity-0">
        <span className="sr-only">View details for {title}</span>
      </Link>
      
      <div className="aspect-video w-full relative">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors">
          {/* Play button - links directly to the watch page */}
          <Link href={watchPath} className="absolute inset-0 flex items-center justify-center z-20">
            <div className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </Link>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white line-clamp-1">{title}</h3>
            
            {episodeInfo && (
              <p className="text-sm text-white/90 mb-1">
                S{episodeInfo.season} E{episodeInfo.episode}: {episodeInfo.name}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-1 mb-2">
              {media.vote_average > 0 && (
                <Badge variant="outline" className="bg-black/50 text-white border-none">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {formatRating(media.vote_average)}
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/70 text-white border-none text-[10px] py-0 h-5">
                {type === "movie" ? "Movie" : "TV"}
              </Badge>
            </div>
            
            <Progress value={progress} className="h-1 bg-white/30" indicatorClassName="bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
