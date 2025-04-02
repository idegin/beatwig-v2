import Image from "next/image"
import Link from "next/link"
import { getTMDBImageUrl, formatRating, extractYear, isMovie, getMediaTitle, getMediaDate } from "@/lib/utils"
import { POSTER_SIZES } from "@/lib/constants"
import type { Movie, TVShow } from "@/lib/tmdb"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface MovieCardProps {
  media: Movie | TVShow
  priority?: boolean
}

export function MovieCard({ media, priority = false }: MovieCardProps) {
  if (!media) return null

  const title = getMediaTitle(media)
  const releaseDate = getMediaDate(media)
  const linkPath = isMovie(media) ? `/movie/${media.id}` : `/tv/${media.id}`

  // Use placeholder if no poster is available
  const posterUrl = media.poster_path
    ? getTMDBImageUrl(media.poster_path, POSTER_SIZES.MEDIUM)
    : "/placeholder.svg?height=450&width=300"

  return (
    <Link href={linkPath} className="group movie-card">
      <div className="aspect-[2/3] w-full relative rounded-lg overflow-hidden">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {media.vote_average > 0 && (
                <Badge variant="outline" className="bg-black/50 text-white border-none">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {formatRating(media.vote_average)}
                </Badge>
              )}
              {releaseDate && <span className="text-xs text-white/80">{extractYear(releaseDate)}</span>}
              {media.media_type && (
                <Badge variant="outline" className="bg-primary/70 text-white border-none text-[10px] py-0 h-5">
                  {media.media_type === "movie" ? "Movie" : "TV"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

